import { useLocation } from "preact-iso";
import { isAuthenticated, user, logout } from "../store/auth";

export function Navbar() {
  const { path } = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-card border-border sticky top-0 z-10 border-b">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <a href="/" className="text-primary text-lg font-bold">
          PayTrack
        </a>

        <div className="flex items-center gap-4">
          {isAuthenticated.value ? (
            <div className="flex items-center gap-3">
              <span className="text-text-muted hidden text-sm sm:inline">
                {user.value?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <a
                href="/login"
                className={`text-sm font-medium ${path === "/login" ? "text-primary" : "text-text-muted"}`}
              >
                Login
              </a>
              <a
                href="/signup"
                className="bg-primary rounded-custom px-3 py-1.5 text-sm font-medium text-white"
              >
                Get Started
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
