import { useState, useRef, useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { isAuthenticated, user, logout } from "../store/auth";
import { currency, setCurrency, CURRENCIES } from "../store/settings";

export function Navbar() {
  const { path } = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setShowMobileMenu(false);
    setShowUserMenu(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        // Only close if we didn't click the hamburger button itself
        const isHamburger = (target as HTMLElement).closest(".hamburger-btn");
        if (!isHamburger) {
          setShowMobileMenu(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [path]);

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Invoices", href: "/invoices" },
    { label: "Reminders", href: "/reminders" },
  ];

  return (
    <nav className="bg-card border-border sticky top-0 z-30 border-b">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <a href="/" className="text-primary text-lg font-bold shrink-0">
          PayTrack
        </a>

        {/* Desktop Navigation */}
        {isAuthenticated.value && (
          <div className="hidden md:flex items-center gap-6 ml-8 mr-auto">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  path === link.href ? "text-primary" : "text-text-muted hover:text-text-main"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated.value ? (
            <>
              {/* Desktop User Menu */}
              <div className="relative hidden md:block" ref={menuRef}>
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="hamburger-btn md:hidden text-text-main hover:bg-primary/5 p-2 rounded-custom transition-colors"
              >
                {showMobileMenu ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="/login"
                className={`text-sm font-medium ${path === "/login" ? "text-primary" : "text-text-muted"}`}
              >
                Login
              </a>
              <a
                href="/signup"
                className="bg-primary rounded-custom px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors"
              >
                Get Started
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isAuthenticated.value && showMobileMenu && (
        <div 
          className="md:hidden bg-card border-border animate-in slide-in-from-top border-b shadow-xl overflow-hidden" 
          ref={mobileMenuRef}
        >
          <div className="p-4 space-y-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-custom text-sm font-medium transition-colors ${
                    path === link.href ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-primary/5 hover:text-text-main"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
            
            <div className="border-t border-border pt-4">
              <p className="text-text-muted px-4 mb-3 text-[10px] font-bold tracking-wider uppercase">
                Account & Settings
              </p>
              <div className="flex flex-col gap-1">
                <a
                  href="/profile"
                  className="flex items-center px-4 py-3 text-sm font-medium text-text-main rounded-custom hover:bg-primary/5 transition-colors"
                >
                  <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold uppercase mr-3">
                    {user.value?.username?.substring(0, 2)}
                  </div>
                  Profile Settings
                </a>
                
                <div className="px-4 py-2">
                  <p className="text-text-muted mb-2 text-[10px] font-bold tracking-wider uppercase">
                    Currency
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                        }}
                        className={`flex items-center justify-between rounded-md px-3 py-2 text-xs transition-colors border ${
                          currency.value.code === c.code
                            ? "bg-primary border-primary text-white shadow-sm"
                            : "border-border text-text-main hover:border-primary/30"
                        }`}
                      >
                        <span>{c.label.split(" ")[0]}</span>
                        <span className="font-bold">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-4 text-left text-sm font-bold text-red-600 border-t border-border mt-2 transition-colors hover:bg-red-50"
                >
                  <svg
                    className="mr-3 h-5 w-5"
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
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
