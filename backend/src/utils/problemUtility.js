const axios = require("axios");

const JDOODLE_URL = "https://api.jdoodle.com/v1/execute";

/*
 * JDoodle's language field is an identifier, not a human-readable label.
 * versionIndex is the index accepted by JDoodle for that language.
 * Keep these values aligned with the languages enabled for your API account.
 */
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

const getLanguageById = (lang) => {
    const normalized = normalizeLanguage(lang);
    return LANGUAGE_MAP[normalized] || null;
};

/*
 * Finds `class Solution { ... }` while ignoring braces inside comments and
 * quoted strings. This lets a problem's full reference executable act as its
 * driver template, while replacing only the reference Solution class with a
 * user's class-based submission.
 */
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

        if (state === "singleQuote" || state === "doubleQuote" || state === "template") {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === "\\") {
                escaped = true;
                continue;
            }
            if (
                (state === "singleQuote" && ch === "'") ||
                (state === "doubleQuote" && ch === '"') ||
                (state === "template" && ch === "`")
            ) {
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
                // C++ class declarations end with a semicolon.
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

    const code = source
        .split("\n")
        .filter((line) => {
            if (directivePattern.test(line)) {
                preamble.push(line.trim());
                return false;
            }
            return true;
        })
        .join("\n");

    return { preamble, code };
};

/*
 * Build an executable program for Run/Submit:
 * - referenceSource must be a complete, working program containing Solution
 *   and its problem-specific main/input/output driver.
 * - userCode is the class-based submission entered by the user.
 * - the reference Solution class is replaced with the user's Solution class;
 *   the driver and its input/output format stay problem-specific.
 *
 * This avoids trying to invent one universal driver for every data structure
 * and method signature. Each problem owns the correct driver in its full
 * reference solution.
 */
const buildExecutableSource = (userCode, referenceSource, language) => {
    if (typeof userCode !== "string" || !userCode.trim()) {
        throw new Error("Submitted code is empty");
    }
    if (typeof referenceSource !== "string" || !referenceSource.trim()) {
        throw new Error(`No complete reference executable is configured for ${language}`);
    }

    const normalizedLanguage = normalizeLanguage(language);
    if (!["c++", "java", "javascript"].includes(normalizedLanguage)) {
        throw new Error(`Class-based execution is not configured for ${language}`);
    }

    const referenceRange = findSolutionClassRange(referenceSource);
    const submittedRange = findSolutionClassRange(userCode);

    // Preserve JavaScript's existing full-program flow for function-based
    // starters. Class-based JavaScript problems can still use the driver
    // replacement path when both the reference and submission define Solution.
    if (normalizedLanguage === "javascript" && !referenceRange && !submittedRange) {
        return userCode;
    }

    if (!referenceRange) {
        throw new Error(
            `The ${language} reference solution must contain a class named Solution and a problem-specific driver`
        );
    }

    if (!submittedRange) {
        throw new Error(
            `Your ${language} submission must contain a class named Solution. Do not add main(); CodeArena supplies the driver.`
        );
    }

    const submittedParts = extractPreamble(userCode, normalizedLanguage);
    let submittedClassAndHelpers = submittedParts.code.trim();

    // Java's source filename is Main.java in this driver setup. Solution must
    // therefore be package-private, not a second public top-level class.
    if (normalizedLanguage === "java") {
        submittedClassAndHelpers = submittedClassAndHelpers.replace(
            /\bpublic\s+class\s+Solution\b/,
            "class Solution"
        );
    }

    if (!submittedClassAndHelpers) {
        throw new Error("No Solution class was found in the submitted code");
    }

    const prefix = referenceSource.slice(0, referenceRange.start);
    const suffix = referenceSource.slice(referenceRange.end);
    const existingPrefix = new Set(
        prefix.split("\n").map((line) => line.trim()).filter(Boolean)
    );
    const additionalPreamble = submittedParts.preamble
        .filter((line) => !existingPrefix.has(line))
        .join("\n");

    // Java imports must stay before class declarations. The C++ directives are
    // also safely placed at the top of the generated source.
    const generatedPrefix = additionalPreamble
        ? `${additionalPreamble}\n${prefix}`
        : prefix;

    return `${generatedPrefix}${submittedClassAndHelpers}\n${suffix}`;
};

const executeCode = async (submission) => {
    if (!process.env.JDOODLE_CLIENT_ID || !process.env.JDOODLE_CLIENT_SECRET) {
        return { error: "JDoodle credentials are not configured on the backend" };
    }

    try {
        const response = await axios.post(
            JDOODLE_URL,
            {
                clientId: process.env.JDOODLE_CLIENT_ID,
                clientSecret: process.env.JDOODLE_CLIENT_SECRET,
                script: submission.source_code,
                stdin: submission.stdin ?? "",
                language: submission.language,
                versionIndex: String(submission.versionIndex ?? "0"),
                compileOnly: false,
            },
            { timeout: 60000 }
        );

        return response.data;
    } catch (error) {
        const providerError = error.response?.data;
        let readableError;

        if (typeof providerError === "string") {
            readableError = providerError;
        } else if (providerError) {
            readableError = JSON.stringify(providerError);
        } else {
            readableError = error.message || "JDoodle execution failed";
        }

        return {
            error: error.code === "ECONNABORTED"
                ? "JDoodle request timed out"
                : readableError,
            httpStatus: error.response?.status || null,
        };
    }
};

/* Execute sequentially to avoid bursts of concurrent API calls. */
const submitBatch = async (submissions) => {
    if (!Array.isArray(submissions)) return [];

    const results = [];
    for (const submission of submissions) {
        results.push(await executeCode(submission));
    }
    return results;
};

module.exports = {
    getLanguageById,
    normalizeLanguage,
    findSolutionClassRange,
    buildExecutableSource,
    submitBatch,
};
