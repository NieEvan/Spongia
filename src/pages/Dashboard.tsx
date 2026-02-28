import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressTracker } from "@/components/dashboard/ProgressTracker";
import { RecentPractices } from "@/components/dashboard/RecentPractices";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { FriendsCard } from "@/components/dashboard/FriendsCard";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import MockTestPerformance from "@/components/dashboard/MockTestPerformance";

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
                  {/* Top Left: Progress Tracker (compact on dashboard) */}
                  <div className="lg:col-span-2 lg:h-full">
                     <ProgressTracker />
                  </div>

                  {/* Top Right: Profile */}
                  <div className="flex flex-col gap-6 h-full">
                     <div>
                        <ProfileCard />
                     </div>
                  </div>

                  {/* Middle Section: Skills + Activity */}
                  {/* Skills (left two columns) */}
                  <div className="lg:col-span-2">
                     <RecentPractices />
                  </div>

                  {/* Activity (right column, aligned with skills) */}
                  <div className="">
                     <ActivityCalendar />
                  </div>

                           {/* Mock Test Performance (aligned with social block horizontally) */}
                           <div className="lg:col-span-2">
                               <MockTestPerformance />
                           </div>

                           {/* Social (below activity) */}
                           <div className="lg:col-start-3">
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
