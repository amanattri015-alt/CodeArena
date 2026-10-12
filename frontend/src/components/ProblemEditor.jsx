import CodeEditor from "./CodeEditor";

function ProblemEditor({
    problem,
    language,
    code,
    setCode,
    onLanguageChange,
    onReset,
    onRun,
    onSubmit,
    running,
    submitting,
}) {
    return (
        <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#1e1e1e]">

            {/* ================= TOP TOOLBAR ================= */}

            <div className="flex h-14 shrink-0 items-center justify-between border-b border-base-300 bg-base-200 px-4">

                {/* Language */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                        Language
                    </span>

                    <select
                        value={language}
                        onChange={(e) =>
                            onLanguageChange(e.target.value)
                        }
                        className="select select-sm select-bordered"
                    >
                        {problem?.startCode?.map((item) => (
                            <option
                                key={item.language}
                                value={item.language}
                            >
                                {item.language}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Reset */}
                <button
                    onClick={onReset}
                    className="btn btn-sm btn-ghost"
                >
                    Reset
                </button>
            </div>

            {/* ================= EDITOR ================= */}

            <div className="min-h-0 flex-1 overflow-hidden">
                <CodeEditor
                    language={language}
                    value={code}
                    onChange={setCode}
                    onReset={onReset}
                />
            </div>

            {/* ================= BOTTOM BUTTON BAR ================= */}

            <div className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-base-300 bg-base-200 px-4">

                <button
                    onClick={onReset}
                    disabled={running || submitting}
                    className="btn btn-sm btn-ghost"
                >
                    Reset
                </button>

                <button
                    onClick={onRun}
                    disabled={running || submitting}
                    className="btn btn-sm btn-outline"
                >
                    {running ? (
                        <>
                            <span className="loading loading-spinner loading-xs" />
                            Running...
                        </>
                    ) : (
                        "Run"
                    )}
                </button>

                <button
                    onClick={onSubmit}
                    disabled={running || submitting}
                    className="btn btn-sm btn-primary"
                >
                    {submitting ? (
                        <>
                            <span className="loading loading-spinner loading-xs" />
                            Submitting...
                        </>
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>
        </section>
    );
}

export default ProblemEditor;