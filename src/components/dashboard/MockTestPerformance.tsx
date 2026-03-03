import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const data = [
  { date: "Oct 1", score: 1080, rw: 540, math: 540 },
  { date: "Oct 20", score: 1120, rw: 560, math: 560 },
  { date: "Nov 5", score: 1125, rw: 560, math: 565 },
  { date: "Nov 25", score: 1150, rw: 580, math: 570 },
  { date: "Dec 10", score: 1155, rw: 580, math: 575 },
  { date: "Jan 1", score: 1175, rw: 600, math: 575 },
  { date: "Jan 20", score: 1180, rw: 600, math: 580 },
  { date: "Feb 15", score: 1600, rw: 800, math: 800 },
];

const mockRecords = [
  { id: 3, name: "Test 3", date: "Dec 12, 2023" },
  { id: 2, name: "Test 2", date: "Nov 15, 2023" },
  { id: 1, name: "Test 1", date: "Oct 01, 2023" },
];

const MockTestPerformance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overall");

  const activeKey = activeTab === "Overall" ? "score" : activeTab === "R&W" ? "rw" : "math";
  const maxLimit = activeTab === "Overall" ? 1600 : 800;

  const dataMin = Math.min(...data.map(d => d[activeKey]));
  const dataMax = Math.max(...data.map(d => d[activeKey]));
  
  // Calculate bounds rounded to the nearest 50 for clean intervals
  const yMin = Math.max(0, Math.floor((dataMin - 20) / 50) * 50);
  const yMax = Math.min(maxLimit, Math.ceil((dataMax + 20) / 50) * 50);

  // Generate explicit ticks at intervals of 50
  const yTicks = [];
  for (let i = yMin; i <= yMax; i += 50) {
    yTicks.push(i);
  }

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 h-full">
      <div className="flex flex-col h-full">
        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          <div className="flex-1 min-h-[200px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1D1D1F]">Mock Test Performance</h2>
              <div className="flex bg-[#f7faff] p-1 rounded-full">
                {["Overall", "R&W", "Math"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeTab === tab ? "bg-brand-blue text-white shadow-sm" : "text-[#75757A] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#75757A', fontSize: 12 }}
                  dy={10}
                  padding={{ left: 30, right: 30 }}
                />
                <YAxis 
                  domain={[yMin, yMax]} 
                  ticks={yTicks}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#75757A', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  position={{ x: 0, y: 0 }} // Lock the wrapper physically to the origin
                  content={({ active, payload, label, coordinate }) => {
                    if (active && payload && payload.length && coordinate) {
                      const score = payload[0].value as number;
                      // Calculate exact pixel Y height based on dynamic domain.
                      // Chart area is 230px tall (240px height - 10px top margin).
                      const pointY = 10 + ((yMax - score) / (yMax - yMin)) * 230;
                      
                      return (
                        <div 
                          className="bg-white p-3 shadow-lg border-none rounded-xl flex flex-col items-center min-w-[100px] absolute z-50 pointer-events-none transition-all duration-300 ease-out"
                          style={{ 
                            top: `${pointY}px`,
                            left: `${coordinate.x}px`,
                            transform: 'translate(-50%, calc(-100% - 40px))'
                          }}
                        >
                          <p className="text-sm font-bold text-[#1D1D1F]">{label}</p>
                          <p className="text-xs text-brand-blue font-medium">
                            {activeTab}: {score}
                          </p>
                          {/* Triangle pointer */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[99%] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
                        </div>
                      );
                    }
                    return null;
                  }}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
                <Line
                  type="monotone"
                  dataKey={activeKey}
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="w-px bg-slate-100 hidden md:block" />

          <div className="w-full md:w-72 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1D1D1F]">Past Records</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-sm text-[#75757A] hover:text-brand-blue hover:bg-transparent transition-colors gap-1 px-1"
                onClick={() => navigate("/mock-tests")}
              >
                Take test <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {mockRecords.map((record) => (
                <div key={record.id} className="p-4 rounded-2xl border border-slate-50 bg-[#f7faff] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1D1D1F]">{record.name}</p>
                    <p className="text-xs text-[#75757A]">{record.date}</p>
                  </div>
                  <Button size="sm" className="bg-brand-blue hover:bg-brand-blue/90 rounded-full px-6">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestPerformance;
