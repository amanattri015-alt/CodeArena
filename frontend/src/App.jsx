import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProblemPage from "./pages/ProblemPage";

import AdminRoute from "./admin/AdminRoute";
import AdminLayout from "./admin/components/AdminLayout";

import Dashboard from "./admin/pages/Dashboard";
import Problems from "./admin/pages/Problems";
import ProblemForm from "./admin/pages/ProblemForm";
import ProblemDetails from "./admin/pages/ProblemDetails";
import Users from "./admin/pages/Users";
import UserDetails from "./admin/pages/UserDetails";
import Submissions from "./admin/pages/Submissions";
import SubmissionDetails from "./admin/pages/SubmissionDetails";
import Unauthorized from "./admin/pages/Unauthorized";

import { checkAuth } from "./authSlice";

function App() {
    const {
        isAuthenticated
    } = useSelector(
        (state) => state.auth
    );

    const dispatch = useDispatch();

    const [checkingAuth, setCheckingAuth] =
        useState(true);

    useEffect(() => {
        dispatch(checkAuth())
            .finally(() => {
                setCheckingAuth(false);
            });
    }, [dispatch]);

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <Routes>

            {/* ================= USER ROUTES ================= */}

            <Route
                path="/"
                element={
                    isAuthenticated
                        ? <Homepage />
                        : <Navigate
                            to="/login"
                            replace
                        />
                }
            />

            <Route
                path="/login"
                element={
                    isAuthenticated
                        ? <Navigate
                            to="/"
                            replace
                        />
                        : <Login />
                }
            />

            <Route
                path="/signup"
                element={
                    isAuthenticated
                        ? <Navigate
                            to="/"
                            replace
                        />
                        : <Signup />
                }
            />

            <Route
                path="/problem/:id"
                element={
                    isAuthenticated
                        ? <ProblemPage />
                        : <Navigate
                            to="/login"
                            replace
                        />
                }
            />


            {/* ================= ADMIN ROUTES ================= */}

            <Route element={<AdminRoute />}>

                <Route
                    path="/admin"
                    element={<AdminLayout />}
                >

                    {/* Dashboard */}
                    <Route
                        index
                        element={<Dashboard />}
                    />

                    {/* Problems */}
                    <Route
                        path="problems"
                        element={<Problems />}
                    />

                    <Route
                        path="problems/create"
                        element={<ProblemForm />}
                    />

                    <Route
                        path="problems/:id"
                        element={<ProblemDetails />}
                    />

                    <Route
                        path="problems/:id/edit"
                        element={<ProblemForm />}
                    />


                    {/* Users */}
                    <Route
                        path="users"
                        element={<Users />}
                    />

                    <Route
                        path="users/:id"
                        element={<UserDetails />}
                    />


                    {/* Submissions */}
                    <Route
                        path="submissions"
                        element={<Submissions />}
                    />

                    <Route
                        path="submissions/:id"
                        element={<SubmissionDetails />}
                    />

                </Route>

            </Route>


            {/* ================= UNAUTHORIZED ================= */}

            <Route
                path="/unauthorized"
                element={<Unauthorized />}
            />


            {/* ================= FALLBACK ================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default App;