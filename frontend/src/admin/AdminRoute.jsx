import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
function AdminRoute(){
 const {user,isAuthenticated}=useSelector(s=>s.auth);
 if(!isAuthenticated)return <Navigate to="/login" replace/>;
 if(user?.role!=="admin")return <Navigate to="/unauthorized" replace/>;
 return <Outlet/>;
}
export default AdminRoute;
