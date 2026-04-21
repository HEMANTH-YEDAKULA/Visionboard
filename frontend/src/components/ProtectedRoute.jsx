import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return <div className="panel text-sm text-slate-500">Verifying your session...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}
