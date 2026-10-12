import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import Icon from "./Icon";
import ProfileDropdown from "./ProfileDropdown";

const links = [
    {
        label: "Problems",
        to: "/",
    },
];

function Navbar() {
    const { user } = useSelector(
        (state) => state.auth
    );

    return (
        <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/95 backdrop-blur">
            <div className="navbar mx-auto min-h-16 max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* LEFT */}
                <div className="navbar-start gap-2">

                    <div className="dropdown lg:hidden">
                        <button
                            tabIndex={0}
                            className="btn btn-ghost btn-square"
                            aria-label="Open navigation"
                        >
                            <Icon name="menu" />
                        </button>

                        <ul className="menu dropdown-content z-50 mt-3 w-48 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl">
                            {links.map((link) => (
                                <li key={link.label}>
                                    <NavLink to={link.to}>
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}

                            {user?.role === "admin" && (
                                <li>
                                    <NavLink to="/admin">
                                        Admin
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    </div>

                    <NavLink
                        to="/"
                        className="flex items-center gap-3"
                    >
                        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-content">
                            <Icon
                                name="code"
                                size={20}
                            />
                        </span>

                        <span className="hidden text-lg font-bold tracking-tight sm:block">
                            CodeArena
                        </span>
                    </NavLink>
                </div>

                {/* CENTER */}
                <nav className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal gap-1 px-1 text-sm font-medium">
                        {links.map((link) => (
                            <li key={link.label}>
                                <NavLink
                                    to={link.to}
                                    className="rounded-lg"
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}

                        {user?.role === "admin" && (
                            <li>
                                <NavLink
                                    to="/admin"
                                    className="rounded-lg"
                                >
                                    Admin Console
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </nav>

                {/* RIGHT */}
                <div className="navbar-end gap-1 sm:gap-2">
                    <ProfileDropdown
                        user={user}

                        /*
                         * Temporary values.
                         * Replace these with API data.
                         */
                        totalAttempted={
                            user?.totalAttempted || 0
                        }

                        totalSolved={
                            user?.problemSolved?.length || 0
                        }

                        successRate={
                            user?.successRate || 0
                        }

                        currentStreak={
                            user?.currentStreak || 0
                        }

                        solvedProblems={
                            user?.solvedProblems || []
                        }
                    />
                </div>
            </div>
        </header>
    );
}

export default Navbar;