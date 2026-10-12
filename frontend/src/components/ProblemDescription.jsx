function ProblemDescription({ problem }) {
    return (
        <div className="space-y-6 p-5">
            {/* Description */}
            <section>
                <h2 className="mb-3 text-lg font-bold">
                    Description
                </h2>

                <div className="whitespace-pre-wrap text-sm leading-7 text-base-content/80">
                    {problem.description}
                </div>
            </section>

            {/* Examples */}
            {problem.visibleTestCases?.length > 0 && (
                <section>
                    <h2 className="mb-4 text-lg font-bold">
                        Examples
                    </h2>

                    <div className="space-y-5">
                        {problem.visibleTestCases.map(
                            (testCase, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-base-300 bg-base-200"
                                >
                                    <div className="border-b border-base-300 px-4 py-3">
                                        <span className="font-semibold">
                                            Example {index + 1}
                                        </span>
                                    </div>

                                    <div className="space-y-4 p-4">
                                        <div>
                                            <p className="mb-1 text-xs font-semibold uppercase text-base-content/50">
                                                Input
                                            </p>

                                            <pre className="overflow-x-auto rounded-md bg-base-300 p-3 text-sm">
                                                {testCase.input}
                                            </pre>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs font-semibold uppercase text-base-content/50">
                                                Output
                                            </p>

                                            <pre className="overflow-x-auto rounded-md bg-base-300 p-3 text-sm">
                                                {testCase.output}
                                            </pre>
                                        </div>

                                        {testCase.explanation && (
                                            <div>
                                                <p className="mb-1 text-xs font-semibold uppercase text-base-content/50">
                                                    Explanation
                                                </p>

                                                <p className="text-sm leading-6 text-base-content/70">
                                                    {
                                                        testCase.explanation
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

export default ProblemDescription;