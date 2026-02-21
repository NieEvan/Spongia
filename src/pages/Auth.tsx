import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { Asterisk, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleClose = () => {
    // If there is history, go back. Otherwise go to home.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate inputs
    const result = authSchema.safeParse({ email, password });
    const fieldErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!result.success) {
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
    }

    if (!isLogin && password !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: error.message,
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
          navigate("/dashboard");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Signup failed",
              description: "This email is already registered. Try logging in instead.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Signup failed",
              description: error.message,
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Check your email for a confirmation link, or login directly if email confirmation is disabled.",
          });
          setIsLogin(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brand-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl pt-8 rounded-3xl bg-white relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-brand-grey hover:text-brand-black hover:bg-brand-bg rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="relative flex items-center">
                <img 
                  src="src\assets\spongi-logo.png" 
                  alt="Logo" 
                  className="absolute right-full mr-2 h-8 w-8 object-contain" 
                />
                <span className="font-display text-3xl font-bold tracking-tight text-brand-black">
                  Spongia
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="font-bold text-brand-black">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grey" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 rounded-3xl bg-white border-none transition-all focus:outline-none placeholder:text-brand-grey/50 text-brand-black ${
                      errors.email 
                        ? "ring-1 ring-destructive hover:ring-2 hover:ring-destructive focus:ring-2 focus:ring-destructive" 
                        : "ring-1 ring-brand-border hover:ring-2 hover:ring-brand-grey/50 focus:ring-2 focus:ring-brand-grey/50"
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="font-bold text-brand-black">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grey" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 rounded-3xl bg-white border-none transition-all focus:outline-none placeholder:text-brand-grey/50 text-brand-black ${
                      errors.password 
                        ? "ring-1 ring-destructive hover:ring-2 hover:ring-destructive focus:ring-2 focus:ring-destructive" 
                        : "ring-1 ring-brand-border hover:ring-2 hover:ring-brand-grey/50 focus:ring-2 focus:ring-brand-grey/50"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-grey hover:text-brand-black transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="font-bold text-brand-black">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grey" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 rounded-3xl bg-white border-none transition-all focus:outline-none placeholder:text-brand-grey/50 text-brand-black ${
                        errors.confirmPassword 
                          ? "ring-1 ring-destructive hover:ring-2 hover:ring-destructive focus:ring-2 focus:ring-destructive" 
                          : "ring-1 ring-brand-border hover:ring-2 hover:ring-brand-grey/50 focus:ring-2 focus:ring-brand-grey/50"
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full shadow-glow bg-brand-blue hover:bg-brand-blue/90 text-white transition-all duration-200 hover:shadow-lg rounded-3xl gap-2"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                <span className="font-bold">{isLogin ? "Sign in" : "Create account"}</span>
                {!isLoading && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-brand-grey font-medium">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setConfirmPassword("");
                }}
                className="font-bold text-brand-blue hover:text-brand-blue/90 transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
