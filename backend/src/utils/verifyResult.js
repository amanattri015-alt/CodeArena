const normalizeOutput = (output) => {
    if (
        output === null ||
        output === undefined
    ) {
        return "";
    }

    return String(output)
        .replace(/\r/g, "")
        .trim()
        .replace(/\s+/g, " ");
};

const verifyResult = (
    submitResult,
    testCases
) => {
    if (!Array.isArray(submitResult)) {
        return false;
    }

    if (!Array.isArray(testCases)) {
        return false;
    }

    if (
        submitResult.length !==
        testCases.length
    ) {
        return false;
    }

    for (
        let i = 0;
        i < testCases.length;
        i++
    ) {
        const result = submitResult[i];

        /*
         * JDoodle/API error
         */
        if (!result || result.error) {
            return false;
        }

        const actualOutput =
            normalizeOutput(
                result.output
            );

        const expectedOutput =
            normalizeOutput(
                testCases[i]?.output
            );

        if (
            actualOutput !==
            expectedOutput
        ) {
            return false;
        }
    }

    return true;
};

module.exports = verifyResult;