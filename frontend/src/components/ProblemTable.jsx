import { useNavigate } from "react-router-dom";

function ProblemTable({
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
        <div className="hidden overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm md:block">

            <div className="overflow-x-auto">

                <table className="table">

                    <thead>

                        <tr className="border-base-300 bg-base-200/60">

                            <th className="w-16">
                                #
                            </th>

                            <th>
                                Problem
                            </th>

                            <th>
                                Difficulty
                            </th>

                            <th>
                                Tags
                            </th>

                            <th>
                                Status
                            </th>

                            <th className="text-right">
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

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
                                    <tr
                                        key={problem._id}
                                        className="border-base-300 transition hover:bg-base-200/40"
                                    >

                                        <td className="font-mono text-sm text-base-content/40">
                                            {String(
                                                index + 1
                                            ).padStart(2, "0")}
                                        </td>


                                        <td>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/problem/${problem._id}`
                                                    )
                                                }
                                                className="text-left font-semibold hover:text-primary"
                                            >
                                                {problem.title}
                                            </button>

                                        </td>


                                        <td>

                                            <span
                                                className={`badge capitalize ${getDifficultyClass(
                                                    problem.difficulty
                                                )}`}
                                            >
                                                {problem.difficulty}
                                            </span>

                                        </td>


                                        <td>

                                            <div className="flex max-w-xs flex-wrap gap-1">

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

                                        </td>


                                        <td>

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

                                        </td>


                                        <td className="text-right">

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

                                        </td>

                                    </tr>
                                );
                            }
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default ProblemTable;