function SubmissionResult({ result }) {
    if (!result) {
        return (
            <div className="flex h-full items-center justify-center p-8">

                <div className="text-center">

                    <div className="text-4xl">
                        ▶
                    </div>

                    <h3 className="mt-4 font-semibold text-white">
                        Run your code
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Test case results will appear here.
                    </p>

                </div>

            </div>
        );
    }

    const data = result.data;

    const results = data?.results || [];

    const calculatedPassed = results.filter(
        (testCase) => testCase.isCorrect
    ).length;

    const passed =
        data?.passed ?? calculatedPassed;

    const total =
        data?.total ?? results.length;

    const status =
        data?.status ||
        (passed === total
            ? "Accepted"
            : "Wrong Answer");

    const accepted = status === "Accepted";

    return (
        <div className="space-y-6 p-6">

            {/* ================================================= */}
            {/* SUMMARY                                           */}
            {/* ================================================= */}

            <div
                className={`rounded-xl border p-6 ${
                    accepted
                        ? "border-success/30 bg-success/10"
                        : "border-error/30 bg-error/10"
                }`}
            >

                <div className="flex items-center justify-between">

                    <div>

                        <h2
                            className={`text-2xl font-bold ${
                                accepted
                                    ? "text-success"
                                    : "text-error"
                            }`}
                        >
                            {accepted
                                ? "Accepted"
                                : status}
                        </h2>

                        <p className="mt-2 text-base text-gray-300">
                            {passed} / {total} test cases passed
                        </p>

                    </div>

                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold ${
                            accepted
                                ? "bg-success/20 text-success"
                                : "bg-error/20 text-error"
                        }`}
                    >
                        {accepted ? "✓" : "×"}
                    </div>

                </div>

                {/* Runtime / Memory */}

                {result.type === "submit" && (
                    <div className="mt-5 grid grid-cols-2 gap-4">

                        <div className="rounded-lg bg-base-100/60 p-4">
                            <p className="text-xs uppercase text-gray-500">
                                Runtime
                            </p>

                            <p className="mt-1 font-semibold text-white">
                                {data.runtime ?? 0}
                            </p>
                        </div>

                        <div className="rounded-lg bg-base-100/60 p-4">
                            <p className="text-xs uppercase text-gray-500">
                                Memory
                            </p>

                            <p className="mt-1 font-semibold text-white">
                                {data.memory ?? 0}
                            </p>
                        </div>

                    </div>
                )}

            </div>

            {/* ================================================= */}
            {/* TEST CASES                                        */}
            {/* ================================================= */}

            <div>

                <h3 className="mb-4 text-xl font-bold text-white">
                    Test Cases
                </h3>

                <div className="space-y-4">

                    {results.map((testCase, index) => {

                        const passedCase =
                            testCase.isCorrect;

                        return (
                            <div
                                key={index}
                                className={`overflow-hidden rounded-xl border ${
                                    passedCase
                                        ? "border-success/30"
                                        : "border-error/30"
                                }`}
                            >

                                {/* TEST CASE HEADER */}

                                <div
                                    className={`flex items-center justify-between px-5 py-4 ${
                                        passedCase
                                            ? "bg-success/10"
                                            : "bg-error/10"
                                    }`}
                                >

                                    <div className="flex items-center gap-3">

                                        <span className="font-semibold text-white">
                                            Test Case {index + 1}
                                        </span>

                                    </div>

                                    <span
                                        className={`font-semibold ${
                                            passedCase
                                                ? "text-success"
                                                : "text-error"
                                        }`}
                                    >
                                        {passedCase
                                            ? "✓ Passed"
                                            : "✕ Failed"}
                                    </span>

                                </div>

                                {/* TEST CASE CONTENT */}

                                <div className="space-y-4 p-5">

                                    {/* INPUT */}

                                    <div>

                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Input
                                        </p>

                                        <pre className="overflow-x-auto rounded-lg bg-[#111418] p-4 text-sm text-gray-200">
                                            {testCase.input || "No input"}
                                        </pre>

                                    </div>

                                    {/* EXPECTED */}

                                    <div>

                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Expected Output
                                        </p>

                                        <pre className="overflow-x-auto rounded-lg bg-[#111418] p-4 text-sm text-gray-200">
                                            {testCase.expectedOutput ||
                                                "No output"}
                                        </pre>

                                    </div>

                                    {/* ACTUAL */}

                                    <div>

                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Your Output
                                        </p>

                                        <pre
                                            className={`overflow-x-auto rounded-lg p-4 text-sm ${
                                                passedCase
                                                    ? "bg-success/10 text-success"
                                                    : "bg-error/10 text-error"
                                            }`}
                                        >
                                            {testCase.actualOutput ||
                                                "No output"}
                                        </pre>

                                    </div>

                                    {/* ERROR */}

                                    {testCase.error && (
                                        <div>

                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-error">
                                                Error
                                            </p>

                                            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-error/10 p-4 text-sm text-error">
                                                {typeof testCase.error ===
                                                "string"
                                                    ? testCase.error
                                                    : JSON.stringify(
                                                          testCase.error,
                                                          null,
                                                          2
                                                      )}
                                            </pre>

                                        </div>
                                    )}

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}

export default SubmissionResult;