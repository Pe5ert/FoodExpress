import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';

export default function ProtectedRoute({ children }) {
  const { estaLogado, carregando } = useAuth();

  if (carregando) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-text-muted">Carregando...</p>
      </Motion.div>
    </div>
  );

  if (!estaLogado) return <Navigate to="/login" replace />;

  return children;
}
