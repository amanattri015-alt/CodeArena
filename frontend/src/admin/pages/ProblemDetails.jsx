import { useEffect,useState } from "react";
import { Link,useNavigate,useParams } from "react-router-dom";
import axiosClient from "../../utils/axiosClient";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import { ErrorState,Skeleton } from "../components/Notice";

function ProblemDetails(){
 const {id}=useParams(),nav=useNavigate();const[p,setP]=useState(null),[error,setError]=useState(""),[del,setDel]=useState(false),[loading,setLoading]=useState(true);
 const load=async()=>{try{setLoading(true);const r=await axiosClient.get(`/admin/problems/${id}`);setP(r.data.problem)}catch(e){setError(e.response?.data?.message||e.response?.data||"Unable to load problem")}finally{setLoading(false)}};useEffect(()=>{load()},[id]);
 const remove=async()=>{try{await axiosClient.delete(`/problem/delete/${id}`);nav("/admin/problems")}catch(e){setError(e.response?.data?.message||e.response?.data||"Delete failed")}finally{setDel(false)}};
 if(loading)return <Skeleton className="h-[700px]"/>;if(error)return <ErrorState message={error} onRetry={load}/>;
 return <div className="space-y-5">
  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><Link to="/admin/problems" className="btn btn-ghost btn-sm mb-2">← Problems</Link><h2 className="text-2xl font-black">{p.title}</h2><div className="mt-2 flex flex-wrap gap-2"><StatusBadge status={p.difficulty}/><span className="badge badge-ghost">{p.tags}</span></div></div><div className="flex gap-2"><Link to={`/admin/problems/${id}/edit`} className="btn btn-primary">Edit</Link><button className="btn btn-error btn-outline" onClick={()=>setDel(true)}>Delete</button></div></div>
  <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"><h3 className="font-black">Description</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-base-content/75">{p.description}</p></section>
  <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"><h3 className="font-black">Visible test cases</h3><div className="mt-4 space-y-3">{p.visibleTestCases?.map((x,i)=><Case key={i} index={i} data={x}/>)}</div></section>
  <section className="rounded-2xl border border-warning/30 bg-warning/5 p-5 shadow-sm"><h3 className="font-black">Hidden test cases</h3><p className="text-xs text-base-content/50">Admin-only data.</p><div className="mt-4 space-y-3">{p.hiddenTestCases?.map((x,i)=><Case key={i} index={i} data={x}/>)}</div></section>
  <CodeList title="Starter code" items={p.startCode} codeKey="initialCode"/>
  <CodeList title="Reference solutions" items={p.referenceSolution} codeKey="completeSolution"/>
  <ConfirmModal open={del} title="Delete problem?" message="This permanently removes the problem." onCancel={()=>setDel(false)} onConfirm={remove}/>
 </div>
}
function Case({index,data}){return <div className="rounded-xl border border-base-300 bg-base-200/50 p-4"><p className="text-xs font-bold text-base-content/50">Case #{index+1}</p><pre className="mt-2 whitespace-pre-wrap text-sm"><b>Input:</b> {data.input}{"\n"}<b>Output:</b> {data.output}{data.explanation?`\\nExplanation: ${data.explanation}`:""}</pre></div>}
function CodeList({title,items,codeKey}){return <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"><h3 className="font-black">{title}</h3><div className="mt-4 space-y-4">{items?.map((x,i)=><div key={i}><div className="mb-2 text-xs font-bold uppercase text-base-content/50">{x.language}</div><pre className="overflow-x-auto rounded-xl bg-neutral p-4 text-sm text-neutral-content"><code>{x[codeKey]}</code></pre></div>)}</div></section>}
export default ProblemDetails;
