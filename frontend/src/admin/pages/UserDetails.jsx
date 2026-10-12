import { useEffect,useState } from "react";
import { Link,useNavigate,useParams } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import StatusBadge from "../components/StatusBadge";
import { ErrorState,Skeleton } from "../components/Notice";

function UserDetails(){
 const{id}=useParams(),nav=useNavigate();const[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=async()=>{try{setLoading(true);setData((await adminApi.user(id)).data)}catch(e){setError(e.response?.data?.message||e.response?.data||"Unable to load user")}finally{setLoading(false)}};useEffect(()=>{load()},[id]);
 if(loading)return <Skeleton className="h-96"/>;if(error)return <ErrorState message={error} onRetry={load}/>;
 const u=data.user, submissions=data.submissions||[];
 return <div className="space-y-5"><Link to="/admin/users" className="btn btn-ghost btn-sm">← Users</Link>
 <section className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-black text-primary-content">{u.firstName?.[0]}</div><div><h2 className="text-2xl font-black">{u.firstName} {u.lastName||""}</h2><p className="text-sm text-base-content/50">{u.emailId}</p><div className="mt-2 flex gap-2"><StatusBadge status={u.role}/><span className="badge badge-ghost">{u.problemSolved?.length||0} solved</span></div></div></div></section>
 <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"><h3 className="font-black">Solved problems</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{(u.problemSolved||[]).map(p=><Link key={p._id} to={`/admin/problems/${p._id}`} className="rounded-xl border border-base-300 p-4 hover:bg-base-200"><p className="font-bold">{p.title}</p><div className="mt-2 flex gap-2"><StatusBadge status={p.difficulty}/><span className="badge badge-ghost">{p.tags}</span></div></Link>)}</div></section>
 <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"><h3 className="font-black">Recent submissions</h3><div className="mt-4 overflow-x-auto"><table className="table"><thead><tr><th>Problem</th><th>Language</th><th>Status</th><th>Runtime</th><th/></tr></thead><tbody>{submissions.map(s=><tr key={s._id}><td>{s.problemId?.title||"Deleted problem"}</td><td>{s.language}</td><td><StatusBadge status={s.status}/></td><td>{s.runtime||0}</td><td><button className="btn btn-ghost btn-sm" onClick={()=>nav(`/admin/submissions/${s._id}`)}>View</button></td></tr>)}</tbody></table></div></section>
 </div>
}
export default UserDetails;
