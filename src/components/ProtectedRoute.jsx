import { Navigate, useOutletContext } from 'react-router-dom';
import { getToken, isTokenExpired, clearAuth } from '../lib/storage';

export default function ProtectedRoute({ children }) {
  const { user, setUser } = useOutletContext();
  const token = getToken();

  // Check if token exists and is valid
  if (!token || isTokenExpired(token)) {
    // Clear invalid/expired auth data
    clearAuth();
    if (user) {
      setUser(null);
    }
    return <Navigate to="/auth" replace />;
  }

  if (!user) {
    // If token exists but user data is missing, redirect to auth
    return <Navigate to="/auth" replace />;
  }

  return children;
}
