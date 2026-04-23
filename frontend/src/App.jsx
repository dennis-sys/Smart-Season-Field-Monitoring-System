import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FieldManager from './pages/FieldManager';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-10">Loading...</p>;
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="container mx-auto">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={<ProtectedRoute><Dashboard user={user} /></ProtectedRoute>} />
          <Route path="/manage" element={<ProtectedRoute><FieldManager /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}