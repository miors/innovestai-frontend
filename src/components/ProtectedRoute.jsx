import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="text-white text-center mt-10">
        Syncing Secure Nodes...
      </div>
    );

  // If no user context maps match, intercept the route action and redirect to authentication forms
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
