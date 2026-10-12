import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../utils/axiosClient";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import { EmptyState, ErrorState, Skeleton } from "../components/Notice";
import Icon from "../../components/Icon";

function Problems() {
    const [problems,setProblems]=useState([]), [loading,setLoading]=useState(true), [error,setError]=useState("");
    const [search,setSearch]=useState(""), [difficulty,setDifficulty]=useState("all"), [tag,setTag]=useState("all");
    const [deleteId,setDeleteId]=useState(null), [deleting,setDeleting]=useState(false);
    const navigate=useNavigate();

    const load=async()=>{setLoading(true);setError("");try{const r=await axiosClient.get("/problem/getAllProblem");setProblems(r.data.problems||[])}catch(e){setError(e.response?.data?.message||e.response?.data||"Unable to load problems")}finally{setLoading(false)}};
    useEffect(()=>{load()},[]);

    const tags=[...new Set(problems.map(p=>p.tags).filter(Boolean))];
    const filtered=useMemo(()=>problems.filter(p=>{
        const q=search.toLowerCase().trim();
        return (!q || p.title.toLowerCase().includes(q)) && (difficulty==="all"||p.difficulty===difficulty) && (tag==="all"||p.tags===tag);
    }),[problems,search,difficulty,tag]);

    const remove=async()=>{if(!deleteId)return;setDeleting(true);try{await axiosClient.delete(`/problem/delete/${deleteId}`);setProblems(x=>x.filter(p=>p._id!==deleteId));setDeleteId(null)}catch(e){setError(e.response?.data?.message||e.response?.data||"Delete failed")}finally{setDeleting(false)}};

    if(loading)return <div className="space-y-4"><Skeleton className="h-20"/><Skeleton className="h-96"/></div>;
    if(error)return <ErrorState message={error} onRetry={load}/>;

    return <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm text-primary font-semibold">{problems.length} total</p><h2 className="text-2xl font-black">Problem management</h2></div>
            <Link to="/admin/problems/create" className="btn btn-primary gap-2"><Icon name="plus" size={18}/> Create problem</Link>
        </div>
        <div className="grid gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 md:grid-cols-[1fr_180px_180px]">
            <label className="input input-bordered flex items-center gap-2"><Icon name="search" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title..." /></label>
            <select className="select select-bordered" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="all">All difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
            <select className="select select-bordered" value={tag} onChange={e=>setTag(e.target.value)}><option value="all">All tags</option>{tags.map(t=><option key={t}>{t}</option>)}</select>
        </div>
        {filtered.length===0?<EmptyState title="No problems found"/>:<div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">
            <table className="table"><thead><tr><th>Problem</th><th>Difficulty</th><th>Tag</th><th className="text-right">Actions</th></tr></thead>
            <tbody>{filtered.map(p=><tr key={p._id} className="hover"><td><button onClick={()=>navigate(`/admin/problems/${p._id}`)} className="text-left font-bold hover:text-primary">{p.title}</button><div className="text-xs text-base-content/40">{p._id}</div></td><td><StatusBadge status={p.difficulty}/></td><td><span className="badge badge-ghost">{p.tags}</span></td><td><div className="flex justify-end gap-1"><Link className="btn btn-ghost btn-sm" to={`/admin/problems/${p._id}`}>View</Link><Link className="btn btn-ghost btn-sm" to={`/admin/problems/${p._id}/edit`}>Edit</Link><button className="btn btn-ghost btn-sm text-error" onClick={()=>setDeleteId(p._id)}>Delete</button></div></td></tr>)}</tbody></table>
        </div>}
        <ConfirmModal open={!!deleteId} title="Delete problem?" message="This permanently removes the problem record. Existing submissions are not automatically removed." onCancel={()=>setDeleteId(null)} onConfirm={remove} loading={deleting}/>
    </div>
}
export default Problems;
