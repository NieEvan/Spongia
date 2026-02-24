import { useProfile } from "./useProfile";
import { useProgressStats } from "./useProgress";
import { useMemo } from "react";

export const DAILY_LIMIT = 15;

export const usePaywall = () => {
  const { profile, loading: profileLoading } = useProfile();
  const { results, isLoading: progressLoading } = useProgressStats();

  const isPaid = useMemo(() => {
    if (!profile) return false;
    const tier = profile.subscription_tier?.toLowerCase();
    return tier === "plus" || tier === "pro" || tier === "sponge plus" || tier === "sponge pro";
  }, [profile]);

  const questionsAnsweredToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    return Object.values(results).filter((r) => r.answeredAt >= todayTimestamp).length;
  }, [results]);

  const isLimitReached = useMemo(() => {
    if (isPaid) return false;
    return questionsAnsweredToday >= DAILY_LIMIT;
  }, [isPaid, questionsAnsweredToday]);

  const remainingQuestions = useMemo(() => {
    if (isPaid) return Infinity;
    return Math.max(0, DAILY_LIMIT - questionsAnsweredToday);
  }, [isPaid, questionsAnsweredToday]);

  return {
    isPaid,
    isLimitReached,
    remainingQuestions,
    questionsAnsweredToday,
    loading: profileLoading || progressLoading,
    subscriptionTier: profile?.subscription_tier
  };
};
