import { Navigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (accessToken) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

