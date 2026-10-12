import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useSelector
} from "react-redux";

import axiosClient from "../utils/axiosClient";

import Navbar from "../components/Navbar";
import ProblemHeader from "../components/ProblemHeader";
import ProblemFilters from "../components/ProblemFilters";
import ProblemTable from "../components/ProblemTable";
import ProblemCard from "../components/ProblemCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";


function Homepage() {

    const { user } = useSelector(
        (state) => state.auth
    );


    const [problems, setProblems] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [difficulty, setDifficulty] =
        useState("all");

    const [topic, setTopic] =
        useState("all");

    const [status, setStatus] =
        useState("all");

    const [sortBy, setSortBy] =
        useState("default");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ================= FETCH =================

    const fetchProblems = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await axiosClient.get(
                        "/problem/getAllProblem"
                    );

                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.problems ||
                          response.data?.data ||
                          [];

                setProblems(data);

            } catch (error) {

                console.error(error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load problems"
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    useEffect(() => {

        fetchProblems();

    }, [fetchProblems]);


    // ================= TAGS =================

    const getTags = useCallback(
        (tags) => {

            if (Array.isArray(tags)) {
                return tags;
            }

            if (!tags) {
                return [];
            }

            return [String(tags)];

        },
        []
    );


    // ================= STATUS =================

    const getStatus = useCallback(
        (problem) => {

            const solved =
                user?.problemSolved || [];

            const isSolved =
                solved.some(
                    (id) =>
                        String(id) ===
                        String(problem._id)
                );

            return isSolved
                ? "Solved"
                : "Unsolved";

        },
        [user]
    );


    // ================= TOPICS =================

    const topics = useMemo(() => {

        const set = new Set();

        problems.forEach((problem) => {

            getTags(problem.tags)
                .forEach((tag) => {

                    set.add(
                        String(tag)
                    );

                });

        });

        return [...set].sort();

    }, [problems, getTags]);


    // ================= FILTER =================

    const filteredProblems = useMemo(() => {

        let result =
            problems.filter(
                (problem) => {

                    const tags =
                        getTags(
                            problem.tags
                        );

                    const query =
                        search
                            .trim()
                            .toLowerCase();


                    const matchesSearch =
                        !query ||
                        problem.title
                            ?.toLowerCase()
                            .includes(query) ||
                        tags.some(
                            (tag) =>
                                String(tag)
                                    .toLowerCase()
                                    .includes(query)
                        );


                    const matchesDifficulty =
                        difficulty === "all" ||
                        problem.difficulty ===
                            difficulty;


                    const matchesTopic =
                        topic === "all" ||
                        tags.some(
                            (tag) =>
                                String(tag)
                                    .toLowerCase() ===
                                topic.toLowerCase()
                        );


                    const matchesStatus =
                        status === "all" ||
                        getStatus(problem) ===
                            status;


                    return (
                        matchesSearch &&
                        matchesDifficulty &&
                        matchesTopic &&
                        matchesStatus
                    );

                }
            );


        // SORT

        if (sortBy === "title") {

            result.sort(
                (a, b) =>
                    a.title.localeCompare(
                        b.title
                    )
            );

        }


        if (sortBy === "easy") {

            const order = {
                easy: 1,
                medium: 2,
                hard: 3
            };

            result.sort(
                (a, b) =>
                    order[a.difficulty] -
                    order[b.difficulty]
            );

        }


        if (sortBy === "hard") {

            const order = {
                hard: 1,
                medium: 2,
                easy: 3
            };

            result.sort(
                (a, b) =>
                    order[a.difficulty] -
                    order[b.difficulty]
            );

        }


        return result;

    }, [
        problems,
        search,
        difficulty,
        topic,
        status,
        sortBy,
        getTags,
        getStatus
    ]);


    // ================= STATISTICS =================

    const solvedProblems =
        problems.filter(
            (problem) =>
                getStatus(problem) ===
                "Solved"
        ).length;


    // ================= RESET =================

    const resetFilters = () => {

        setSearch("");
        setDifficulty("all");
        setTopic("all");
        setStatus("all");
        setSortBy("default");

    };


    // ================= LOADING =================

    if (loading) {

        return (
            <div className="min-h-screen bg-base-200">

                <Navbar />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

                    <LoadingSkeleton />

                </main>

            </div>
        );

    }


    return (
        <div className="min-h-screen bg-base-200">

            <Navbar />


            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

                {/* HEADER */}

                <ProblemHeader
                    totalProblems={
                        problems.length
                    }
                    solvedProblems={
                        solvedProblems
                    }
                />


                {/* ERROR */}

                {error && (

                    <div className="alert alert-error mb-6">

                        <div>

                            <h3 className="font-bold">
                                Unable to load problems
                            </h3>

                            <p className="text-sm">
                                {error}
                            </p>

                        </div>


                        <button
                            onClick={fetchProblems}
                            className="btn btn-sm"
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* FILTERS */}

                <ProblemFilters
                    search={search}
                    setSearch={setSearch}

                    difficulty={difficulty}
                    setDifficulty={
                        setDifficulty
                    }

                    topic={topic}
                    setTopic={setTopic}

                    status={status}
                    setStatus={setStatus}

                    sortBy={sortBy}
                    setSortBy={setSortBy}

                    topics={topics}

                    onReset={
                        resetFilters
                    }
                />


                {/* RESULTS HEADER */}

                <div className="mb-3 mt-7">

                    <h2 className="text-lg font-bold">
                        Problems
                    </h2>

                    <p className="text-sm text-base-content/50">
                        {filteredProblems.length}{" "}
                        problem
                        {filteredProblems.length !==
                        1
                            ? "s"
                            : ""}{" "}
                        found
                    </p>

                </div>


                {/* EMPTY */}

                {filteredProblems.length ===
                    0 && !error && (

                    <EmptyState
                        onReset={
                            resetFilters
                        }
                    />

                )}


                {/* DESKTOP */}

                {filteredProblems.length >
                    0 && (

                    <ProblemTable
                        problems={
                            filteredProblems
                        }
                        getStatus={
                            getStatus
                        }
                        getTags={
                            getTags
                        }
                    />

                )}


                {/* MOBILE */}

                {filteredProblems.length >
                    0 && (

                    <ProblemCard
                        problems={
                            filteredProblems
                        }
                        getStatus={
                            getStatus
                        }
                        getTags={
                            getTags
                        }
                    />

                )}

            </main>

        </div>
    );
}


export default Homepage;