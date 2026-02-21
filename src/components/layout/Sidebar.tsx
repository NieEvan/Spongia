import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Search, Users } from "lucide-react";
import spongiLogo from "@/assets/spongi-logo.png";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/skills", label: "Skills", icon: BookOpen },
  { path: "/friends", label: "Social", icon: Users },
  { path: "/browse", label: "Browse questions", icon: Search },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden w-64 flex-col border-r bg-white px-6 py-8 md:flex h-screen sticky top-0">
      <Link to="/" className="mb-10 flex items-center gap-2.5">
        <img src={spongiLogo} alt="Spongi logo" className="h-8 w-8" />
        <span className="font-display text-xl font-bold tracking-tight text-[#1d1d1f]">Spongia</span>
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
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
