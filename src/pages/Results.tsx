import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract stats from router state with fallbacks
  const { score, total, correct, incorrect } = location.state || { 
    score: 0, 
    total: 3, 
    correct: 0, 
    incorrect: 0 
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 md:py-20">
        <div className="w-full max-w-lg">
          <Card className="p-8 border-none shadow-sm bg-white rounded-3xl">
            <div className="text-center space-y-8">
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-brand-black">Session Complete</h1>
                <p className="text-brand-grey font-medium">Here is the summary of your practice session.</p>
              </div>

              <div className="py-4">
                <p className="text-xs font-bold text-brand-grey uppercase tracking-wider mb-2">Total Score</p>
                <div className="text-5xl font-bold flex items-center justify-center gap-2 text-brand-black">
                  <span>{score}</span>
                  <span className="text-2xl text-brand-grey">/ {total}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-green-50 p-4 border border-green-100">
                  <div className="text-3xl font-bold text-green-600">{correct}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-green-700">Correct</div>
                </div>
                <div className="rounded-2xl bg-red-50 p-4 border border-red-100">
                  <div className="text-3xl font-bold text-red-600">{incorrect}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">Incorrect</div>
                </div>
              </div>

              <Button 
                className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold text-lg" 
                onClick={() => navigate("/dashboard")}
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
