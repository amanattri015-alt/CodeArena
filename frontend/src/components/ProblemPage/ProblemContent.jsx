function ProblemContent({ problem }) {
    return (
        <div className="h-full overflow-y-auto px-6 py-6">

            {/* Description */}
            <section>
                <h2 className="text-2xl font-bold">
                    Description
                </h2>

                <p className="mt-5 whitespace-pre-wrap leading-7 text-base-content/80">
                    {problem.description}
                </p>
            </section>

            {/* Examples */}
            {problem.visibleTestCases?.length > 0 && (
                <section className="mt-8">

                    <h2 className="text-2xl font-bold">
                        Examples
                    </h2>

                    <div className="mt-5 space-y-5">

                        {problem.visibleTestCases.map(
                            (testCase, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-base-300 bg-base-200/50 p-5"
                                >

                                    <h3 className="font-bold">
                                        Example {index + 1}
                                    </h3>

                                    {/* Input */}
                                    <div className="mt-5">
                                        <p className="mb-2 text-xs font-semibold uppercase text-base-content/50">
                                            Input
                                        </p>

                                        <pre className="overflow-x-auto rounded-lg bg-base-300 p-4 text-sm">
                                            {testCase.input}
                                        </pre>
                                    </div>

                                    {/* Output */}
                                    <div className="mt-4">
                                        <p className="mb-2 text-xs font-semibold uppercase text-base-content/50">
                                            Output
                                        </p>

                                        <pre className="overflow-x-auto rounded-lg bg-base-300 p-4 text-sm">
                                            {testCase.output}
                                        </pre>
                                    </div>

                                    {/* Explanation */}
                                    {testCase.explanation && (
                                        <div className="mt-4">

                                            <p className="mb-2 text-xs font-semibold uppercase text-base-content/50">
                                                Explanation
                                            </p>

                                            <p className="leading-7 text-base-content/70">
                                                {testCase.explanation}
                                            </p>

                                        </div>
                                    )}

                                </div>
                            )
                        )}

                    </div>

                </section>
            )}

        </div>
    );
}

export default ProblemContent;