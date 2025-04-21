import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './userData';

// Protected Route component to guard routes that require authentication
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  // Show loading indicator if auth state is still loading
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is authenticated, render the child route
  return <Outlet />;
};

export default ProtectedRoute; 