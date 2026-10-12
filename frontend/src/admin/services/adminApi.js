import axiosClient from "../../utils/axiosClient";

export const adminApi = {
    // ==========================================
    // DASHBOARD
    // ==========================================

    dashboard: () =>
        axiosClient.get("/admin/dashboard"),

    // ==========================================
    // USERS
    // ==========================================

    users: (params = {}) =>
        axiosClient.get("/admin/users", {
            params,
        }),

    user: (id) =>
        axiosClient.get(`/admin/users/${id}`),

    deleteUser: (id) =>
        axiosClient.delete(`/admin/users/${id}`),

    // ==========================================
    // SUBMISSIONS
    // ==========================================

    submissions: (params = {}) =>
        axiosClient.get("/admin/submissions", {
            params,
        }),

    submission: (id) =>
        axiosClient.get(`/admin/submissions/${id}`),

    // ==========================================
    // PROBLEMS
    // ==========================================

    problems: () =>
        axiosClient.get("/problem/allProblem"),

    problem: (id) =>
        axiosClient.get(`/admin/problems/${id}`),

    createProblem: (data) =>
        axiosClient.post(
            "/problem/create",
            data
        ),

    updateProblem: (id, data) =>
        axiosClient.patch(
            `/problem/update/${id}`,
            data
        ),

    deleteProblem: (id) =>
        axiosClient.delete(
            `/problem/delete/${id}`
        ),
};