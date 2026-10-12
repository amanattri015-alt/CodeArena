import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../authSlice";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

const items = [
    { to: "/admin", label: "Dashboard", icon: "grid" },
    { to: "/admin/problems", label: "Problems", icon: "code" },
    { to: "/admin/users", label: "Users", icon: "users" },
    { to: "/admin/submissions", label: "Submissions", icon: "terminal" },
];

function AdminSidebar({ mobileOpen, onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    const logout = async () => {
        await dispatch(logoutUser());
        navigate("/login", { replace: true });
    };

    return (
        <>
            {mobileOpen && (
                <button
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={onClose}
                    aria-label="Close menu"
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-base-300 bg-base-100 transition-transform duration-200 lg:translate-x-0 ${
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
                <div className="flex h-20 items-center gap-3 border-b border-base-300 px-6">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-content">
                        <Icon name="code" size={22} />
                    </div>
                    <div>
                        <p className="font-black tracking-tight">CodeArena</p>
                        <p className="text-xs text-base-content/50">Admin Console</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    <p className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-wider text-base-content/40">
                        Management
                    </p>
                    {items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/admin"}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                                    isActive
                                        ? "bg-primary text-primary-content shadow-sm"
                                        : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                                }`
                            }
                        >
                            <Icon name={item.icon} size={19} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-base-300 p-4">
                    <div className="mb-3 rounded-xl bg-base-200 p-3">
                        <p className="truncate text-sm font-bold">{user?.firstName || "Admin"}</p>
                        <p className="truncate text-xs text-base-content/50">{user?.emailId}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="btn btn-ghost w-full justify-start gap-3 text-error"
                    >
                        <Icon name="logout" size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}

export default AdminSidebar;
