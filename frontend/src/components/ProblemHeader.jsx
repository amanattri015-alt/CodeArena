import { useNavigate } from "react-router-dom";

function ProblemHeader({ problem }) {
    const navigate = useNavigate();

    // Homepage renders this header without a problem; never show a spinner forever
    if (!problem) return null;

    return (
        <header className="border-b border-base-300 bg-base-100">
            <div className="flex items-center justify-between px-5 py-4">

                {/* Left side */}
                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate("/")}
                        className="btn btn-sm btn-ghost"
                    >
                        ← Back
                    </button>

                    <div>
                        <h1 className="text-xl font-bold">
                            {problem.title}
                        </h1>

                        <div className="mt-1 flex items-center gap-2">
                            <span
                                className={`badge ${
                                    problem.difficulty === "easy"
                                        ? "badge-success"
                                        : problem.difficulty === "medium"
                                            ? "badge-warning"
                                            : "badge-error"
                                }`}
                            >
                                {problem.difficulty}
                            </span>

                            {problem.tags && (
                                <span className="badge badge-outline">
                                    {problem.tags}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="text-sm text-base-content/50">
                    CodeArena
                </div>

            </div>
        </header>
    );
}

export default ProblemHeader;