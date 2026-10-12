import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { ErrorState, Skeleton } from "../components/Notice";

const formatDate = (d) => d ? new Date(d).toLocaleString() : "—";

function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true); setError("");
        try { setData((await adminApi.dashboard()).data); }
        catch (e) { setError(e.response?.data?.message || e.response?.data || "Unable to load dashboard"); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    if (loading) return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:8}).map((_,i)=><Skeleton key={i}/>)}</div><Skeleton className="h-80"/></div>;
    if (error) return <ErrorState message={error} onRetry={load} />;

    const s = data?.stats || {};
    const total = s.totalSubmissions || 0;
    const acceptance = total ? ((s.acceptedSubmissions / total) * 100).toFixed(1) : "0.0";

    return (
        <div className="space-y-7">
            <section>
                <p className="text-sm font-medium text-primary">Overview</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Welcome to the admin console</h2>
                <p className="mt-1 text-sm text-base-content/50">Live platform metrics from MongoDB.</p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Users" value={s.totalUsers} icon="users" />
                <StatCard label="Total Problems" value={s.totalProblems} icon="problems" />
                <StatCard label="Total Submissions" value={s.totalSubmissions} icon="submissions" />
                <StatCard label="Acceptance Rate" value={`${acceptance}%`} icon="accepted" />
                <StatCard label="Easy Problems" value={s.easyProblems} icon="easy" />
                <StatCard label="Medium Problems" value={s.mediumProblems} icon="medium" />
                <StatCard label="Hard Problems" value={s.hardProblems} icon="hard" />
                <StatCard label="Failed Submissions" value={s.failedSubmissions} icon="alert" />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                    <div className="flex items-center justify-between border-b border-base-300 p-5">
                        <div><h3 className="font-black">Recently added problems</h3><p className="text-xs text-base-content/50">Latest database records</p></div>
                        <Link className="btn btn-ghost btn-sm" to="/admin/problems">View all</Link>
                    </div>
                    <div className="divide-y divide-base-300">
                        {(data?.recentProblems || []).map((p) => (
                            <Link to={`/admin/problems/${p._id}`} key={p._id} className="flex items-center justify-between gap-4 p-4 hover:bg-base-200">
                                <div className="min-w-0"><p className="truncate text-sm font-bold">{p.title}</p><p className="text-xs text-base-content/45">{p.tags}</p></div>
                                <StatusBadge status={p.difficulty} />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                    <div className="flex items-center justify-between border-b border-base-300 p-5">
                        <div><h3 className="font-black">Recent submissions</h3><p className="text-xs text-base-content/50">Latest execution records</p></div>
                        <Link className="btn btn-ghost btn-sm" to="/admin/submissions">View all</Link>
                    </div>
                    <div className="divide-y divide-base-300">
                        {(data?.recentSubmissions || []).map((x) => (
                            <Link to={`/admin/submissions/${x._id}`} key={x._id} className="flex items-center justify-between gap-4 p-4 hover:bg-base-200">
                                <div className="min-w-0"><p className="truncate text-sm font-bold">{x.userId?.emailId || "Unknown user"}</p><p className="truncate text-xs text-base-content/45">{x.problemId?.title || "Unknown problem"} · {formatDate(x.createdAt)}</p></div>
                                <StatusBadge status={x.status} />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between"><div><h3 className="font-black">Recent users</h3><p className="text-xs text-base-content/50">Newest accounts</p></div><Link className="btn btn-ghost btn-sm" to="/admin/users">View all</Link></div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {(data?.recentUsers || []).map((u) => (
                        <Link key={u._id} to={`/admin/users/${u._id}`} className="rounded-xl border border-base-300 p-4 hover:bg-base-200">
                            <p className="font-bold">{u.firstName} {u.lastName || ""}</p>
                            <p className="truncate text-xs text-base-content/50">{u.emailId}</p>
                            <div className="mt-2 flex justify-between text-xs"><span>{u.problemSolved?.length || 0} solved</span><span>{formatDate(u.createdAt)}</span></div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
export default Dashboard;
