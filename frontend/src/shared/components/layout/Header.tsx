import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ROUTES } from "@/shared/constants/routes";
import logoutSvg from "@/assets/images/logout.svg";
import userSvg from "@/assets/images/user.svg";
import logoSvg from "@/assets/images/logo.svg";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Close dropdown when clicking outside
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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-(--bg-page) border-b border-(--border-soft)">
      {/* Brand — logo + name always visible, never wraps */}
      <Link
        to={ROUTES.DASHBOARD}
        className="flex items-center gap-2 shrink-0 text-brand-tomato"
        aria-label="Focus Timers home"
      >
        <img src={logoSvg} alt="Focus Timers logo" className="w-7 h-7" />
        <span className="text-xl font-bold tracking-tight whitespace-nowrap">
          Focus Timers
        </span>
      </Link>

      <nav className="flex items-center gap-3 sm:gap-4">
        {/* Nav links — visible on md+ directly; on mobile they move into the user dropdown */}
        <Link
          to={ROUTES.POMODORO}
          className="hidden md:block text-sm text-(--text-secondary) hover:text-brand-tomato transition-colors"
        >
          Pomodoro
        </Link>
        <Link
          to={ROUTES.SESSIONS}
          className="hidden md:block text-sm text-(--text-secondary) hover:text-brand-tomato transition-colors"
        >
          Sessions
        </Link>

        {/* User dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              aria-label="User menu"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-1.5 text-sm text-(--text-secondary) hover:text-brand-tomato transition-colors cursor-pointer select-none"
            >
              <img src={userSvg} alt="" className="w-4 h-4 opacity-60" />
              <span className="hidden sm:block max-w-[120px] truncate">{user.name}</span>
              {/* Chevron */}
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
                {/* Mobile-only nav links */}
                <Link
                  to={ROUTES.POMODORO}
                  onClick={() => setDropdownOpen(false)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 text-sm text-(--text-secondary) hover:text-brand-tomato hover:bg-(--bg-card-hover) transition-colors"
                >
                  Pomodoro
                </Link>
                <Link
                  to={ROUTES.SESSIONS}
                  onClick={() => setDropdownOpen(false)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 text-sm text-(--text-secondary) hover:text-brand-tomato hover:bg-(--bg-card-hover) transition-colors"
                >
                  Sessions
                </Link>
                <div className="md:hidden border-t border-(--border-soft) my-1" />

                {/* Logout — always in dropdown */}
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
        )}
      </nav>
    </header>
  );
}
