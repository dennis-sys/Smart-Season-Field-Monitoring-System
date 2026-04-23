import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <nav className="bg-green-800 text-white p-4 flex justify-between items-center">
      <div className="flex gap-4">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/manage" className="hover:underline">Field Manager</Link>
      </div>
      <div className="flex gap-4 items-center">
        <span>{user.email} ({user.role})</span>
        <button onClick={logout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
      </div>
    </nav>
  );
}