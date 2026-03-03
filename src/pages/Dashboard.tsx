import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressTracker } from "@/components/dashboard/ProgressTracker";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { FriendsCard } from "@/components/dashboard/FriendsCard";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import MockTestPerformance from "@/components/dashboard/MockTestPerformance";
import { GoalCard } from "@/components/dashboard/GoalCard";

const Dashboard = () => {
   return (
      <div className="flex h-screen overflow-hidden bg-[#f5f5f7]">
         <Sidebar />
         <main className="flex-1 pt-[60px] pb-[20px] px-6 md:px-10 overflow-y-auto">
            <div className="relative">
               <div className="absolute left-0 top-0 bottom-0 w-20 bg-brand-blue rounded-l-3xl -z-10" />
               <div className="max-w-7xl mx-auto">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
                  {/* Page Title */}
                  <div className="lg:col-span-3 pb-0">
                     <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F]">Dashboard</h1>
                  </div>

                  {/* TOP SECTION */}
                  {/* Top Left: Progress Tracker and Goal (compact on dashboard) */}
                  <div className="lg:col-span-2 lg:h-full grid grid-cols-1 md:grid-cols-5 gap-6">
                     <div className="md:col-span-3">
                        <ProgressTracker />
                     </div>
                     <div className="md:col-span-2">
                        <GoalCard />
                     </div>
                  </div>

                  {/* Top Right: Profile */}
                  <div className="flex flex-col gap-6 h-full">
                     <div>
                        <ProfileCard />
                     </div>
                  </div>

                  {/* Middle Section: Mock Test + Activity */}
                  <div className="lg:col-span-2">
                      <MockTestPerformance />
                  </div>

                  {/* Activity & Social vertically grouped to align neatly alongside MockTest in the right column */}
                  <div className="flex flex-col gap-8">
                     <ActivityCalendar />
                     <FriendsCard />
                  </div>
               </div>
            </div>
            </div>
         </main>
      </div>
   );
};

export default Dashboard;
