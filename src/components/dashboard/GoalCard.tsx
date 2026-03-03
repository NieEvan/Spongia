import { Calendar, Check, Pencil, Target, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

export const GoalCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [score, setScore] = useState("1550");
  const [date, setDate] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 2);
    return nextMonth.toISOString().split("T")[0];
  });

  const calculateDays = () => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const roundTo10 = (val: string) => {
    const num = parseInt(val) || 0;
    return (Math.round(num / 10) * 10).toString();
  };

  const handleScoreChange = (delta: number) => {
    setScore(prev => {
      const val = parseInt(prev) + delta;
      return Math.min(1600, Math.max(0, val)).toString();
    });
  };

  return (
    <div className="min-w-80 bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-xl text-slate-900">My Goal</h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-full transition-colors shrink-0"
        >
          {isEditing ? <Check className="w-5 h-5" /> : <Pencil className="w-[18px] h-[18px]" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col space-y-8">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-2">Target Score</p>
          <div className="h-10 flex items-center">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <input
                    type="number"
                    className="text-3xl font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 w-32 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={score}
                    onChange={e => setScore(e.target.value)}
                    onBlur={e => setScore(roundTo10(e.target.value))}
                  />
                  <div className="flex flex-col h-10 border-l border-slate-200 absolute right-0">
                    <button 
                      onClick={() => handleScoreChange(10)}
                      className="flex-1 px-1.5 hover:bg-slate-100 hover:text-brand-blue rounded-tr-xl transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleScoreChange(-10)}
                      className="flex-1 px-1.5 border-t border-slate-200 hover:bg-slate-100 hover:text-brand-blue rounded-br-xl transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">{score}</span>
                <span className="text-lg text-slate-400 font-medium">/ 1600</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#f7faff] rounded-2xl p-4 flex items-center justify-between h-[108px]">
          <div className="flex flex-col h-full justify-center">
            <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Next Exam
            </p>
            <div className="h-8 flex items-center">
              {isEditing ? (
                <input
                  type="date"
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 w-[160px] text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              ) : (
                <span className="font-semibold text-slate-900 text-[17px] leading-none">
                  {new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
          {!isEditing && (
            <div className="shrink-0 pl-2">
              <span className="text-xs font-bold leading-none bg-brand-blue/10 text-brand-blue px-3 py-2 rounded-full inline-block">
                {calculateDays()} days left
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
