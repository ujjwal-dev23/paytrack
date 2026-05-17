import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import type { ComponentType } from "preact";
import { isAuthenticated, isAuthLoading } from "../store/auth";

interface ProtectedRouteProps {
  Page: ComponentType<Record<string, unknown>>;
  [key: string]: unknown;
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
      <div class="flex flex-1 items-center justify-center py-20">
        <div class="text-text-muted animate-pulse text-sm">Verifying session...</div>
      </div>
    );
  }

  return isAuthenticated.value ? <Page {...props} /> : null;
}
