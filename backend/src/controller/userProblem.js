

const {
    getLanguageById,
    submitBatch
} = require("../utils/problemUtility");

const verifyResult = require("../utils/verifyResult");
const Problem = require("../model/problem");
const User=require("../model/user");
const Submission = require("../model/submission");


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
            problemCreator,
            editorial,
        } = req.body;

        for (const { language, completeSolution } of referenceSolution) {

            const languageConfig = getLanguageById(language);

            if (!languageConfig) {
                return res.status(400).send(
                    `Unsupported language: ${language}`
                );
            }

            const submission = visibleTestCases.map(
                ({ input, output }) => ({

                    source_code: completeSolution,

                    language: languageConfig.language,

                    versionIndex: languageConfig.versionIndex,

                    stdin: input,

                    expected_output: output

                })
            );

           const submitResult = await submitBatch(submission);

console.log(
    "\n===== REFERENCE SOLUTION VALIDATION ====="
);

console.log(
    JSON.stringify(submitResult, null, 2)
);

const isValid = verifyResult(
    submitResult,
    visibleTestCases
);

if (!isValid) {

    return res.status(400).json({
        message: `Reference solution failed test cases for ${language}`
    });
}
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

            problemCreator: req.result._id
        });

        return res.status(201).json({
            message: "Problem created successfully",
            problem: newProblem
        });

    } catch (err) {

        console.log(err);

        return res.status(500).send(
            "Error: " + err.message
        );
    }
};


const updateProblem = async (req, res) => {

    const { id } = req.params;

    try {

        if (!id) {
            return res.status(400).send("Invalid ID Field");
        }

        const DsaProblem = await Problem.findById(id);

        if (!DsaProblem) {
            return res.status(400).send(
                "ID not present in the server"
            );
        }

        const {
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            referenceSolution,
            startCode,
            problemCreator
        } = req.body;


        for (const { language, completeSolution } of referenceSolution) {

            const languageConfig = getLanguageById(language);

            if (!languageConfig) {
                return res.status(400).send(
                    `Unsupported language: ${language}`
                );
            }

            const submission = visibleTestCases.map(
                ({ input, output }) => ({

                    source_code: completeSolution,

                    language: languageConfig.language,

                    versionIndex: languageConfig.versionIndex,

                    stdin: input,

                    expected_output: output

                })
            );

            const submitResult = await submitBatch(submission);

            const isValid = verifyResult(
                submitResult,
                visibleTestCases
            );

            if (!isValid) {
                return res.status(400).json({
                    message: "Reference solution failed test cases"
                });
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(
            id,
            { ...req.body },
            {
                runValidators: true,
                new: true
            }
        );

        return res.status(200).json({
            message: "Problem updated successfully",
            problem: newProblem
        });

    } catch (err) {

        return res.status(500).json({
            message: "Error updating problem",
            error: err.message
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

        if (!code || !language) {
            return res.status(400).json({
                message: "Code and language are required"
            });
        }

        const problem =
            await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        const languageConfig =
            getLanguageById(language);

        if (!languageConfig) {
            return res.status(400).json({
                message:
                    `Unsupported language: ${language}`
            });
        }

        const submissions =
            problem.visibleTestCases.map(
                (testCase) => ({
                    source_code: code,
                    stdin: testCase.input,
                    language:
                        languageConfig.language,
                    versionIndex:
                        languageConfig.versionIndex
                })
            );

        const submitResult =
            await submitBatch(submissions);

        const results =
            submitResult.map(
                (result, index) => ({
                    input:
                        problem.visibleTestCases[index]
                            .input,

                    expectedOutput:
                        problem.visibleTestCases[index]
                            .output,

                    actualOutput:
                        result.output || "",

                    error:
                        result.error || null,

                    statusCode:
                        result.statusCode || null,

                    isCorrect:
                        !result.error &&
                        (result.output || "")
                            .trim() ===
                        (
                            problem
                                .visibleTestCases[index]
                                .output || ""
                        ).trim()
                })
            );

        return res.status(200).json({
            message: "Code executed successfully",
            results
        });

    } catch (error) {
        console.error(
            "RUN CODE ERROR:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Unable to run code"
        });
    }
};
const submitCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                message: "Code and language are required"
            });
        }

        const problem =
            await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        const languageConfig =
            getLanguageById(language);

        if (!languageConfig) {
            return res.status(400).json({
                message:
                    `Unsupported language: ${language}`
            });
        }

        const submissions =
            problem.hiddenTestCases.map(
                (testCase) => ({
                    source_code: code,
                    stdin: testCase.input,
                    language:
                        languageConfig.language,
                    versionIndex:
                        languageConfig.versionIndex
                })
            );

        const submitResult =
            await submitBatch(submissions);

        let passed = 0;

        const results =
            submitResult.map(
                (result, index) => {

                    const expected =
                        (
                            problem
                                .hiddenTestCases[index]
                                .output || ""
                        ).trim();

                    const actual =
                        (
                            result.output || ""
                        ).trim();

                    const correct =
                        !result.error &&
                        actual === expected;

                    if (correct) {
                        passed++;
                    }

                    return {
                        input:
                            problem
                                .hiddenTestCases[index]
                                .input,

                        expectedOutput:
                            expected,

                        actualOutput:
                            actual,

                        error:
                            result.error || null,

                        isCorrect:
                            correct
                    };
                }
            );

        let status = "Wrong Answer";

        if (
            submitResult.some(
                (result) => result.error
            )
        ) {
            status = "Compilation Error";
        } else if (
            passed ===
            problem.hiddenTestCases.length
        ) {
            status = "Accepted";
        }

        const runtime =
            Math.max(
                ...submitResult.map(
                    (result) =>
                        Number(result.cpuTime) || 0
                )
            );

        const memory =
            Math.max(
                ...submitResult.map(
                    (result) =>
                        Number(result.memory) || 0
                )
            );

        const submission =
            await Submission.create({
                userId: req.result._id,
                problemId: problem._id,
                code,
                language,
                status,
                runtime,
                memory,
                testCasesPassed: passed,
                totalTestCases:
                    problem.hiddenTestCases.length
            });

        // Add problem to solved list
        // only when all tests pass.
        if (status === "Accepted") {

            await User.findByIdAndUpdate(
                req.result._id,
                {
                    $addToSet: {
                        problemSolved:
                            problem._id.toString()
                    }
                }
            );
        }

        return res.status(200).json({
            message: "Code submitted",
            status,
            passed,
            total:
                problem.hiddenTestCases.length,
            runtime,
            memory,
            submissionId:
                submission._id,
            results
        });

    } catch (error) {

        console.error(
            "SUBMIT CODE ERROR:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Unable to submit code"
        });
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