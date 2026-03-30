import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ROUTES } from "@/shared/constants/routes";
import logoutSvg from "@/assets/images/logout.svg";
import userSvg from "@/assets/images/user.svg";
import logoSvg from "@/assets/images/logo.svg";

const NAV_LINKS = [
  { label: "Pomodoro", route: ROUTES.POMODORO },
  { label: "Flowtime", route: ROUTES.FLOWTIME },
  { label: "Time Budget", route: ROUTES.BOLSA },
  { label: "Sessions", route: ROUTES.SESSIONS },
];

export function Header() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate(ROUTES.LOGIN);
  };

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 py-4 bg-(--bg-page) border-b border-(--border-soft)">
      {/* Brand */}
      <Link
        to={ROUTES.DASHBOARD}
        className="flex items-center gap-2 shrink-0 text-brand-tomato"
        aria-label="Focus Timers home"
      >
        <img src={logoSvg} alt="Focus Timers logo" className="w-9 h-9" />
        <span className="text-2xl font-bold tracking-tight whitespace-nowrap">Focus Timers</span>
      </Link>

      {/* Nav links — desktop, centered */}
      <div className="hidden md:flex items-center justify-center gap-4 sm:gap-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.route}
            to={link.route}
            className="text-sm text-(--text-secondary) hover:text-brand-tomato transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right column: Buy Me a Coffee + user actions */}
      <div className="flex items-center gap-2 sm:gap-3 justify-end">
        <a
          href="https://www.buymeacoffee.com/algorithmicpaws"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-400 text-amber-900 hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
        >
          ☕ Buy me a coffee
        </a>

        {/* Authenticated: user dropdown */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              aria-label="User menu"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-1.5 text-sm text-(--text-secondary) hover:text-brand-tomato transition-colors cursor-pointer select-none"
            >
              <img src={userSvg} alt="" className="w-4 h-4 opacity-60" />
              <span className="hidden sm:block max-w-30 truncate">{user.name}</span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-(--bg-card) border border-(--border-soft) shadow-modal py-1 z-50">
                {/* Mobile nav links */}
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.route}
                    to={link.route}
                    onClick={() => setDropdownOpen(false)}
                    className="md:hidden flex items-center gap-2 px-4 py-2 text-sm text-(--text-secondary) hover:text-brand-tomato hover:bg-(--bg-card-hover) transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="md:hidden border-t border-(--border-soft) my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-(--text-secondary) hover:text-brand-tomato hover:bg-(--bg-card-hover) transition-colors cursor-pointer text-left"
                >
                  <img src={logoutSvg} alt="" className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Not authenticated: login/register buttons */
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.LOGIN}
              className="hidden sm:block text-sm text-(--text-secondary) hover:text-brand-tomato transition-colors"
            >
              Login
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-tomato text-white hover:opacity-90 transition-opacity"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
