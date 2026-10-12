import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Icon from "../../components/Icon";

const titles = {
    "/admin": ["Dashboard", "Platform overview and activity"],
    "/admin/problems": ["Problems", "Create, edit and manage coding problems"],
    "/admin/users": ["Users", "Manage registered platform users"],
    "/admin/submissions": ["Submissions", "Inspect code execution and submission results"],
};

function AdminHeader({ onMenu }) {
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const exact = titles[location.pathname];
    const title = exact?.[0] || (location.pathname.includes("/problems/") ? "Problem" : location.pathname.includes("/users/") ? "User details" : location.pathname.includes("/submissions/") ? "Submission details" : "Admin");
    const subtitle = exact?.[1] || "CodeArena administration";

    return (
        <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
            <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <button onClick={onMenu} className="btn btn-ghost btn-square lg:hidden" aria-label="Open menu">
                        <Icon name="menu" size={22} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight sm:text-2xl">{title}</h1>
                        <p className="hidden text-xs text-base-content/50 sm:block">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-base-300 bg-base-200 px-3 py-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-primary font-bold text-primary-content">
                        {(user?.firstName || "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs font-bold">{user?.firstName || "Admin"}</p>
                        <p className="text-[10px] text-base-content/50">Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default AdminHeader;
