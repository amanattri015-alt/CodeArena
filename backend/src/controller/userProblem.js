const {
    getLanguageById,
    normalizeLanguage,
    findSolutionClassRange,
    buildExecutableSource,
    hasBatchDriver,
    executeTestCases,
    normalizeOutput,
    isCompilationFailure,
    isRuntimeFailure,
} = require("../utils/problemUtility");
const Problem = require("../model/problem");
const User = require("../model/user");
const Submission = require("../model/submission");

const BATCH_CASE_END_MARKER = "__CODEARENA_CASE_END__";

const getReferenceSolution = (problem, language) => {
    const requestedLanguage = normalizeLanguage(language);
    return (problem.referenceSolution || []).find(
        (solution) => normalizeLanguage(solution.language) === requestedLanguage
    );
};

const truncate = (value, maxLength = 1200) => {
    const text = String(value ?? "");
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const plainValue = (value) => {
    if (value === undefined || value === null) return value;
    if (typeof value.toObject === "function") return value.toObject();
    return value;
};

const normalizedCasesForValidation = (cases, includeExplanation = false) =>
    (cases || []).map((item) => {
        const result = {
            input: String(item?.input ?? ""),
            output: String(item?.output ?? ""),
        };
        if (includeExplanation) result.explanation = String(item?.explanation ?? "");
        return result;
    });

const normalizedReferencesForValidation = (references) =>
    (references || []).map((item) => ({
        language: normalizeLanguage(item?.language),
        completeSolution: String(item?.completeSolution ?? ""),
    }));

const classifyExecution = (result, expectedOutput) => {
    if (!result) {
        return { status: "Runtime Error", message: "The execution service returned no result." };
    }
    if (result.skipped) {
        return { status: "Skipped", message: "Not executed because an earlier test case failed." };
    }

    const output = String(result.output ?? "");
    if (isCompilationFailure(result)) {
        return { status: "Compilation Error", message: output.trim() || "Compilation failed." };
    }
    if (isRuntimeFailure(result)) {
        const status = /time limit exceeded|timed out|execution timeout/i.test(output)
            ? "Time Limit Exceeded"
            : "Runtime Error";
        return { status, message: output.trim() || status };
    }
    if (normalizeOutput(output) === normalizeOutput(expectedOutput)) {
        return { status: "Accepted", message: "" };
    }
    return { status: "Wrong Answer", message: "Output did not match the expected output." };
};

const getFirstCaseFailure = (executionResult, testCases) => {
    if (executionResult?.serviceFailure) {
        return {
            serviceFailure: executionResult.serviceFailure,
            reason: "Execution service failure",
        };
    }
    if (executionResult?.driverError) {
        return { driverError: executionResult.driverError };
    }

    const results = executionResult?.results || [];
    for (let i = 0; i < testCases.length; i++) {
        const execution = results[i];
        if (!execution || execution.skipped) {
            return { index: i, result: execution, reason: "Test case was not executed" };
        }
        const verdict = classifyExecution(execution, testCases[i]?.output);
        if (verdict.status !== "Accepted") {
            return { index: i, result: execution, reason: verdict.status };
        }
    }
    return null;
};

const validateReferenceSolutions = async (referenceSolutions, visibleTestCases, hiddenTestCases) => {
    if (!Array.isArray(referenceSolutions) || referenceSolutions.length === 0) {
        return { valid: false, message: "Add at least one complete reference solution." };
    }
    if (!Array.isArray(visibleTestCases) || visibleTestCases.length === 0) {
        return { valid: false, message: "Add at least one visible test case." };
    }

    const mode = String(process.env.JDOODLE_REFERENCE_VALIDATION_MODE || "auto").trim().toLowerCase();
    if (!["auto", "sample", "full"].includes(mode)) {
        return { valid: false, message: "JDOODLE_REFERENCE_VALIDATION_MODE must be auto, sample, or full." };
    }

    const allCases = [
        ...(visibleTestCases || []).map((testCase) => ({ ...testCase, testType: "visible" })),
        ...(hiddenTestCases || []).map((testCase) => ({ ...testCase, testType: "hidden" })),
    ];

    for (const reference of referenceSolutions) {
        const { language, completeSolution } = reference;
        const languageConfig = getLanguageById(language);
        if (!languageConfig) {
            return { valid: false, message: `Unsupported language in reference solutions: ${language}` };
        }
        if (typeof completeSolution !== "string" || !completeSolution.trim()) {
            return { valid: false, message: `The ${language} reference solution is empty.` };
        }
        // C++ and Java class-based problems need Solution plus a driver. For
        // JavaScript, keep backward compatibility with older full-program
        // submissions that read stdin themselves and do not declare Solution.
        if (!findSolutionClassRange(completeSolution) && normalizeLanguage(language) !== "javascript") {
            return {
                valid: false,
                message: `The ${language} reference solution must contain class Solution and a complete problem-specific driver.`,
            };
        }
        if (normalizeLanguage(language) === "c++" && !/\bint\s+main\s*\(/.test(completeSolution)) {
            return { valid: false, message: "The C++ reference solution must include int main() as its driver." };
        }
        if (normalizeLanguage(language) === "java" && !/\bstatic\s+void\s+main\s*\(/.test(completeSolution)) {
            return { valid: false, message: "The Java reference solution must include static void main(String[] args) as its driver." };
        }

        // Auto mode: batch-ready drivers validate every visible+hidden case in a
        // single paid execution. Legacy single-input drivers use a smoke test to
        // avoid unexpectedly exhausting the free daily allowance during creation.
        const batchReady = hasBatchDriver(completeSolution);
        const testCases = (mode === "full" || (mode === "auto" && batchReady))
            ? allCases
            : [visibleTestCases[0]];

        const result = await executeTestCases({
            sourceCode: completeSolution,
            testCases,
            language: languageConfig.language,
            versionIndex: languageConfig.versionIndex,
            stopOnWrongAnswer: true,
        });

        const failure = getFirstCaseFailure(result, testCases);
        if (failure) {
            if (failure.serviceFailure) {
                const error = failure.serviceFailure.error || "Execution service failed";
                return {
                    valid: false,
                    message: `JDoodle could not validate ${language}: ${truncate(typeof error === "string" ? error : JSON.stringify(error))}. No verdict was produced.`,
                };
            }
            if (failure.driverError) {
                return { valid: false, message: `${language} reference driver error: ${failure.driverError}` };
            }

            const failedCase = testCases[failure.index];
            const actual = failure.result?.output ?? "No output returned";
            return {
                valid: false,
                message: `Reference solution failed for ${language} on ${failedCase?.testType || "test"} test case #${failure.index + 1} (${failure.reason}). Actual output: ${truncate(actual)}`,
            };
        }
    }

    const allReferencesBatch = referenceSolutions.every((item) => hasBatchDriver(item.completeSolution));
    const fullWasRun = mode === "full" || (mode === "auto" && allReferencesBatch);
    return {
        valid: true,
        validationMode: fullWasRun ? "full" : "sample",
        message: fullWasRun
            ? "Reference solutions passed all configured visible and hidden test cases."
            : "Reference solutions passed the first visible smoke test. Use batch-ready drivers or set JDOODLE_REFERENCE_VALIDATION_MODE=full to validate every case.",
    };
};

const createProblem = async (req, res) => {
    try {
        const {
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            editorial,
        } = req.body;

        const validation = await validateReferenceSolutions(
            referenceSolution,
            visibleTestCases,
            hiddenTestCases
        );
        if (!validation.valid) return res.status(400).json({ message: validation.message });

        const newProblem = await Problem.create({
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            editorial,
            problemCreator: req.result._id,
        });

        return res.status(201).json({
            message: "Problem created successfully",
            problem: newProblem,
            referenceValidation: validation.message,
        });
    } catch (error) {
        console.error("CREATE PROBLEM ERROR:", error);
        return res.status(500).json({
            message: "Error creating problem",
            error: error.message,
        });
    }
};

const updateProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).json({ message: "Problem ID is required" });

        const existingProblem = await Problem.findById(id);
        if (!existingProblem) return res.status(404).json({ message: "Problem not found" });

        const oldObject = existingProblem.toObject();
        const candidate = { ...oldObject, ...req.body };

        // Compare only values that affect correctness; ignore generated Mongo _id
        // values on nested test cases and explanation/title-only edits.
        const reqHas = (field) => Object.prototype.hasOwnProperty.call(req.body, field);
        const visibleChanged = reqHas("visibleTestCases") &&
            JSON.stringify(normalizedCasesForValidation(req.body.visibleTestCases)) !==
            JSON.stringify(normalizedCasesForValidation(existingProblem.visibleTestCases));
        const hiddenChanged = reqHas("hiddenTestCases") &&
            JSON.stringify(normalizedCasesForValidation(req.body.hiddenTestCases)) !==
            JSON.stringify(normalizedCasesForValidation(existingProblem.hiddenTestCases));
        const referenceChanged = reqHas("referenceSolution") &&
            JSON.stringify(normalizedReferencesForValidation(req.body.referenceSolution)) !==
            JSON.stringify(normalizedReferencesForValidation(existingProblem.referenceSolution));

        let validation = null;
        if (visibleChanged || hiddenChanged || referenceChanged) {
            validation = await validateReferenceSolutions(
                candidate.referenceSolution,
                candidate.visibleTestCases,
                candidate.hiddenTestCases
            );
            if (!validation.valid) return res.status(400).json({ message: validation.message });
        }

        delete candidate._id;
        delete candidate.__v;
        candidate.problemCreator = existingProblem.problemCreator;

        const updatedProblem = await Problem.findByIdAndUpdate(id, candidate, {
            runValidators: true,
            new: true,
        });

        return res.status(200).json({
            message: "Problem updated successfully",
            problem: updatedProblem,
            ...(validation ? { referenceValidation: validation.message } : {}),
        });
    } catch (error) {
        console.error("UPDATE PROBLEM ERROR:", error);
        return res.status(500).json({ message: "Error updating problem", error: error.message });
    }
};

const deleteProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).send("ID field is missing");
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if (!deletedProblem) return res.status(404).send("Problem is missing");
        return res.status(200).send("Successfully deleted");
    } catch (error) {
        return res.status(500).send("Error: " + error.message);
    }
};

const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).send("ID field is missing");
        const problemData = await Problem.findById(id).select(
            "_id title description editorial difficulty tags visibleTestCases startCode"
        );
        if (!problemData) return res.status(404).send("Problem not exist");
        return res.status(200).json({ problem: problemData });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching problem", error: error.message });
    }
};

const getAllProblem = async (req, res) => {
    try {
        const problems = await Problem.find({}).select("_id title difficulty tags");
        return res.status(200).json({ problems });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching problems", error: error.message });
    }
};

const solvedAllProblemByUser = async (req, res) => {
    try {
        const user = await User.findById(req.result._id).populate({
            path: "problemSolved",
            select: "_id title difficulty tags",
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user.problemSolved);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching solved problems", error: error.message });
    }
};

const submittedProblem = async (req, res) => {
    try {
        const submissions = await Submission.find({
            userId: req.result._id,
            problemId: req.params.pid,
        })
            .sort({ createdAt: -1 })
            .select("_id language status runtime memory testCasesPassed totalTestCases createdAt");
        return res.status(200).json({ submissions });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching submissions", error: error.message });
    }
};

const handleExecutionError = (res, execution) => {
    if (execution?.serviceFailure) {
        const error = execution.serviceFailure.error || "JDoodle execution failed";
        return res.status(502).json({
            message: "Code execution service failed. Your code was not graded.",
            error: typeof error === "string" ? error : JSON.stringify(error),
        });
    }
    if (execution?.driverError) {
        return res.status(400).json({
            message: "Problem test-driver configuration is invalid.",
            error: execution.driverError,
        });
    }
    return null;
};

const runCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, language } = req.body;
        if (!id || typeof code !== "string" || !code.trim() || !language) {
            return res.status(400).json({ message: "Problem ID, code and language are required" });
        }

        const problem = await Problem.findById(id);
        if (!problem) return res.status(404).json({ message: "Problem not found" });

        const languageConfig = getLanguageById(language);
        if (!languageConfig) return res.status(400).json({ message: `Unsupported language: ${language}` });

        const reference = getReferenceSolution(problem, language);
        if (!reference) {
            return res.status(400).json({
                message: `No reference driver is configured for ${language}. Add a complete executable reference solution for this language.`,
            });
        }

        let executableCode;
        try {
            executableCode = buildExecutableSource(code, reference.completeSolution, language);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        const testCases = problem.visibleTestCases || [];
        if (!testCases.length) return res.status(400).json({ message: "This problem has no visible test cases" });

        const execution = await executeTestCases({
            sourceCode: executableCode,
            testCases,
            language: languageConfig.language,
            versionIndex: languageConfig.versionIndex,
            stopOnWrongAnswer: false,
        });
        const serviceResponse = handleExecutionError(res, execution);
        if (serviceResponse) return serviceResponse;

        let passed = 0;
        let overallStatus = "Accepted";
        const results = testCases.map((testCase, index) => {
            const rawResult = execution.results[index];
            const verdict = classifyExecution(rawResult, testCase.output);
            const isCorrect = verdict.status === "Accepted";
            if (isCorrect) passed++;
            if (!isCorrect && overallStatus === "Accepted") overallStatus = verdict.status;

            return {
                testCase: index + 1,
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput: String(rawResult?.output ?? ""),
                status: verdict.status,
                isCorrect,
                ...(verdict.message ? { error: truncate(verdict.message) } : {}),
            };
        });

        return res.status(200).json({
            message: "Code execution completed",
            status: passed === testCases.length ? "Accepted" : overallStatus,
            testCasesPassed: passed,
            totalTestCases: testCases.length,
            executionMode: execution.mode,
            executionCount: execution.apiCalls,
            results,
        });
    } catch (error) {
        console.error("RUN CODE ERROR:", error);
        return res.status(500).json({ message: error.message || "Unable to run code" });
    }
};

const submitCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, language } = req.body;
        if (!id || typeof code !== "string" || !code.trim() || !language) {
            return res.status(400).json({ message: "Problem ID, code and language are required" });
        }

        const problem = await Problem.findById(id);
        if (!problem) return res.status(404).json({ message: "Problem not found" });

        const languageConfig = getLanguageById(language);
        if (!languageConfig) return res.status(400).json({ message: `Unsupported language: ${language}` });

        const reference = getReferenceSolution(problem, language);
        if (!reference) {
            return res.status(400).json({
                message: `No reference driver is configured for ${language}. Add a complete executable reference solution for this language.`,
            });
        }

        let executableCode;
        try {
            executableCode = buildExecutableSource(code, reference.completeSolution, language);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        const testCases = problem.hiddenTestCases || [];
        if (!testCases.length) return res.status(400).json({ message: "This problem has no hidden test cases" });

        const execution = await executeTestCases({
            sourceCode: executableCode,
            testCases,
            language: languageConfig.language,
            versionIndex: languageConfig.versionIndex,
            stopOnWrongAnswer: true,
        });
        const serviceResponse = handleExecutionError(res, execution);
        if (serviceResponse) return serviceResponse;

        let passed = 0;
        const verdicts = execution.results.map((rawResult, index) => {
            if (rawResult?.skipped) {
                return { status: "Skipped", message: "Not executed because an earlier hidden test case failed." };
            }
            const verdict = classifyExecution(rawResult, testCases[index].output);
            if (verdict.status === "Accepted") passed++;
            return verdict;
        });

        let status = "Wrong Answer";
        if (passed === testCases.length) status = "Accepted";
        else if (verdicts.some((item) => item.status === "Compilation Error")) status = "Compilation Error";
        else if (verdicts.some((item) => item.status === "Time Limit Exceeded")) status = "Time Limit Exceeded";
        else if (verdicts.some((item) => item.status === "Runtime Error")) status = "Runtime Error";

        const executedResults = execution.results.filter((item) => item && !item.skipped);
        const runtime = Math.max(0, ...executedResults.map((item) => Number(item.cpuTime) || 0));
        const memory = Math.max(0, ...executedResults.map((item) => Number(item.memory) || 0));

        const submission = await Submission.create({
            userId: req.result._id,
            problemId: problem._id,
            code, // Store the original class-only code, not the generated driver.
            language,
            status,
            runtime,
            memory,
            testCasesPassed: passed,
            totalTestCases: testCases.length,
        });

        if (status === "Accepted") {
            await User.findByIdAndUpdate(req.result._id, {
                $addToSet: { problemSolved: problem._id.toString() },
            });
        }

        return res.status(200).json({
            message: status,
            status,
            passed,
            total: testCases.length,
            runtime,
            memory,
            executionMode: execution.mode,
            executionCount: execution.apiCalls,
            submissionId: submission._id,
            submission,
            // Hidden inputs and expected outputs are intentionally not returned.
        });
    } catch (error) {
        console.error("SUBMIT CODE ERROR:", error);
        return res.status(500).json({ message: error.message || "Unable to submit code" });
    }
};

const getAcceptedSolution = async (req, res) => {
    try {
        const { pid } = req.params;
        if (!pid) return res.status(400).json({ message: "Problem ID is required" });

        const submission = await Submission.findOne({
            userId: req.result._id,
            problemId: pid,
            status: "Accepted",
        }).sort({ createdAt: -1 });

        if (!submission) return res.status(404).json({ message: "No accepted solution found" });
        return res.status(200).json({
            message: "Accepted solution fetched successfully",
            solution: {
                code: submission.code,
                language: submission.language,
                runtime: submission.runtime,
                memory: submission.memory,
                submittedAt: submission.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch accepted solution", error: error.message });
    }
};

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    solvedAllProblemByUser,
    submittedProblem,
    runCode,
    submitCode,
    getAcceptedSolution,
};
