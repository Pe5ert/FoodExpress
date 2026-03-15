import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return children;
}
