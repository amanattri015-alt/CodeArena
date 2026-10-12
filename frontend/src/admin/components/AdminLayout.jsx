import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-base-200">
            <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <div className="lg:pl-72">
                <AdminHeader onMenu={() => setMobileOpen(true)} />
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
