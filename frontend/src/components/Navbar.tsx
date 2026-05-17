import { useState, useRef, useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { isAuthenticated, user, logout } from "../store/auth";
import { currency, setCurrency, CURRENCIES } from "../store/settings";

export function Navbar() {
  const { path } = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-card border-border sticky top-0 z-10 border-b">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <a href="/" className="text-primary text-lg font-bold">
          PayTrack
        </a>

        <div className="flex items-center gap-4">
          {isAuthenticated.value ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    path === "/" ? "text-primary" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Dashboard
                </a>
                <a
                  href="/invoices"
                  className={`text-sm font-medium transition-colors ${
                    path === "/invoices" ? "text-primary" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Invoices
                </a>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-text-main hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold uppercase">
                    {user.value?.username?.substring(0, 2)}
                  </div>
                  <svg
                    className={`h-4 w-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="bg-card border-border rounded-custom animate-in fade-in zoom-in-95 absolute right-0 mt-2 w-48 origin-top-right border shadow-xl duration-100">
                    <div className="border-border border-b p-3">
                      <p className="text-text-muted mb-2 text-[10px] font-bold tracking-wider uppercase">
                        Currency Preference
                      </p>
                      <div class="grid grid-cols-2 gap-1">
                        {CURRENCIES.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => {
                              setCurrency(c.code);
                              setShowUserMenu(false);
                            }}
                            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                              currency.value.code === c.code
                                ? "bg-primary text-white"
                                : "hover:bg-primary/10 text-text-main"
                            }`}
                          >
                            <span>{c.label.split(" ")[0]}</span>
                            <span className="font-bold">{c.symbol}</span>
                          </button>
                        ))}
                      </div>
                      </div>
                      <a
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-text-main transition-colors hover:bg-primary/5"
                      >
                      <svg
                        className="mr-2 h-4 w-4 text-text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile Settings
                      </a>
                      <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 border-t border-border"
                      >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
