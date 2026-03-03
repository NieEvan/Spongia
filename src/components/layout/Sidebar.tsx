import spongiLogoWhite from "@/assets/spongi-logo-white.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { BookOpen, LayoutDashboard, Search, Settings, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/skills", label: "Skills", icon: BookOpen },
  { path: "/friends", label: "Social", icon: Users },
  { path: "/browse", label: "Browse", icon: Search },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { myProfile } = useFriends();

  const username = myProfile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "User";
  const avatarUrl = myProfile?.avatar_url || null;

  return (
    <aside
      className="hidden w-72 flex-col bg-brand-blue text-white px-6 py-8 md:flex h-screen sticky top-0"
      style={{ boxShadow: "10px 0 32px 0px rgba(0, 0, 0, 0.15)" }}
    >
      <Link to="/" className="mb-10 flex items-center gap-3">
        <img src={spongiLogoWhite} alt="Spongia logo" className="h-8 w-8" />
        <span className="font-display text-xl font-bold tracking-tight text-white">Spongia</span>
      </Link>

      <nav className="flex flex-col gap-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                isActive ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4 text-white/90" />
              <span className="text-white/90">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile section at the bottom */}
      <div className="mt-auto pt-6 border-t border-white/20">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white/30">
            <AvatarImage src={avatarUrl || "/default-avatar.png"} className="object-cover" />
            <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 text-sm font-medium text-white truncate">{username}</span>
          <Link
            to="/settings"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
