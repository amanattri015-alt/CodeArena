const normalizeOutput = (output) => {
    if (output === null || output === undefined) return "";

    // Ignore CRLF differences, surrounding whitespace and repeated whitespace,
    // but keep all non-whitespace characters in order.
    return String(output)
        .replace(/\r/g, "")
        .trim()
        .replace(/\s+/g, " ");
};

const verifyResult = (executionResults, testCases) => {
    if (!Array.isArray(executionResults) || !Array.isArray(testCases)) return false;
    if (executionResults.length !== testCases.length) return false;

    return testCases.every((testCase, index) => {
        const result = executionResults[index];
        if (!result || result.error) return false;

        return normalizeOutput(result.output) === normalizeOutput(testCase?.output);
    });
};

const getFirstFailure = (executionResults, testCases) => {
    if (!Array.isArray(executionResults) || !Array.isArray(testCases)) {
        return { index: 0, reason: "Invalid execution/test-case result format" };
    }

    if (executionResults.length !== testCases.length) {
        return {
            index: Math.min(executionResults.length, testCases.length),
            reason: `Expected ${testCases.length} execution results but received ${executionResults.length}`,
        };
    }

    for (let index = 0; index < testCases.length; index++) {
        const result = executionResults[index];
        if (!result) {
            return { index, reason: "The execution service returned an empty result" };
        }
        if (result.error) {
            return {
                index,
                reason: typeof result.error === "string"
                    ? result.error
                    : JSON.stringify(result.error),
                result,
            };
        }

        const actual = normalizeOutput(result.output);
        const expected = normalizeOutput(testCases[index]?.output);
        if (actual !== expected) {
            return {
                index,
                reason: "Actual output did not match expected output",
                expected: String(testCases[index]?.output ?? ""),
                actual: String(result.output ?? ""),
                result,
            };
        }
    }

    return null;
};

module.exports = verifyResult;
module.exports.normalizeOutput = normalizeOutput;
module.exports.getFirstFailure = getFirstFailure;
