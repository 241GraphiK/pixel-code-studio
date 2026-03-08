import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

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

  const fetchAll = useCallback(async () => {
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
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const awardXp = async (amount: number, reason: string) => {
    if (!user) return;

    // Capture state before
    const prevLevel = (profile as any)?.gamification_level ?? 1;
    const prevBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

    await supabase.rpc("award_xp", { _user_id: user.id, _amount: amount, _reason: reason });
    await supabase.rpc("check_and_award_badges", { _user_id: user.id });
    await refreshProfile();
    await fetchAll();

    // Check level up after refresh
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("gamification_level")
      .eq("id", user.id)
      .single();

    const newLevel = updatedProfile?.gamification_level ?? prevLevel;
    if (newLevel > prevLevel) {
      toast.success(`🎉 Niveau supérieur !`, {
        description: `Vous êtes passé au niveau ${newLevel} !`,
        duration: 5000,
      });
    }

    // Check new badges
    const { data: newUserBadges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user.id);

    const newBadgeIds = (newUserBadges || [])
      .map(ub => ub.badge_id)
      .filter(id => !prevBadgeIds.has(id));

    if (newBadgeIds.length > 0) {
      const newBadges = badges.filter(b => newBadgeIds.includes(b.id));
      for (const badge of newBadges) {
        toast.success(`🏆 Badge débloqué : ${badge.name}`, {
          description: badge.description,
          duration: 5000,
        });
      }
    }
  };

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  return {
    badges, userBadges, xpHistory, loading,
    xp, level, xpForNextLevel, xpProgress, xpInCurrentLevel,
    earnedBadgeIds, awardXp, refresh: fetchAll,
  };
}
