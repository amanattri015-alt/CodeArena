function StatusBadge({ status }) {
    const cls = {
        Accepted: "badge-success",
        "Wrong Answer": "badge-warning",
        "Compilation Error": "badge-error",
        "Runtime Error": "badge-error",
        "Time Limit Exceeded": "badge-warning",
        pending: "badge-ghost",
        easy: "badge-success",
        medium: "badge-warning",
        hard: "badge-error",
    }[status] || "badge-ghost";

    return <span className={`badge badge-sm font-semibold ${cls}`}>{status}</span>;
}
export default StatusBadge;
