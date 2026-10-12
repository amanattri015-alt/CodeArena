const Problem=require("../model/problem");
const Submission = require("../model/submission");
const {
    getLanguageById,
    submitBatch
} = require("../utils/problemUtility");
const submitCode=async (req,res)=>{
    try {
        
        const userId=req.result._id;
        const problemId=req.params.id;
        const {code,language}=req.body;
        if(!userId || !problemId || !code || !language) {
            return res.status(400).send("Some field missing");
        }

        const problem=await Problem.findById(problemId);

        const submittedResult=await Submission.create({
            userId,
            problemId,
            code,
            language,
            testCasesPassed:0,
            status:'pending',
            totalTestCases:problem.hiddenTestCases.length
        })

         const languageConfig = getLanguageById(language);

        if (!languageConfig) {

            await Submission.findByIdAndUpdate(
                submittedResult._id,
                {
                    status: "Compilation Error"
                }
            );

            return res.status(400).send(
                `Unsupported language: ${language}`
            );
        }


        // 6. Create JDoodle submissions
        const submission = problem.hiddenTestCases.map(
            ({ input, output }) => ({

                source_code: code,

                language: languageConfig.language,

                versionIndex: languageConfig.versionIndex,

                stdin: input,

                expected_output: output
            })
        );


        // 7. Send code to JDoodle
        const submitResult = await submitBatch(submission);


        // 8. Check every test case
        let testCasesPassed = 0;

        for (let i = 0; i < submitResult.length; i++) {

            const actualOutput =
                submitResult[i].output?.trim();

            const expectedOutput =
                problem.hiddenTestCases[i].output?.trim();


            if (actualOutput === expectedOutput) {
                testCasesPassed++;
            }
        }

        // Runtime
        const runtime = Math.max(
            ...submitResult.map(
                result => Number(result.cpuTime) || 0
            )
        );
        
        
        // Memory
        const memory = Math.max(
            ...submitResult.map(
                result => Number(result.memory) || 0
            )
        );



        // 9. Decide final status
        let status = "Wrong Answer";

        if (testCasesPassed === problem.hiddenTestCases.length) {
            status = "Accepted";
        }


        // 10. Update submission
        const updatedSubmission =
            await Submission.findByIdAndUpdate(
                submittedResult._id,
                {
                    testCasesPassed,
                    status,
                    runtime,
                    memory
                },
                {
                    new: true
                }
            );
            if (status === "Accepted") {

           if (!req.result.problemSolved.includes(problemId)) {
               req.result.problemSolved.push(problemId);
               await req.result.save();
               }
           }


        // 11. Send result to user
        return res.status(200).json({

            message: status,

            testCasesPassed,

            totalTestCases: problem.hiddenTestCases.length,

            submission: updatedSubmission
        });

        


    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Error submitting code",
            error: err.message
        });
    }
};

const runCode = async (req, res) => {
    try {

        const problemId = req.params.id;
        const { code, language } = req.body;

        // 1. Check required fields
        if (!problemId || !code || !language) {
            return res.status(400).json({
                message: "Some field missing"
            });
        }

        // 2. Find problem
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        // 3. Get language configuration
        const languageConfig = getLanguageById(language);

        if (!languageConfig) {
            return res.status(400).json({
                message: `Unsupported language: ${language}`
            });
        }

        // 4. Create submissions using VISIBLE test cases
        const submission = problem.visibleTestCases.map(
            ({ input, output }) => ({
                source_code: code,
                language: languageConfig.language,
                versionIndex: languageConfig.versionIndex,
                stdin: input,
                expected_output: output
            })
        );

        // 5. Send code to JDoodle
        const submitResult = await submitBatch(submission);

        // 6. Check test cases
        let testCasesPassed = 0;

        const testCaseResults = [];

        for (let i = 0; i < submitResult.length; i++) {

            const actualOutput =
                submitResult[i].output?.trim();

            const expectedOutput =
                problem.visibleTestCases[i].output?.trim();

            const passed = actualOutput === expectedOutput;

            if (passed) {
                testCasesPassed++;
            }

            testCaseResults.push({
                input: problem.visibleTestCases[i].input,
                expectedOutput,
                actualOutput,
                passed
            });
        }

        // 7. Decide status
        let status = "Wrong Answer";

        if (testCasesPassed === problem.visibleTestCases.length) {
            status = "Accepted";
        }

        // 8. Send result
        return res.status(200).json({
            message: "Code executed successfully",
            status,
            testCasesPassed,
            totalTestCases: problem.visibleTestCases.length,
            testCases: testCaseResults
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Error running code",
            error: err.message
        });
    }
};
module.exports={submitCode,runCode};
    

