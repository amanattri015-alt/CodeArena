function Editorial({ problem }) {
    return (
        <div className="h-full overflow-y-auto px-6 py-6">

            <div className="mx-auto max-w-4xl">

                <div className="mb-8">
                    <h2 className="text-2xl font-bold">
                        Editorial
                    </h2>

                    <p className="mt-2 text-sm text-base-content/50">
                        Solution explanation for {problem.title}
                    </p>
                </div>

                {problem.editorial ? (
                    <article className="rounded-xl border border-base-300 bg-base-200/40 p-6">

                        <div className="whitespace-pre-wrap leading-8 text-base-content/80">
                            {problem.editorial}
                        </div>

                    </article>
                ) : (
                    <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-base-300 bg-base-200/40">

                        <div className="text-center">

                            <div className="text-4xl">
                                📚
                            </div>

                            <h3 className="mt-4 text-lg font-bold">
                                Editorial not available
                            </h3>

                            <p className="mt-2 text-sm text-base-content/50">
                                The editorial for this problem
                                has not been added yet.
                            </p>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default Editorial;