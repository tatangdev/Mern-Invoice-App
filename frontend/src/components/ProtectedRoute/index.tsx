import { Navigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import SuspenseLoader from 'src/components/SuspenseLoader';

interface ProtectedRouteProps {
  children: JSX.Element;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SuspenseLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
