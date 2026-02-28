import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Search, Users } from "lucide-react";
import spongiLogoWhite from "@/assets/spongi-logo-white.png";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/skills", label: "Skills", icon: BookOpen },
  { path: "/friends", label: "Social", icon: Users },
  { path: "/browse", label: "Browse", icon: Search },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden w-72 flex-col bg-brand-blue text-white px-6 py-8 md:flex h-screen sticky top-0">
      <Link to="/" className="mb-10 flex items-center gap-3">
        <img src={spongiLogoWhite} alt="Spongia logo" className="h-8 w-8" />
        <span className="font-display text-xl font-bold tracking-tight text-white">Spongia</span>
      </Link>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4 text-white/90" />
              <span className="text-white/90">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
