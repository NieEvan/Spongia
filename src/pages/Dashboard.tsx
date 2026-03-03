import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import { FriendsCard } from "@/components/dashboard/FriendsCard";
import { GoalCard } from "@/components/dashboard/GoalCard";
import MockTestPerformance from "@/components/dashboard/MockTestPerformance";
import { ProgressTracker } from "@/components/dashboard/ProgressTracker";
import { Sidebar } from "@/components/layout/Sidebar";

const Dashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7]">
      <Sidebar />
      <main className="flex-1 pt-[60px] pb-[20px] px-6 md:px-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Page Title */}
          <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F] pb-0">Dashboard</h1>

          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <ProgressTracker />
                <GoalCard />
              </div>
              <MockTestPerformance />
            </div>

            <div className="flex flex-col gap-6 min-w-80">
              <ActivityCalendar />
              <FriendsCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
