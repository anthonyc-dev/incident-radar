import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Renders children only when unauthenticated. Redirects to /home when already logged in.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-amber-600" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
