import { useState, useEffect } from "react";
import { Crown, Medal, Zap, Filter, Search, Users } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/shared/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeaderboardEntry {
  id: string; name: string; xp: number; gamification_level: number;
  avatar_url: string | null; institution: string | null; field: string | null; level: string | null;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filtered, setFiltered] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [institution, setInstitution] = useState("all");
  const [field, setField] = useState("all");
  const [level, setLevel] = useState("all");
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  const fetchData = async () => {
    const { data } = await supabase.from("profiles").select("id, name, xp, gamification_level, avatar_url, institution, field, level").order("xp", { ascending: false });
    const list = (data || []) as LeaderboardEntry[];
    setEntries(list); setFiltered(list);
    const unique = (arr: (string | null)[]) => [...new Set(arr.filter(Boolean))] as string[];
    setInstitutions(unique(list.map(e => e.institution)));
    setFields(unique(list.map(e => e.field)));
    setLevels(unique(list.map(e => e.level)));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel("leaderboard-page-realtime").on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    let result = entries;
    if (search) { const q = search.toLowerCase(); result = result.filter(e => e.name.toLowerCase().includes(q)); }
    if (institution !== "all") result = result.filter(e => e.institution === institution);
    if (field !== "all") result = result.filter(e => e.field === field);
    if (level !== "all") result = result.filter(e => e.level === level);
    setFiltered(result);
  }, [search, institution, field, level, entries]);

  const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
  const currentUserRank = entries.findIndex(e => e.id === user?.id) + 1;

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<Crown className="w-5 h-5" />}
          title="Classement général"
          subtitle={`${entries.length} participant${entries.length > 1 ? "s" : ""}${currentUserRank > 0 ? ` · Vous êtes #${currentUserRank}` : ""}`}
        />

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filtres
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
            </div>
            <Select value={institution} onValueChange={setInstitution}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Institution" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {institutions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Filière" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {fields.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Niveau" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <>
            {/* Top 3 podium */}
            {filtered.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 0, 2].map(idx => {
                  const e = filtered[idx];
                  if (!e) return null;
                  const rank = idx + 1;
                  const sizes = rank === 1 ? "py-6" : "py-4 sm:mt-4";
                  const borderColor = rank === 1 ? "border-yellow-500/30 bg-yellow-500/5" : rank === 2 ? "border-gray-400/30 bg-gray-400/5" : "border-amber-600/30 bg-amber-600/5";
                  return (
                    <div key={e.id} className={`bg-card rounded-2xl border-2 ${borderColor} p-4 ${sizes} shadow-soft text-center flex flex-col sm:items-center sm:text-center items-start text-left`}>
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-0 w-full sm:w-auto">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center sm:mb-2 ${rank === 1 ? "bg-yellow-500/20" : rank === 2 ? "bg-gray-400/20" : "bg-amber-600/20"}`}>
                          <Medal className={`w-5 h-5 ${medalColors[rank - 1]}`} />
                        </div>
                        <Avatar className="w-12 h-12 sm:mb-2">
                          <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">{e.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 sm:flex-initial min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{e.name}</p>
                          <p className="text-[11px] text-muted-foreground">{e.institution || "—"} · {e.field || "—"}</p>
                          <div className="mt-1 sm:mt-2 flex items-center gap-1 text-warning font-bold text-sm justify-center sm:justify-center">
                            <Zap className="w-4 h-4" /> {e.xp} XP
                          </div>
                          <p className="text-[11px] text-muted-foreground">Niveau {e.gamification_level}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
              <div className="divide-y divide-border/40">
                {filtered.map((e, i) => {
                  const isCurrentUser = e.id === user?.id;
                  return (
                    <div key={e.id} className={`flex items-center gap-4 px-5 py-3 transition-colors ${isCurrentUser ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-warning/10" : "bg-muted"}`}>
                        {i < 3 ? <Medal className={`w-3.5 h-3.5 ${medalColors[i]}`} /> : <span className="text-muted-foreground">{i + 1}</span>}
                      </span>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">{e.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.name} {isCurrentUser && <span className="text-xs text-primary">(vous)</span>}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{e.institution || "—"} · {e.field || "—"} · {e.level || "—"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground flex items-center gap-1 justify-end"><Zap className="w-3.5 h-3.5 text-warning" /> {e.xp}</p>
                        <p className="text-[11px] text-muted-foreground">Niv. {e.gamification_level}</p>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-semibold">Aucun résultat trouvé</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
