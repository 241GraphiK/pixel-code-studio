import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  condition_type: string;
  condition_value: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
}

export interface XpTransaction {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export function useGamification() {
  const { user, profile, refreshProfile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [xpHistory, setXpHistory] = useState<XpTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const xp = (profile as any)?.xp ?? 0;
  const level = (profile as any)?.gamification_level ?? 1;
  const xpForNextLevel = level * 100;
  const xpInCurrentLevel = xp - (level - 1) * 100;
  const xpProgress = Math.min(100, (xpInCurrentLevel / 100) * 100);

  const fetchAll = async () => {
    if (!user) return;
    
    const [badgesRes, userBadgesRes, xpRes] = await Promise.all([
      supabase.from("badges").select("*").order("condition_value"),
      supabase.from("user_badges").select("*").eq("user_id", user.id),
      supabase.from("xp_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);

    setBadges((badgesRes.data as any) || []);
    setUserBadges((userBadgesRes.data as any) || []);
    setXpHistory((xpRes.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const awardXp = async (amount: number, reason: string) => {
    if (!user) return;
    await supabase.rpc("award_xp", { _user_id: user.id, _amount: amount, _reason: reason });
    await supabase.rpc("check_and_award_badges", { _user_id: user.id });
    await refreshProfile();
    await fetchAll();
  };

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  return {
    badges, userBadges, xpHistory, loading,
    xp, level, xpForNextLevel, xpProgress, xpInCurrentLevel,
    earnedBadgeIds, awardXp, refresh: fetchAll,
  };
}
