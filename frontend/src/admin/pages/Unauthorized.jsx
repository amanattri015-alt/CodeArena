import { Link } from "react-router-dom";
function Unauthorized(){return <div className="min-h-screen grid place-items-center bg-base-200 p-6"><div className="max-w-md rounded-2xl border border-base-300 bg-base-100 p-8 text-center shadow-xl"><h1 className="text-4xl font-black">403</h1><h2 className="mt-2 text-xl font-bold">Access denied</h2><p className="mt-2 text-sm text-base-content/50">Your account does not have administrator permissions.</p><Link to="/" className="btn btn-primary mt-6">Back to platform</Link></div></div>}
export default Unauthorized;
