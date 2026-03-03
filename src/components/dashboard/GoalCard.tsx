import { Calendar, Check, Pencil, Target } from "lucide-react";
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

  return (
    <div className="min-w-80 bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-blue/10 rounded-xl">
            <Target className="w-5 h-5 text-brand-blue" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900">My Goal</h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-full transition-colors"
        >
          {isEditing ? <Check className="w-5 h-5" /> : <Pencil className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-2">Target Score</p>
          {isEditing ? (
            <input
              type="number"
              className="text-3xl font-bold bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              value={score}
              onChange={e => setScore(e.target.value)}
            />
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-slate-900">{score}</span>
              <span className="text-lg text-slate-400 font-medium">/ 1600</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
          <p className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Next Exam
          </p>
          {isEditing ? (
            <input
              type="date"
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-slate-900">
                {new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <div className="flex items-center">
                <span className="text-xs font-bold leading-none bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-full inline-block">
                  {calculateDays()} days left
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
