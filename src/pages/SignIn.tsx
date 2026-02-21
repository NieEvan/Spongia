import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Lock, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SignIn = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Welcome <span className="text-accent">back</span>
            </h1>
            <p className="text-neutral-500 text-base">
              Enter your details to access your account
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-8 rounded-[2.5rem] bg-neutral-100 border-none shadow-none">
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2 text-left">
                  <Label htmlFor="email" className="text-sm font-bold text-neutral-600 pl-4">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      className="h-12 pl-12 rounded-3xl border-none ring-1 ring-neutral-200 hover:ring-2 hover:ring-neutral-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center pl-4 pr-1">
                    <Label htmlFor="password" alt-text="Password" className="text-sm font-bold text-neutral-600">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-accent hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      className="h-12 pl-12 rounded-3xl border-none ring-1 ring-neutral-200 hover:ring-2 hover:ring-neutral-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-12 mt-4 bg-accent hover:bg-accent/80 hover:scale-[1.02] hover:shadow-md transition-all active:scale-[0.98] text-white rounded-3xl font-bold text-base"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-neutral-100 px-3 text-neutral-500 font-bold">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 rounded-3xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all font-bold group"
                >
                  <Github className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  GitHub
                </Button>
              </form>
            </Card>
          </motion.div>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link to="/pricing" className="text-accent font-bold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignIn;
