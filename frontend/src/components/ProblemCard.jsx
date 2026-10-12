import { useNavigate } from "react-router-dom";

function ProblemCard({
    problems,
    getStatus,
    getTags
}) {
    const navigate = useNavigate();

    const getDifficultyClass = (difficulty) => {
        if (difficulty === "easy") {
            return "badge-success badge-outline";
        }

        if (difficulty === "medium") {
            return "badge-warning badge-outline";
        }

        return "badge-error badge-outline";
    };

    return (
        <div className="space-y-3 md:hidden">

            {problems.map(
                (problem, index) => {

                    const tags =
                        getTags(
                            problem.tags
                        );

                    const status =
                        getStatus(
                            problem
                        );

                    return (
                        <article
                            key={problem._id}
                            className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
                        >

                            <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                    <p className="font-mono text-xs text-base-content/40">
                                        #
                                        {String(
                                            index + 1
                                        ).padStart(
                                            2,
                                            "0"
                                        )}
                                    </p>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/problem/${problem._id}`
                                            )
                                        }
                                        className="mt-1 text-left font-semibold leading-6 hover:text-primary"
                                    >
                                        {problem.title}
                                    </button>

                                </div>


                                <span
                                    className={`badge shrink-0 capitalize ${getDifficultyClass(
                                        problem.difficulty
                                    )}`}
                                >
                                    {problem.difficulty}
                                </span>

                            </div>


                            <div className="mt-3 flex flex-wrap gap-1">

                                {tags.map(
                                    (tag) => (
                                        <span
                                            key={tag}
                                            className="badge badge-ghost badge-sm capitalize"
                                        >
                                            {tag}
                                        </span>
                                    )
                                )}

                            </div>


                            <div className="mt-4 flex items-center justify-between">

                                <span
                                    className={`flex items-center gap-2 text-sm font-medium ${
                                        status ===
                                        "Solved"
                                            ? "text-success"
                                            : "text-base-content/40"
                                    }`}
                                >

                                    <span className="size-2 rounded-full bg-current" />

                                    {status}

                                </span>


                                <button
                                    onClick={() =>
                                        navigate(
                                            `/problem/${problem._id}`
                                        )
                                    }
                                    className="btn btn-primary btn-sm"
                                >
                                    Solve
                                </button>

                            </div>

                        </article>
                    );
                }
            )}

        </div>
    );
}

export default ProblemCard;