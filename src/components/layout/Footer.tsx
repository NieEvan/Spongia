import { Link } from "react-router-dom";
import spongiLogo from "@/assets/spongi-logo.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={spongiLogo}
              alt="Spongi logo"
              className="h-8 w-8"
            />
            <span className="font-display text-lg font-bold">
              Spongia
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
              Dashboard
            </Link>
            <Link to="/browse" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
              Browse Questions
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
              Pricing
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Spongia. AI-powered practice questions.
          </p>
        </div>
      </div>
    </footer>
  );
};