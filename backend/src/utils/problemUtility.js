const axios = require("axios");
const { createHash } = require("crypto");
const redisClient = require("../config/redis");

const JDOODLE_URL = "https://api.jdoodle.com/v1/execute";
const CACHE_PREFIX = "codearena:jdoodle:exec:v3:";
const BATCH_DRIVER_MARKER = "CODEARENA_BATCH_MODE: EOF_MARKER";
const CASE_END_MARKER = "__CODEARENA_CASE_END__";

const LANGUAGE_MAP = {
    "c++": { language: "cpp23", versionIndex: "0" },
    java: { language: "java", versionIndex: "0" },
    javascript: { language: "nodejs", versionIndex: "0" },
};

const normalizeLanguage = (lang) => {
    if (typeof lang !== "string") return "";
    const value = lang.trim().toLowerCase();
    if (["c++", "cpp", "c++23", "cpp23"].includes(value)) return "c++";
    if (["java", "java 17", "java 21"].includes(value)) return "java";
    if (["javascript", "js", "nodejs", "node.js"].includes(value)) return "javascript";
    return value;
};

const getLanguageById = (lang) => LANGUAGE_MAP[normalizeLanguage(lang)] || null;

const hasBatchDriver = (source) =>
    typeof source === "string" && source.includes(BATCH_DRIVER_MARKER);

/* Finds the closing brace for `class Solution`, ignoring braces in comments/strings. */
const findSolutionClassRange = (source) => {
    if (typeof source !== "string") return null;
    const classMatch = /\bclass\s+Solution\b/.exec(source);
    if (!classMatch) return null;

    const openBrace = source.indexOf("{", classMatch.index + classMatch[0].length);
    if (openBrace === -1) return null;

    let depth = 0;
    let state = "code";
    let escaped = false;

    for (let i = openBrace; i < source.length; i++) {
        const ch = source[i];
        const next = source[i + 1];

        if (state === "lineComment") {
            if (ch === "\n") state = "code";
            continue;
        }
        if (state === "blockComment") {
            if (ch === "*" && next === "/") {
                state = "code";
                i++;
            }
            continue;
        }
        if (["singleQuote", "doubleQuote", "template"].includes(state)) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === "\\") {
                escaped = true;
                continue;
            }
            if ((state === "singleQuote" && ch === "'") ||
                (state === "doubleQuote" && ch === '"') ||
                (state === "template" && ch === "`")) {
                state = "code";
            }
            continue;
        }

        if (ch === "/" && next === "/") {
            state = "lineComment";
            i++;
            continue;
        }
        if (ch === "/" && next === "*") {
            state = "blockComment";
            i++;
            continue;
        }
        if (ch === "'") {
            state = "singleQuote";
            continue;
        }
        if (ch === '"') {
            state = "doubleQuote";
            continue;
        }
        if (ch === "`") {
            state = "template";
            continue;
        }

        if (ch === "{") depth++;
        if (ch === "}") {
            depth--;
            if (depth === 0) {
                let end = i + 1;
                while (end < source.length && /\s/.test(source[end])) end++;
                if (source[end] === ";") end++;
                return { start: classMatch.index, end };
            }
        }
    }
    return null;
};

const extractPreamble = (source, language) => {
    const preamble = [];
    const kind = normalizeLanguage(language);
    const directivePattern = kind === "c++"
        ? /^\s*(#\s*(?:include|define|pragma)\b.*|using\s+namespace\s+std\s*;)\s*$/
        : kind === "java"
            ? /^\s*import\s+[\w.*]+\s*;\s*$/
            : null;

    if (!directivePattern) return { preamble, code: source };
    const code = source.split("\n").filter((line) => {
        if (directivePattern.test(line)) {
            preamble.push(line.trim());
            return false;
        }
        return true;
    }).join("\n");
    return { preamble, code };
};

/*
 * A complete reference program is the per-problem driver template. The user's
 * Solution class replaces the reference class; the program's input driver remains.
 */
const buildExecutableSource = (userCode, referenceSource, language) => {
    if (typeof userCode !== "string" || !userCode.trim()) {
        throw new Error("Submitted code is empty");
    }
    if (typeof referenceSource !== "string" || !referenceSource.trim()) {
        throw new Error(`No complete reference executable is configured for ${language}`);
    }

    const kind = normalizeLanguage(language);
    if (!["c++", "java", "javascript"].includes(kind)) {
        throw new Error(`Class-based execution is not configured for ${language}`);
    }

    const referenceRange = findSolutionClassRange(referenceSource);
    const submittedRange = findSolutionClassRange(userCode);

    // Preserve JS full-program submissions for older problems that don't use Solution.
    if (kind === "javascript" && !referenceRange && !submittedRange) return userCode;

    if (!referenceRange) {
        throw new Error(`The ${language} reference solution must contain class Solution and its driver`);
    }
    if (!submittedRange) {
        throw new Error(`Your ${language} submission must contain class Solution. Do not add main(); CodeArena supplies the driver.`);
    }

    const submittedParts = extractPreamble(userCode, kind);
    let submittedClass = submittedParts.code.trim();
    if (kind === "java") {
        submittedClass = submittedClass.replace(/\bpublic\s+class\s+Solution\b/, "class Solution");
    }
    if (!submittedClass) throw new Error("No Solution class was found in the submitted code");

    const prefix = referenceSource.slice(0, referenceRange.start);
    const suffix = referenceSource.slice(referenceRange.end);
    const prefixLines = new Set(prefix.split("\n").map((line) => line.trim()).filter(Boolean));
    const extraPreamble = submittedParts.preamble.filter((line) => !prefixLines.has(line)).join("\n");
    const generatedPrefix = extraPreamble ? `${extraPreamble}\n${prefix}` : prefix;

    return `${generatedPrefix}${submittedClass}\n${suffix}`;
};

const CACHE_TTL_SECONDS = Math.max(60, Number(process.env.JDOODLE_CACHE_TTL_SECONDS) || 6 * 60 * 60);
const CACHE_MAX_ENTRIES = 500;
const memoryCache = new Map();
const inFlight = new Map();

const normalizeOutput = (value) => String(value ?? "")
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const makeCacheKey = (submission) => createHash("sha256")
    .update(JSON.stringify({
        cacheVersion: 3,
        clientId: process.env.JDOODLE_CLIENT_ID,
        source: submission.source_code,
        stdin: submission.stdin ?? "",
        language: submission.language,
        versionIndex: String(submission.versionIndex ?? "0"),
        compileOnly: false,
    }))
    .digest("hex");

const memoryRead = (key) => {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
        memoryCache.delete(key);
        return null;
    }
    memoryCache.delete(key);
    memoryCache.set(key, entry);
    return entry.value;
};

const memoryWrite = (key, value) => {
    memoryCache.delete(key);
    memoryCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000 });
    while (memoryCache.size > CACHE_MAX_ENTRIES) {
        memoryCache.delete(memoryCache.keys().next().value);
    }
};

const cacheRead = async (key) => {
    try {
        if (redisClient?.isReady) {
            const saved = await redisClient.get(`${CACHE_PREFIX}${key}`);
            if (saved) return JSON.parse(saved);
        }
    } catch (error) {
        console.warn("JDoodle Redis cache read skipped:", error.message);
    }
    return memoryRead(key);
};

const cacheWrite = async (key, value) => {
    // Only cache completed executions. Provider/quota/network failures aren't reusable results.
    if (!value || value.error || value.httpStatus >= 400 || value.statusCode === 429) return;
    memoryWrite(key, value);
    try {
        if (redisClient?.isReady) {
            await redisClient.set(`${CACHE_PREFIX}${key}`, JSON.stringify(value), { EX: CACHE_TTL_SECONDS });
        }
    } catch (error) {
        console.warn("JDoodle Redis cache write skipped:", error.message);
    }
};

const isServiceFailure = (result) => Boolean(
    result?.error || Number(result?.httpStatus) >= 400 || Number(result?.statusCode) === 429
);

const isCompilationFailure = (result) => /(fatal error:|undefined reference|cannot find symbol|compilation failed|could not find or load main class|main method not found|illegal start of expression|';' expected|error:.*(expected|not declared|no matching|cannot|does not name a type))/i.test(String(result?.output ?? ""));

const isRuntimeFailure = (result) => /(segmentation fault|terminate called|exception in thread|uncaught exception|referenceerror|typeerror|syntaxerror|runtimeerror|time limit exceeded|execution timed out|killed by signal)/i.test(String(result?.output ?? ""));

const readProviderError = (error) => {
    const body = error.response?.data;
    if (typeof body === "string") return body;
    if (body) return JSON.stringify(body);
    return error.message || "JDoodle execution failed";
};

const executeCode = async (submission) => {
    if (!process.env.JDOODLE_CLIENT_ID || !process.env.JDOODLE_CLIENT_SECRET) {
        return { error: "JDoodle credentials are not configured on the backend" };
    }

    const key = makeCacheKey(submission);
    const cached = await cacheRead(key);
    if (cached) return { ...cached, cacheHit: true };
    if (inFlight.has(key)) return inFlight.get(key);

    const request = (async () => {
        try {
            const response = await axios.post(JDOODLE_URL, {
                clientId: process.env.JDOODLE_CLIENT_ID,
                clientSecret: process.env.JDOODLE_CLIENT_SECRET,
                script: submission.source_code,
                stdin: submission.stdin ?? "",
                language: submission.language,
                versionIndex: String(submission.versionIndex ?? "0"),
                compileOnly: false,
            }, { timeout: 60000 });

            const result = response.data || {};
            const providerStatus = Number(result.statusCode);
            if (providerStatus === 429 || /daily limit reached/i.test(String(result.error || ""))) {
                return {
                    ...result,
                    error: "JDoodle daily execution limit reached (HTTP 429). The code was not graded; try after the daily reset.",
                    httpStatus: 429,
                };
            }

            await cacheWrite(key, result);
            return result;
        } catch (error) {
            const message = readProviderError(error);
            const httpStatus = Number(error.response?.status || error.response?.data?.statusCode || 0) || null;
            const dailyLimit = httpStatus === 429 || /daily limit reached/i.test(message);
            return {
                error: dailyLimit
                    ? "JDoodle daily execution limit reached (HTTP 429). The code was not graded; try after the daily reset."
                    : error.code === "ECONNABORTED"
                        ? "JDoodle request timed out"
                        : message,
                httpStatus,
            };
        }
    })();

    inFlight.set(key, request);
    try {
        return await request;
    } finally {
        if (inFlight.get(key) === request) inFlight.delete(key);
    }
};

const isWrongAnswer = (submission, result) => {
    if (!submission?.stopOnWrongAnswer || isServiceFailure(result) || result?.skipped) return false;
    if (isCompilationFailure(result) || isRuntimeFailure(result)) return true;
    return normalizeOutput(result?.output) !== normalizeOutput(submission.expected_output);
};

/*
 * Individual mode preserves compatibility with old drivers: one JDoodle run per
 * input. Stop at first wrong answer/compile error for submissions.
 */
const submitBatch = async (submissions) => {
    if (!Array.isArray(submissions)) return [];
    const results = [];

    for (let i = 0; i < submissions.length; i++) {
        const result = await executeCode(submissions[i]);
        results.push(result);

        if (isServiceFailure(result) || isCompilationFailure(result)) {
            while (results.length < submissions.length) {
                results.push({ skipped: true, reason: "Stopped after service or compilation failure" });
            }
            break;
        }
        if (isWrongAnswer(submissions[i], result)) {
            while (results.length < submissions.length) {
                results.push({ skipped: true, reason: "Stopped after first failing test case" });
            }
            break;
        }
    }
    return results;
};

const combineInputs = (testCases) => testCases.map((testCase) =>
    String(testCase?.input ?? "").replace(/\r\n/g, "\n").replace(/\n$/, "")
).join("\n") + "\n";

/*
 * All-at-once execution is opt-in. To use it, each complete reference program
 * must contain `// CODEARENA_BATCH_MODE: EOF_MARKER`, loop over test instances
 * until EOF, and print `__CODEARENA_CASE_END__` after each instance's output.
 * This lets all test cases run in one JDoodle execution without losing case-level
 * output comparisons. Legacy drivers remain in individual mode automatically.
 */
const executeTestCases = async ({ sourceCode, testCases, language, versionIndex, stopOnWrongAnswer = false }) => {
    if (!Array.isArray(testCases)) return { mode: "individual", results: [], error: "Test cases must be an array" };

    if (hasBatchDriver(sourceCode)) {
        const combined = await executeCode({
            source_code: sourceCode,
            stdin: combineInputs(testCases),
            language,
            versionIndex,
        });

        if (isServiceFailure(combined)) {
            return { mode: "batch", results: [], serviceFailure: combined };
        }

        const stdout = String(combined.output ?? "");
        const pieces = stdout.split(CASE_END_MARKER);
        const markerCount = pieces.length - 1;

        if (markerCount === testCases.length) {
            return {
                mode: "batch",
                apiCalls: combined.cacheHit ? 0 : 1,
                results: pieces.slice(0, testCases.length).map((output) => ({
                    ...combined,
                    output,
                    batchExecution: true,
                })),
            };
        }

        // A single compile/runtime error can prevent the driver from emitting all markers.
        if (isCompilationFailure(combined) || isRuntimeFailure(combined)) {
            const results = testCases.map((_, index) => {
                if (index < markerCount) {
                    return { ...combined, output: pieces[index], batchExecution: true };
                }
                return { ...combined, output: stdout, executionFailure: true, batchExecution: true };
            });
            return { mode: "batch", apiCalls: combined.cacheHit ? 0 : 1, results };
        }

        return {
            mode: "batch",
            apiCalls: combined.cacheHit ? 0 : 1,
            results: [],
            driverError: `Batch driver returned ${markerCount} case markers for ${testCases.length} test cases. Ensure its main/input loop handles every concatenated input until EOF and prints ${CASE_END_MARKER} once per case.`,
            rawOutput: stdout,
        };
    }

    const results = await submitBatch(testCases.map((testCase) => ({
        source_code: sourceCode,
        stdin: testCase?.input ?? "",
        language,
        versionIndex,
        expected_output: testCase?.output,
        stopOnWrongAnswer,
    })));
    const serviceFailure = results.find((result) => isServiceFailure(result));
    return {
        mode: "individual",
        apiCalls: results.filter((result) => !result?.skipped && !result?.cacheHit).length,
        results,
        ...(serviceFailure ? { serviceFailure } : {}),
    };
};

module.exports = {
    getLanguageById,
    normalizeLanguage,
    findSolutionClassRange,
    buildExecutableSource,
    hasBatchDriver,
    executeCode,
    submitBatch,
    executeTestCases,
    normalizeOutput,
    isServiceFailure,
    isCompilationFailure,
    isRuntimeFailure,
    CASE_END_MARKER,
};
