import SubmissionResult from "./SubmissionResult";

function ProblemConsole({
    result,
    error,
    onClose,
}) {
    return (
        <div className="flex h-full min-h-0 w-full flex-col bg-[#171a1d]">

            {/* ================= HEADER ================= */}

            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#30343b] px-6">

                <h2 className="text-lg font-bold text-white">
                    Output Window
                </h2>

                <button
                    onClick={onClose}
                    className="text-2xl text-gray-400 transition hover:text-white"
                    title="Close output"
                >
                    ×
                </button>

            </div>

            {/* ================= TABS ================= */}

            <div className="flex h-14 shrink-0 border-b border-[#30343b]">

                <div className="flex items-center border-b-2 border-primary px-6 font-semibold text-primary">
                    Compilation Results
                </div>

                <div className="flex items-center px-6 text-gray-400">
                    Test Cases
                </div>

            </div>

            {/* ================= CONTENT ================= */}

            <div className="min-h-0 flex-1 overflow-y-auto">

                {error ? (
                    <div className="p-6">

                        <div className="rounded-xl border border-error/30 bg-error/10 p-5">

                            <h3 className="text-xl font-bold text-error">
                                Execution Error
                            </h3>

                            <pre className="mt-4 whitespace-pre-wrap text-sm text-error">
                                {error}
                            </pre>

                        </div>

                    </div>
                ) : (
                    <SubmissionResult result={result} />
                )}

            </div>

        </div>
    );
}

export default ProblemConsole;