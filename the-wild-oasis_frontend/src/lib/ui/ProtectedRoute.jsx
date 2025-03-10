import { useUser } from "../../features/authentication/useUser";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  // 1. Load the authenticated user
  const { user } = useUser();
  const isAuthenticated = user?.role === "authenticated";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate, user, isAuthenticated]);

  //   // 4. If there IS a user, show the children
  if (isAuthenticated) return <>{children}</>;
}

export default ProtectedRoute;
