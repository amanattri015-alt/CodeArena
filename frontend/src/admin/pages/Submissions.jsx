import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import StatusBadge from "../components/StatusBadge";
import { EmptyState,ErrorState,Skeleton } from "../components/Notice";
import Icon from "../../components/Icon";

const statuses=["Accepted","Wrong Answer","Compilation Error","Runtime Error","Time Limit Exceeded","pending"];
function Submissions(){
 const[data,setData]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[status,setStatus]=useState("all"),[language,setLanguage]=useState("all"),[search,setSearch]=useState("");
 const load=async()=>{setLoading(true);setError("");try{const r=await adminApi.submissions({status:status==="all"?"":status,language:language==="all"?"":language,search});setData(r.data.submissions||[])}catch(e){setError(e.response?.data?.message||e.response?.data||"Unable to load submissions")}finally{setLoading(false)}};useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[status,language,search]);
 if(loading)return <div className="space-y-4"><Skeleton/><Skeleton className="h-96"/></div>;if(error)return <ErrorState message={error} onRetry={load}/>;
 return <div className="space-y-5"><div><p className="text-sm text-primary font-semibold">{data.length} loaded</p><h2 className="text-2xl font-black">Submission management</h2></div>
 <div className="grid gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 md:grid-cols-3"><label className="input input-bordered flex items-center gap-2 md:col-span-1"><Icon name="search" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="User, email or problem..."/></label><select className="select select-bordered" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select><select className="select select-bordered" value={language} onChange={e=>setLanguage(e.target.value)}><option value="all">All languages</option><option>c++</option><option>java</option><option>javascript</option></select></div>
 {data.length===0?<EmptyState title="No submissions found"/>:<div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm"><table className="table"><thead><tr><th>User</th><th>Problem</th><th>Language</th><th>Status</th><th>Tests</th><th>Runtime</th><th>Date</th><th/></tr></thead><tbody>{data.map(s=><tr key={s._id} className="hover"><td><p className="font-semibold">{s.userId?.firstName||"Unknown"}</p><p className="text-xs text-base-content/45">{s.userId?.emailId}</p></td><td>{s.problemId?.title||"Deleted problem"}</td><td>{s.language}</td><td><StatusBadge status={s.status}/></td><td>{s.testCasesPassed}/{s.totalTestCases}</td><td>{s.runtime||0}</td><td>{s.createdAt?new Date(s.createdAt).toLocaleString():"—"}</td><td><Link className="btn btn-ghost btn-sm" to={`/admin/submissions/${s._id}`}>View</Link></td></tr>)}</tbody></table></div>}
 </div>
}
export default Submissions;
