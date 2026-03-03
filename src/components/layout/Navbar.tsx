import spongiLogo from "@/assets/spongi-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LayoutDashboard, LogOut, Tag, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/pricing", label: "Pricing", icon: Tag },
];

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut, loading } = useAuth();
    const { profile } = useProfile();
    const { toast } = useToast();

    const handleSignOut = async () => {
        await signOut();
        toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
        });
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-40 w-full bg-transparent">
            <div className="container flex h-16 items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <img
                        src={spongiLogo}
                        alt="Spongi logo"
                        className="h-9 w-9 transition-transform group-hover:scale-105"
                    />
                    <span className="font-display text-xl font-bold tracking-tight">Spongia</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className="relative gap-2 rounded-3xl transition-all duration-200 active:scale-[0.97]"
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute inset-0 rounded-3xl bg-secondary"
                                            style={{ zIndex: -1 }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    {loading ? null : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-3 rounded-full pl-3 pr-1 py-1 h-auto hover:bg-secondary/50">
                                    <User className="h-4 w-4 text-brand-black" />
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarImage 
                                            src={profile?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} 
                                            alt={user.email || ""} 
                                        />
                                        <AvatarFallback className="bg-secondary">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-brand-border/50">
                                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                                    Signed in as
                                </div>
                                <div className="px-2 pb-2 text-sm font-semibold truncate text-brand-black">{user.email}</div>
                                <DropdownMenuSeparator className="bg-brand-border/50" />
                                <DropdownMenuItem 
                                    onClick={handleSignOut} 
                                    className="text-destructive focus:bg-secondary focus:text-destructive cursor-pointer rounded-xl mt-1"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link to="/auth">
                                <Button variant="ghost" size="sm" className="rounded-3xl">
                                    Sign in
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
