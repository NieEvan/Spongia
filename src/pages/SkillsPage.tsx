import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { SkillCard } from "@/components/ui/skill-card";
import { useQuestionStats } from "@/hooks/useQuestions";
import { useProgressStats } from "@/hooks/useProgress";
import { ProgressTracker } from "@/components/dashboard/ProgressTracker";
import { WeaknessCard } from "@/components/dashboard/WeaknessCard";

const domainOrder = [
  "Information and Ideas",
  "Craft and Structure",
  "Expression of Ideas",
  "Standard English Conventions",
];

const SkillsPage = () => {
  const stats = useQuestionStats();
  const progressStats = useProgressStats();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar />

      <main className="flex-1 pt-[60px] pb-[20px] px-6 md:px-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-brand-black">
              All Skills
            </h1>
          </div>

          {/* Progress Tracker */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="lg:w-2/3">
              <ProgressTracker />
            </div>
            <div className="lg:w-1/3">
              <WeaknessCard />
            </div>
          </div>

          {/* Domain Sections */}
          {domainOrder.map((domain, domainIndex) => {
            const skills = stats.skillsByDomain[domain] || [];
            if (skills.length === 0) return null;

            return (
              <section
                key={domain}
                className="mb-12"
              >
                <div className="mb-6 flex items-center gap-3">
                  <h2 className="text-2xl font-medium tracking-tight text-brand-black">{domain}</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {skills.map((skill, skillIndex) => {
                    const skillRecent = progressStats.skillRecentStats[skill] || { accuracy: 0, total: 0 };
                    return (
                      <SkillCard
                        key={skill}
                        skill={skill}
                        domain={domain}
                        totalCount={stats.skillCounts[skill] || 0}
                        attemptedCount={skillRecent.total}
                        recentAccuracy={skillRecent.accuracy}
                        index={domainIndex * 4 + skillIndex}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default SkillsPage;
