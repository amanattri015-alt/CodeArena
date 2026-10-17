

const {
    getLanguageById,
    normalizeLanguage,
    findSolutionClassRange,
    buildExecutableSource,
    submitBatch
} = require("../utils/problemUtility");

const verifyResult = require("../utils/verifyResult");
const normalizeOutput = verifyResult.normalizeOutput;
const getFirstFailure = verifyResult.getFirstFailure;
const Problem = require("../model/problem");
const User=require("../model/user");
const Submission = require("../model/submission");


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

const classifyExecution = (result, expectedOutput) => {
    if (!result) return { status: "Runtime Error", message: "Execution service returned no result" };
    if (result.error) return { status: "Service Error", message: typeof result.error === "string" ? result.error : JSON.stringify(result.error) };

    const output = String(result.output ?? "");
    if (/time limit exceeded|timed out|execution timeout|time limit/i.test(output)) {
        return { status: "Time Limit Exceeded", message: output.trim() };
    }
    if (/(error:|cannot find symbol|undefined reference|no matching function|expected ['`].*['`]|compilation failed|class, interface, enum|could not find or load main class|main method not found|';' expected|illegal start of expression)/i.test(output)) {
        return { status: "Compilation Error", message: output.trim() };
    }
    if (/exception in thread|\b(runtimeerror|referenceerror|typeerror|syntaxerror)\b|segmentation fault|terminate called|uncaught exception/i.test(output)) {
        return { status: "Runtime Error", message: output.trim() };
    }
    if (normalizeOutput(output) === normalizeOutput(expectedOutput)) {
        return { status: "Accepted", message: "" };
    }
    return { status: "Wrong Answer", message: "Output did not match the expected output" };
};

const validateReferenceSolutions = async (referenceSolutions, visibleTestCases, hiddenTestCases) => {
    if (!Array.isArray(referenceSolutions) || referenceSolutions.length === 0) {
        return { valid: false, message: "Add at least one complete reference solution." };
    }
    if (!Array.isArray(visibleTestCases) || visibleTestCases.length === 0) {
        return { valid: false, message: "Add at least one visible test case." };
    }
    if (!Array.isArray(hiddenTestCases) || hiddenTestCases.length === 0) {
        return { valid: false, message: "Add at least one hidden test case." };
    }

    const allTestCases = [
        ...visibleTestCases.map((testCase) => ({ ...testCase, testType: "visible" })),
        ...hiddenTestCases.map((testCase) => ({ ...testCase, testType: "hidden" })),
    ];

    for (const { language, completeSolution } of referenceSolutions) {
        const languageConfig = getLanguageById(language);
        if (!languageConfig) {
            return { valid: false, message: `Unsupported language in reference solutions: ${language}` };
        }
        if (typeof completeSolution !== "string" || !completeSolution.trim()) {
            return { valid: false, message: `The ${language} reference solution is empty.` };
        }
        if (!findSolutionClassRange(completeSolution)) {
            return {
                valid: false,
                message: `The ${language} reference solution must contain class Solution and the complete problem-specific driver (input parsing, method call and output). A class-only reference solution cannot be executed by JDoodle.`,
            };
        }
        if (normalizeLanguage(language) === "c++" && !/\bint\s+main\s*\(/.test(completeSolution)) {
            return { valid: false, message: `The C++ reference solution for ${language} must include int main() as its driver.` };
        }
        if (normalizeLanguage(language) === "java" && !/\bstatic\s+void\s+main\s*\(/.test(completeSolution)) {
            return { valid: false, message: `The Java reference solution must include public static void main(String[] args) as its driver.` };
        }

        const executions = await submitBatch(allTestCases.map((testCase) => ({
            source_code: completeSolution,
            language: languageConfig.language,
            versionIndex: languageConfig.versionIndex,
            stdin: testCase.input ?? "",
        })));

        const failure = getFirstFailure(executions, allTestCases);
        if (failure) {
            const failedCase = allTestCases[failure.index];
            const result = failure.result || executions[failure.index];
            const actual = result?.output ?? result?.error ?? "No output returned";
            return {
                valid: false,
                message: `Reference solution failed for ${language} on ${failedCase?.testType || "test"} test case #${failure.index + 1}: ${failure.reason}. Actual/API output: ${truncate(actual)}`,
            };
        }
    }

    return { valid: true };
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
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

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
        });
    } catch (err) {
        console.error("CREATE PROBLEM ERROR:", err);
        return res.status(500).json({
            message: "Error creating problem",
            error: err.message,
        });
    }
};

const updateProblem = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ message: "Problem ID is required" });
        }

        const existingProblem = await Problem.findById(id);
        if (!existingProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const candidate = {
            ...existingProblem.toObject(),
            ...req.body,
        };

        // Avoid spending execution credits when only changing title, description,
        // difficulty, tag or editorial. Revalidate whenever code/test configuration changes.
        const requiresValidation = [
            "visibleTestCases",
            "hiddenTestCases",
            "referenceSolution",
            "startCode",
        ].some((field) => Object.prototype.hasOwnProperty.call(req.body, field));

        if (requiresValidation) {
            const validation = await validateReferenceSolutions(
                candidate.referenceSolution,
                candidate.visibleTestCases,
                candidate.hiddenTestCases
            );
            if (!validation.valid) {
                return res.status(400).json({ message: validation.message });
            }
        }

        // Never allow client input to replace the original creator.
        delete candidate._id;
        delete candidate.__v;
        candidate.problemCreator = existingProblem.problemCreator;

        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            candidate,
            { runValidators: true, new: true }
        );

        return res.status(200).json({
            message: "Problem updated successfully",
            problem: updatedProblem,
        });
    } catch (err) {
        console.error("UPDATE PROBLEM ERROR:", err);
        return res.status(500).json({
            message: "Error updating problem",
            error: err.message,
        });
    }
};

const deleteProblem = async (req, res) => {

    const { id } = req.params;

    try {

        if (!id) {
            return res.status(400).send("ID field is missing");
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem) {
            return res.status(404).send("Problem is missing");
        }

        return res.status(200).send("Successfully deleted");

    } catch (err) {

        return res.status(500).send(
            "Error: " + err.message
        );
    }
};


const getProblemById = async (req, res) => {

    const { id } = req.params;

    try {

        if (!id) {
            return res.status(400).send("ID field is missing");
        }

        const problemData =
    await Problem.findById(id).select(
        "_id title description editorial difficulty tags visibleTestCases startCode"
    );

        if (!problemData) {
            return res.status(404).send("Problem not exist");
        }

        return res.status(200).json({
            problem: problemData
        });

    } catch (err) {

        return res.status(500).json({
            message: "Error fetching problem",
            error: err.message
        });
    }
};


const getAllProblem = async (req, res) => {

    try {

        const problems = await Problem.find({}).select('_id title difficulty tags');

        return res.status(200).json({
            problems: problems
        });

    } catch (err) {

        return res.status(500).json({
            message: "Error fetching problems",
            error: err.message
        });
    }
};


const solvedAllProblemByUser = async (req, res) => {

    try {
       const userId=req.result._id;
       const user=await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
       })
       res.send(user.problemSolved);
      

    } catch (err) {

        return res.status(500).json({
            message: "Error fetching solved problems",
            error: err.message
        });
    }
};

const submittedProblem = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;

        const submissions = await Submission.find({
            userId,
            problemId
        })
            .sort({ createdAt: -1 })
            .select(
                "_id language status runtime memory testCasesPassed totalTestCases createdAt"
            );

        return res.status(200).json({
            submissions
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching submissions",
            error: err.message
        });
    }
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
        if (!languageConfig) {
            return res.status(400).json({ message: `Unsupported language: ${language}` });
        }

        const reference = getReferenceSolution(problem, language);
        if (!reference) {
            return res.status(400).json({
                message: `This problem does not have a reference driver configured for ${language}. Add a full executable reference solution for this language.`,
            });
        }

        let executableCode;
        try {
            executableCode = buildExecutableSource(code, reference.completeSolution, language);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        const testCases = problem.visibleTestCases || [];
        if (testCases.length === 0) {
            return res.status(400).json({ message: "This problem has no visible test cases" });
        }

        const executions = await submitBatch(testCases.map((testCase) => ({
            source_code: executableCode,
            stdin: testCase.input ?? "",
            language: languageConfig.language,
            versionIndex: languageConfig.versionIndex,
        })));

        const serviceFailure = executions.find((result) => result?.error);
        if (serviceFailure) {
            return res.status(502).json({
                message: "Code execution service failed. This is not a verdict on your code.",
                error: typeof serviceFailure.error === "string"
                    ? serviceFailure.error
                    : JSON.stringify(serviceFailure.error),
            });
        }

        let passed = 0;
        let overallStatus = "Accepted";
        const results = testCases.map((testCase, index) => {
            const execution = executions[index];
            const verdict = classifyExecution(execution, testCase.output);
            const isCorrect = verdict.status === "Accepted";
            if (isCorrect) passed++;
            if (!isCorrect && overallStatus === "Accepted") overallStatus = verdict.status;

            return {
                testCase: index + 1,
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput: String(execution?.output ?? ""),
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
        if (!languageConfig) {
            return res.status(400).json({ message: `Unsupported language: ${language}` });
        }

        const reference = getReferenceSolution(problem, language);
        if (!reference) {
            return res.status(400).json({
                message: `This problem does not have a reference driver configured for ${language}. Add a full executable reference solution for this language.`,
            });
        }

        let executableCode;
        try {
            executableCode = buildExecutableSource(code, reference.completeSolution, language);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        const testCases = problem.hiddenTestCases || [];
        if (testCases.length === 0) {
            return res.status(400).json({ message: "This problem has no hidden test cases" });
        }

        const executions = await submitBatch(testCases.map((testCase) => ({
            source_code: executableCode,
            stdin: testCase.input ?? "",
            language: languageConfig.language,
            versionIndex: languageConfig.versionIndex,
        })));

        // Do not report infrastructure/credit failures as a user's compilation error.
        const serviceFailure = executions.find((result) => result?.error);
        if (serviceFailure) {
            return res.status(502).json({
                message: "Code execution service failed. Your submission was not graded.",
                error: typeof serviceFailure.error === "string"
                    ? serviceFailure.error
                    : JSON.stringify(serviceFailure.error),
            });
        }

        let passed = 0;
        const verdicts = executions.map((execution, index) => {
            const verdict = classifyExecution(execution, testCases[index].output);
            if (verdict.status === "Accepted") passed++;
            return verdict;
        });

        let status = "Wrong Answer";
        if (passed === testCases.length) {
            status = "Accepted";
        } else if (verdicts.some((verdict) => verdict.status === "Compilation Error")) {
            status = "Compilation Error";
        } else if (verdicts.some((verdict) => verdict.status === "Time Limit Exceeded")) {
            status = "Time Limit Exceeded";
        } else if (verdicts.some((verdict) => verdict.status === "Runtime Error")) {
            status = "Runtime Error";
        }

        const runtime = Math.max(0, ...executions.map((result) => Number(result?.cpuTime) || 0));
        const memory = Math.max(0, ...executions.map((result) => Number(result?.memory) || 0));

        const submission = await Submission.create({
            userId: req.result._id,
            problemId: problem._id,
            code, // store the user's original class-only code, not generated driver code
            language,
            status,
            runtime,
            memory,
            testCasesPassed: passed,
            totalTestCases: testCases.length,
        });

        if (status === "Accepted") {
            await User.findByIdAndUpdate(
                req.result._id,
                { $addToSet: { problemSolved: problem._id } }
            );
        }

        // LeetCode-style response: never reveal hidden inputs or expected outputs.
        return res.status(200).json({
            message: status,
            status,
            // Keep the existing response keys for the current frontend.
            passed,
            total: testCases.length,
            testCasesPassed: passed,
            totalTestCases: testCases.length,
            runtime,
            memory,
            submissionId: submission._id,
        });
    } catch (error) {
        console.error("SUBMIT CODE ERROR:", error);
        return res.status(500).json({ message: error.message || "Unable to submit code" });
    }
};

const getAcceptedSolution = async (req, res) => {
    try {
        const { pid } = req.params;
        const userId = req.result._id;

        if (!pid) {
            return res.status(400).json({
                message: "Problem ID is required"
            });
        }

        const submission = await Submission.findOne({
            userId,
            problemId: pid,
            status: "Accepted"
        }).sort({
            createdAt: -1
        });

        if (!submission) {
            return res.status(404).json({
                message: "No accepted solution found"
            });
        }

        return res.status(200).json({
            message: "Accepted solution fetched successfully",
            solution: {
                code: submission.code,
                language: submission.language,
                runtime: submission.runtime,
                memory: submission.memory,
                submittedAt: submission.createdAt
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch accepted solution",
            error: error.message
        });
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
    getAcceptedSolution
};