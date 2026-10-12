import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import { EmptyState,ErrorState,Skeleton } from "../components/Notice";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import Icon from "../../components/Icon";

function Users(){
 const[users,setUsers]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[search,setSearch]=useState(""),[role,setRole]=useState("all"),[deleteId,setDeleteId]=useState(null),[deleting,setDeleting]=useState(false);
 const load=async()=>{setLoading(true);setError("");try{const r=await adminApi.users({search,role});setUsers(r.data.users||[])}catch(e){setError(e.response?.data?.message||e.response?.data||"Unable to load users")}finally{setLoading(false)}};useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[search,role]);
 const remove=async()=>{setDeleting(true);try{await adminApi.deleteUser(deleteId);setUsers(x=>x.filter(u=>u._id!==deleteId));setDeleteId(null)}catch(e){setError(e.response?.data?.message||e.response?.data||"Delete failed")}finally{setDeleting(false)}};
 if(loading)return <div className="space-y-4"><Skeleton/><Skeleton className="h-96"/></div>;if(error)return <ErrorState message={error} onRetry={load}/>;
 return <div className="space-y-5">
  <div><p className="text-sm text-primary font-semibold">{users.length} loaded</p><h2 className="text-2xl font-black">User management</h2></div>
  <div className="grid gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 md:grid-cols-[1fr_180px]"><label className="input input-bordered flex items-center gap-2"><Icon name="search" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email..."/></label><select className="select select-bordered" value={role} onChange={e=>setRole(e.target.value)}><option value="all">All roles</option><option value="user">User</option><option value="admin">Admin</option></select></div>
  {users.length===0?<EmptyState title="No users found"/>:<div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm"><table className="table"><thead><tr><th>User</th><th>Role</th><th>Solved</th><th>Joined</th><th/></tr></thead><tbody>{users.map(u=><tr key={u._id} className="hover"><td><Link to={`/admin/users/${u._id}`} className="font-bold hover:text-primary">{u.firstName} {u.lastName||""}</Link><div className="text-xs text-base-content/45">{u.emailId}</div></td><td><StatusBadge status={u.role}/></td><td>{u.problemSolved?.length||0}</td><td>{u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}</td><td><div className="flex justify-end gap-1"><Link className="btn btn-ghost btn-sm" to={`/admin/users/${u._id}`}>View</Link>{u.role!=="admin"&&<button className="btn btn-ghost btn-sm text-error" onClick={()=>setDeleteId(u._id)}>Delete</button>}</div></td></tr>)}</tbody></table></div>}
  <ConfirmModal open={!!deleteId} title="Delete user?" message="This removes the user and their submission records. This action cannot be undone." onCancel={()=>setDeleteId(null)} onConfirm={remove} loading={deleting}/>
 </div>
}
export default Users;
