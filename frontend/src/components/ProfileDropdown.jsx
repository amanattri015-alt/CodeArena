import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";
import Icon from "./Icon";

const DEFAULT_STATS = {
    attempted: 0,
    solved: 0,
    successRate: 0,
    currentStreak: 0,
};

function ProfileDropdown({ user }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [stats, setStats] = useState(DEFAULT_STATS);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [loading, setLoading] = useState(false);

    // -----------------------------
    // User information
    // -----------------------------
    const username =
        user?.username ||
        user?.userName ||
        user?.firstName ||
        "User";

    const email = user?.emailId || user?.email || "No email available";

    const initials = username.charAt(0).toUpperCase();

    const accountStatus =
        user?.accountStatus ||
        (user?.isPremium ? "Premium" : "Free");

    // -----------------------------
    // Load stats + solved problems
    // -----------------------------
   useEffect(() => {
    if (!isOpen || !user) return;

    const loadProfileData = async () => {
        setLoading(true);

        const results = await Promise.allSettled([
            axiosClient.get("/problem/stats"),
            axiosClient.get("/problem/problemSolvedByUser"),
            axiosClient.get("/problem/getAllProblem"),
        ]);

        const [statsResult, solvedResult, allResult] = results;

        // Stats
        if (statsResult.status === "fulfilled") {
            setStats(
                statsResult.value.data?.stats || DEFAULT_STATS
            );
        } else {
            console.error("Stats failed:", statsResult.reason);
        }

        // Solved problems
        if (solvedResult.status === "fulfilled") {
            const d = solvedResult.value.data;
            const raw = Array.isArray(d)
                ? d
                : d?.problems || d?.solvedProblems || d?.problemSolved || d?.data || [];

            const a = allResult.status === "fulfilled" ? allResult.value.data : [];
            const all = Array.isArray(a) ? a : a?.problems || a?.data || [];

            // Items may be full problems, populated refs, or plain IDs: resolve all to problem data
            const mapped = raw
                .map((item) => {
                    const ref = item?.problemId ?? item;
                    if (ref?.title) return ref;
                    const id = String(ref?._id ?? ref);
                    return all.find((p) => String(p._id) === id);
                })
                .filter(Boolean)
                .map((p) => ({
                    ...p,
                    tags: Array.isArray(p.tags) ? p.tags : p.tags ? [p.tags] : [],
                }));

            setSolvedProblems(mapped);
        } else {
            console.error(
                "Solved problems failed:",
                solvedResult.reason
            );
        }

        setLoading(false);
    };

    loadProfileData();
}, [isOpen, user]);

    // -----------------------------
    // Close dropdown
    // -----------------------------
    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [isOpen]);

    // -----------------------------
    // Actions
    // -----------------------------
    const handleLogout = async () => {
        if (isLoggingOut) return;

        try {
            setIsLoggingOut(true);

            await dispatch(logoutUser()).unwrap();

            navigate("/login", {
                replace: true,
            });
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };

    const handleProfileSettings = () => {
        setIsOpen(false);
        navigate("/profile");
    };

    const handleProblemClick = (problem) => {
        if (!problem?._id) return;

        setIsOpen(false);
        navigate(`/problem/${problem._id}`);
    };

    // -----------------------------
    // Helpers
    // -----------------------------
    const difficultyClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "bg-success/15 text-success";

            case "medium":
                return "bg-warning/15 text-warning";

            case "hard":
                return "bg-error/15 text-error";

            default:
                return "bg-base-300 text-base-content/60";
        }
    };

    const display = (value) =>
        loading ? "..." : value;

    return (
        <div
            ref={dropdownRef}
            className="relative shrink-0"
        >
            {/* Profile Button */}
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label="Open profile menu"
                aria-expanded={isOpen}
                className="
                    flex items-center gap-2 rounded-xl p-1.5
                    transition hover:bg-base-200
                    focus:outline-none focus:ring-2
                    focus:ring-primary/30
                "
            >
                <span
                    className="
                        grid size-9 place-items-center
                        rounded-full bg-primary/15
                        text-sm font-bold text-primary
                    "
                >
                    {initials}
                </span>

                <span
                    className="
                        hidden max-w-28 truncate
                        text-sm font-semibold sm:block
                    "
                >
                    {username}
                </span>

                <span
                    className={`
                        transition-transform duration-200
                        ${isOpen ? "rotate-180" : ""}
                    `}
                >
                    <Icon name="chevron" size={15} />
                </span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="
                        absolute right-0 top-full z-[200] mt-3
                        w-[min(390px,calc(100vw-20px))]
                        flex max-h-[calc(100vh-120px)] flex-col
                        overflow-hidden rounded-2xl
                        border border-base-300
                        bg-base-100 shadow-2xl
                    "
                >
                    <div
                        className="
                            min-h-0 flex-1
                            overflow-y-auto
                        "
                    >
                        {/* User Info */}
                        <section className="border-b border-base-300 p-5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        grid size-12 shrink-0
                                        place-items-center rounded-full
                                        bg-primary text-lg font-bold
                                        text-primary-content
                                    "
                                >
                                    {initials}
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-base-content/50">
                                        Welcome back, {username} 👋
                                    </p>

                                    <h3 className="mt-1 truncate text-base font-bold">
                                        {username}
                                    </h3>

                                    <p className="mt-1 truncate text-xs text-base-content/50">
                                        {email}
                                    </p>
                                </div>
                            </div>

                            {/* Account Status */}
                            <div
                                className="
                                    mt-4 flex items-center
                                    justify-between rounded-xl
                                    bg-base-200/60 px-3 py-3
                                "
                            >
                                <div>
                                    <p
                                        className="
                                            text-[10px] font-semibold
                                            uppercase tracking-wider
                                            text-base-content/40
                                        "
                                    >
                                        Account Status
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {accountStatus}
                                    </p>
                                </div>

                                <span
                                    className="
                                        rounded-full bg-success/15
                                        px-2.5 py-1 text-xs
                                        font-semibold text-success
                                    "
                                >
                                    Active
                                </span>
                            </div>
                        </section>

                        {/* Performance */}
                        <section className="border-b border-base-300 p-5">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold">
                                    Performance
                                </h3>

                                <p className="mt-1 text-xs text-base-content/50">
                                    Your coding progress
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <StatCard
                                    label="Attempted"
                                    value={display(stats.attempted)}
                                />

                                <StatCard
                                    label="Solved"
                                    value={display(stats.solved)}
                                    valueClass="text-success"
                                />

                                <StatCard
                                    label="Success Rate"
                                    value={
                                        loading
                                            ? "..."
                                            : `${Number(
                                                  stats.successRate
                                              ).toFixed(1)}%`
                                    }
                                    valueClass="text-primary"
                                />

                                <StatCard
                                    label="Streak"
                                    value={
                                        loading
                                            ? "..."
                                            : `${stats.currentStreak} 🔥`
                                    }
                                    valueClass="text-warning"
                                />
                            </div>
                        </section>

                        {/* Solved Problems */}
                        <section className="border-b border-base-300 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold">
                                        Solved Problems
                                    </h3>

                                    <p className="mt-1 text-xs text-base-content/50">
                                        Problems you have solved
                                    </p>
                                </div>

                                <span
                                    className="
                                        rounded-full bg-success/10
                                        px-2.5 py-1 text-xs
                                        font-semibold text-success
                                    "
                                >
                                    {display(stats.solved)}
                                </span>
                            </div>

                            {loading ? (
                                <div
                                    className="
                                        flex items-center
                                        justify-center rounded-xl
                                        border border-base-300
                                        bg-base-200/40 p-6
                                    "
                                >
                                    <span className="loading loading-spinner loading-sm text-primary" />
                                </div>
                            ) : solvedProblems.length === 0 ? (
                                <EmptySolved />
                            ) : (
                                <div className="space-y-2">
                                    {solvedProblems.map((problem) => (
                                        <SolvedProblem
                                            key={problem._id}
                                            problem={problem}
                                            onClick={handleProblemClick}
                                            difficultyClass={
                                                difficultyClass
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-base-300 bg-base-100 p-3">
                        <button
                            type="button"
                            onClick={handleProfileSettings}
                            className="
                                flex w-full items-center gap-3
                                rounded-xl px-3 py-3
                                text-left text-sm font-medium
                                transition hover:bg-base-200
                            "
                        >
                            <span>⚙️</span>
                            <span>Profile Settings</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="
                                flex w-full items-center gap-3
                                rounded-xl px-3 py-3
                                text-left text-sm font-medium
                                text-error transition
                                hover:bg-error/10
                                disabled:opacity-60
                            "
                        >
                            {isLoggingOut ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <Icon name="logout" size={17} />
                            )}

                            <span>
                                {isLoggingOut
                                    ? "Logging out..."
                                    : "Logout"}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// --------------------------------------
// Small reusable components
// --------------------------------------

function StatCard({
    label,
    value,
    valueClass = "",
}) {
    return (
        <div className="rounded-xl border border-base-300 bg-base-200/40 p-3">
            <p className="text-xs text-base-content/50">
                {label}
            </p>

            <p
                className={`mt-1 text-xl font-bold ${valueClass}`}
            >
                {value}
            </p>
        </div>
    );
}

function EmptySolved() {
    return (
        <div
            className="
                rounded-xl border border-dashed
                border-base-300 p-5 text-center
            "
        >
            <div className="text-2xl">🧩</div>

            <p className="mt-2 text-sm font-medium">
                No solved problems yet
            </p>

            <p className="mt-1 text-xs text-base-content/50">
                Start solving problems to build your streak.
            </p>
        </div>
    );
}

function SolvedProblem({
    problem,
    onClick,
    difficultyClass,
}) {
    return (
        <button
            type="button"
            onClick={() => onClick(problem)}
            className="
                w-full rounded-xl border
                border-base-300 bg-base-100 p-3
                text-left transition
                hover:border-primary/40
                hover:bg-base-200
            "
        >
            <div className="flex items-start justify-between gap-3">
                <span
                    className="
                        min-w-0 truncate
                        text-sm font-semibold
                    "
                >
                    {problem.title}
                </span>

                <span className="shrink-0 text-xs text-base-content/40">
                    →
                </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {problem.difficulty && (
                    <span
                        className={`
                            rounded-full px-2 py-0.5
                            text-[10px] font-semibold
                            ${difficultyClass(problem.difficulty)}
                        `}
                    >
                        {problem.difficulty}
                    </span>
                )}

                {problem.tags?.slice(0, 3).map((tag) => (
                    <span
                        key={tag}
                        className="
                            rounded-full bg-base-200
                            px-2 py-0.5 text-[10px]
                            text-base-content/60
                        "
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </button>
    );
}

export default ProfileDropdown;