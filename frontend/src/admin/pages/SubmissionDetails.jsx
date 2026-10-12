import { useEffect,useState } from "react";
import { Link,useParams } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import StatusBadge from "../components/StatusBadge";
import { ErrorState,Skeleton } from "../components/Notice";

function SubmissionDetails(){
 const{id}=useParams();const[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=async()=>{try{setLoading(true);setData((await adminApi.submission(id)).data.submission)}catch(e){setError(e.response?.data?.message||e.response?.data||"Unable to load submission")}finally{setLoading(false)}};useEffect(()=>{load()},[id]);
 if(loading)return <Skeleton className="h-[650px]"/>;if(error)return <ErrorState message={error} onRetry={load}/>;
 const s=data;
 return <div className="space-y-5"><Link to="/admin/submissions" className="btn btn-ghost btn-sm">← Submissions</Link>
 <section className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><h2 className="text-2xl font-black">Submission details</h2><p className="mt-1 text-sm text-base-content/50">{s.userId?.emailId} · {s.problemId?.title}</p></div><StatusBadge status={s.status}/></div><div className="mt-6 grid gap-3 sm:grid-cols-4"><Metric label="Language" value={s.language}/><Metric label="Tests" value={`${s.testCasesPassed}/${s.totalTestCases}`}/><Metric label="Runtime" value={`${s.runtime||0}`}/><Metric label="Memory" value={`${s.memory||0}`}/></div></section>
 <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"><h3 className="font-black">Submitted code</h3><pre className="mt-4 max-h-[650px] overflow-auto rounded-xl bg-neutral p-5 text-sm leading-6 text-neutral-content"><code>{s.code}</code></pre></section>
 </div>
}
function Metric({label,value}){return <div className="rounded-xl bg-base-200 p-4"><p className="text-xs text-base-content/50">{label}</p><p className="mt-1 font-black">{value}</p></div>}
export default SubmissionDetails;
