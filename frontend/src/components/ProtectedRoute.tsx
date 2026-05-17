import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { isAuthenticated, isAuthLoading } from "../store/auth";
import type { ComponentType } from "preact";

interface ProtectedRouteProps {
  Page: any;
  [key: string]: any;
}

export function ProtectedRoute({ Page, ...props }: ProtectedRouteProps) {
  const { route } = useLocation();

  useEffect(() => {
    if (!isAuthLoading.value && !isAuthenticated.value) {
      route("/login");
    }
  }, [isAuthLoading.value, isAuthenticated.value, route]);

  if (isAuthLoading.value) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="text-text-muted animate-pulse text-sm">Verifying session...</div>
      </div>
    );
  }

  return isAuthenticated.value ? <Page {...props} /> : null;
}
