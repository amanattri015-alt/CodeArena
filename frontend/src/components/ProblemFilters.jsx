function ProblemFilters({
    search,
    setSearch,
    difficulty,
    setDifficulty,
    topic,
    setTopic,
    status,
    setStatus,
    sortBy,
    setSortBy,
    topics,
    onReset
}) {
    return (
        <section className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">

            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px_180px_auto]">

                {/* SEARCH */}

                <label className="input input-bordered flex items-center gap-2">

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-base-content/40"
                    >
                        <circle
                            cx="11"
                            cy="11"
                            r="8"
                        />

                        <path d="m21 21-4.3-4.3" />
                    </svg>

                    <input
                        type="search"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search problems or tags..."
                        className="grow"
                    />

                </label>


                {/* DIFFICULTY */}

                <select
                    value={difficulty}
                    onChange={(e) =>
                        setDifficulty(e.target.value)
                    }
                    className="select select-bordered"
                >
                    <option value="all">
                        All Difficulty
                    </option>

                    <option value="easy">
                        Easy
                    </option>

                    <option value="medium">
                        Medium
                    </option>

                    <option value="hard">
                        Hard
                    </option>
                </select>


                {/* TOPIC */}

                <select
                    value={topic}
                    onChange={(e) =>
                        setTopic(e.target.value)
                    }
                    className="select select-bordered"
                >
                    <option value="all">
                        All Topics
                    </option>

                    {topics.map((item) => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>
                    ))}
                </select>


                {/* STATUS */}

                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value)
                    }
                    className="select select-bordered"
                >
                    <option value="all">
                        All Status
                    </option>

                    <option value="Solved">
                        Solved
                    </option>

                    <option value="Unsolved">
                        Unsolved
                    </option>
                </select>


                {/* RESET */}

                <button
                    onClick={onReset}
                    className="btn btn-outline"
                >
                    Reset
                </button>

            </div>


            {/* QUICK DIFFICULTY FILTERS */}

            <div className="mt-4 flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex flex-wrap gap-2">

                    <button
                        onClick={() =>
                            setDifficulty("all")
                        }
                        className={`btn btn-sm ${
                            difficulty === "all"
                                ? "btn-primary"
                                : "btn-ghost"
                        }`}
                    >
                        All
                    </button>

                    <button
                        onClick={() =>
                            setDifficulty("easy")
                        }
                        className={`btn btn-sm ${
                            difficulty === "easy"
                                ? "btn-success"
                                : "btn-ghost"
                        }`}
                    >
                        Easy
                    </button>

                    <button
                        onClick={() =>
                            setDifficulty("medium")
                        }
                        className={`btn btn-sm ${
                            difficulty === "medium"
                                ? "btn-warning"
                                : "btn-ghost"
                        }`}
                    >
                        Medium
                    </button>

                    <button
                        onClick={() =>
                            setDifficulty("hard")
                        }
                        className={`btn btn-sm ${
                            difficulty === "hard"
                                ? "btn-error"
                                : "btn-ghost"
                        }`}
                    >
                        Hard
                    </button>

                </div>


                {/* SORT */}

                <div className="flex items-center gap-2">

                    <span className="text-sm text-base-content/50">
                        Sort:
                    </span>

                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value)
                        }
                        className="select select-bordered select-sm"
                    >
                        <option value="default">
                            Default
                        </option>

                        <option value="title">
                            Title
                        </option>

                        <option value="easy">
                            Easy → Hard
                        </option>

                        <option value="hard">
                            Hard → Easy
                        </option>
                    </select>

                </div>

            </div>

        </section>
    );
}

export default ProblemFilters;