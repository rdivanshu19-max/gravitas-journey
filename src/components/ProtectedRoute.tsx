import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin }: Props) {
  const { user, profile, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.is_banned) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h1 className="text-3xl font-display orbit-text mb-2">Account Suspended</h1>
          <p className="text-muted-foreground">Your account has been banned. Contact support.</p>
        </div>
      </div>
    );
  }
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (!requireAdmin && profile && !profile.onboarding_complete && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
