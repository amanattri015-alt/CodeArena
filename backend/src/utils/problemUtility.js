const axios = require("axios");

const JDOODLE_URL =
    "https://api.jdoodle.com/v1/execute";

const LANGUAGE_MAP = {
    "c++": {
    language: "cpp23",
    versionIndex: "0"
},

    java: {
        language: "java",
        versionIndex: "0",
    },

    javascript: {
        language: "nodejs",
        versionIndex: "0",
    },
};

const getLanguageById = (lang) => {
    if (!lang || typeof lang !== "string") {
        return null;
    }

    return (
        LANGUAGE_MAP[
            lang.trim().toLowerCase()
        ] || null
    );
};

/*
 * Execute one program on JDoodle.
 */
const executeCode = async (submission) => {
    try {
        const response = await axios.post(
            JDOODLE_URL,
            {
                clientId:
                    process.env.JDOODLE_CLIENT_ID,

                clientSecret:
                    process.env.JDOODLE_CLIENT_SECRET,

                script:
                    submission.source_code,

                stdin:
                    submission.stdin ?? "",

                language:
                    submission.language,

                versionIndex:
                    submission.versionIndex,

                compileOnly: false,
            },
            {
                /*
                 * JDoodle can sometimes take more
                 * than 30 seconds to respond.
                 */
                timeout: 60000,
            }
        );

        return response.data;
    } catch (error) {
        return {
            error:
                error.code === "ECONNABORTED"
                    ? "JDoodle request timed out"
                    : error.response?.data ||
                      error.message ||
                      "JDoodle execution failed",
        };
    }
};

/*
 * Execute test cases sequentially.
 *
 * We intentionally do NOT use Promise.all here.
 * JDoodle can rate-limit concurrent requests.
 */
const submitBatch = async (submissions) => {
    if (!Array.isArray(submissions)) {
        return [];
    }

    const results = [];

    for (const submission of submissions) {
        const result =
            await executeCode(submission);

        results.push(result);
    }

    return results;
};

module.exports = {
    getLanguageById,
    submitBatch,
};