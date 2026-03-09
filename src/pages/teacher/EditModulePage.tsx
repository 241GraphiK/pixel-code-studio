import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Plus, Trash2, ChevronUp, ChevronDown, Save, Loader2, GripVertical,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModuleForm {
  title: string;
  description: string;
  field: string;
  level: string;
}

interface CourseRow {
  id: string | null; // null = new (not yet saved)
  title: string;
  content: string;
  duration: string;
  order: number;
  dirty: boolean;     // modified locally
  isNew: boolean;
  toDelete: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditModulePage() {
  const { id: moduleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [module, setModule] = useState<ModuleForm>({
    title: "", description: "", field: "", level: "L1",
  });

  const [courses, setCourses] = useState<CourseRow[]>([]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!moduleId || !user) return;
    setLoading(true);

    const [{ data: mod, error: modErr }, { data: courseData, error: cErr }] = await Promise.all([
      supabase.from("modules").select("*").eq("id", moduleId).eq("teacher_id", user.id).single(),
      supabase.from("courses").select("*").eq("module_id", moduleId).order("order", { ascending: true }),
    ]);

    if (modErr || !mod) {
      toast.error("Module introuvable ou accès refusé");
      navigate("/teacher/modules");
      return;
    }
    if (cErr) toast.error("Erreur lors du chargement des cours");

    setModule({
      title: mod.title,
      description: mod.description || "",
      field: mod.field || "",
      level: mod.level || "L1",
    });

    setCourses(
      (courseData || []).map((c) => ({
        id: c.id,
        title: c.title,
        content: c.content || "",
        duration: c.duration || "",
        order: c.order,
        dirty: false,
        isNew: false,
        toDelete: false,
      }))
    );

    setLoading(false);
  }, [moduleId, user, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Course helpers ─────────────────────────────────────────────────────────

  const visibleCourses = courses.filter((c) => !c.toDelete);

  const addCourse = () => {
    const maxOrder = courses.reduce((m, c) => Math.max(m, c.order), 0);
    setCourses((prev) => [
      ...prev,
      { id: null, title: "", content: "", duration: "", order: maxOrder + 1, dirty: true, isNew: true, toDelete: false },
    ]);
  };

  const updateCourse = (idx: number, key: keyof Pick<CourseRow, "title" | "content" | "duration">, value: string) => {
    setCourses((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: value, dirty: true };
      return updated;
    });
  };

  const markDelete = (idx: number) => {
    setCourses((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], toDelete: true };
      return updated;
    });
  };

  const moveCourse = (idx: number, direction: "up" | "down") => {
    // idx is index within visibleCourses
    const visible = courses.filter((c) => !c.toDelete);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === visible.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newVisible = [...visible];
    [newVisible[idx], newVisible[swapIdx]] = [newVisible[swapIdx], newVisible[idx]];

    // Re-assign order values
    const reordered = newVisible.map((c, i) => ({ ...c, order: i + 1, dirty: true }));

    // Merge back with toDelete entries
    const deleted = courses.filter((c) => c.toDelete);
    setCourses([...reordered, ...deleted]);
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!moduleId || !user) return;
    if (!module.title.trim() || !module.field.trim()) {
      toast.error("Titre et filière obligatoires");
      return;
    }

    setSaving(true);
    try {
      // 1. Update module metadata
      const { error: modErr } = await supabase
        .from("modules")
        .update({
          title: module.title.trim(),
          description: module.description.trim(),
          field: module.field.trim(),
          level: module.level,
          updated_at: new Date().toISOString(),
        })
        .eq("id", moduleId);
      if (modErr) throw modErr;

      // 2. Delete marked courses
      const toDelete = courses.filter((c) => c.toDelete && c.id);
      if (toDelete.length) {
        const { error } = await supabase.from("courses").delete().in("id", toDelete.map((c) => c.id!));
        if (error) throw error;
      }

      // 3. Insert new courses
      const newCourses = courses.filter((c) => c.isNew && !c.toDelete && c.title.trim());
      if (newCourses.length) {
        const { error } = await supabase.from("courses").insert(
          newCourses.map((c) => ({
            module_id: moduleId,
            title: c.title.trim(),
            content: c.content,
            duration: c.duration.trim(),
            order: c.order,
          }))
        );
        if (error) throw error;
      }

      // 4. Update dirty existing courses
      const dirtyExisting = courses.filter((c) => c.dirty && !c.isNew && !c.toDelete && c.id);
      await Promise.all(
        dirtyExisting.map((c) =>
          supabase
            .from("courses")
            .update({ title: c.title.trim(), content: c.content, duration: c.duration.trim(), order: c.order })
            .eq("id", c.id!)
        )
      );

      toast.success("Module enregistré !");
      await fetchData(); // refresh
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">

        {/* Header */}
        <button
          onClick={() => navigate("/teacher/modules")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux modules
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" /> Modifier le module
            </h1>
            <p className="text-muted-foreground">Modifiez les informations et les cours</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="shrink-0">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>

        {/* Module metadata */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
          <h2 className="font-semibold text-foreground">Informations du module</h2>

          <div className="space-y-2">
            <Label htmlFor="mod-title">Titre *</Label>
            <Input
              id="mod-title"
              value={module.title}
              onChange={(e) => setModule({ ...module, title: e.target.value })}
              placeholder="Ex: Algèbre linéaire"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mod-desc">Description</Label>
            <Textarea
              id="mod-desc"
              value={module.description}
              onChange={(e) => setModule({ ...module, description: e.target.value })}
              placeholder="Décrivez le contenu du module..."
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mod-field">Filière *</Label>
              <Input
                id="mod-field"
                value={module.field}
                onChange={(e) => setModule({ ...module, field: e.target.value })}
                placeholder="Ex: Informatique"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select value={module.level} onValueChange={(v) => setModule({ ...module, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["L1", "L2", "L3", "M1", "M2"].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Cours <span className="text-muted-foreground font-normal">({visibleCourses.length})</span>
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addCourse}>
              <Plus className="w-4 h-4 mr-1" /> Ajouter un cours
            </Button>
          </div>

          {visibleCourses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
              Aucun cours — cliquez sur « Ajouter un cours »
            </div>
          )}

          {visibleCourses.map((course, visIdx) => {
            // find real index in full courses array
            const realIdx = courses.indexOf(course);
            return (
              <div
                key={course.id ?? `new-${visIdx}`}
                className="border border-border rounded-lg p-4 space-y-3 bg-muted/30"
              >
                {/* Course header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GripVertical className="w-4 h-4 shrink-0" />
                    <span>Cours {visIdx + 1}</span>
                    {course.isNew && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Nouveau</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={visIdx === 0}
                      onClick={() => moveCourse(visIdx, "up")}
                      title="Monter"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={visIdx === visibleCourses.length - 1}
                      onClick={() => moveCourse(visIdx, "down")}
                      title="Descendre"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => markDelete(realIdx)}
                      className="text-destructive hover:text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <Label>Titre du cours</Label>
                  <Input
                    value={course.title}
                    onChange={(e) => updateCourse(realIdx, "title", e.target.value)}
                    placeholder="Titre du cours"
                    maxLength={200}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <Label>Durée</Label>
                  <Input
                    value={course.duration}
                    onChange={(e) => updateCourse(realIdx, "duration", e.target.value)}
                    placeholder="Ex: 45 min"
                    maxLength={50}
                  />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <Label>Contenu du cours</Label>
                  <RichTextEditor
                    value={course.content}
                    onChange={(value) => updateCourse(realIdx, "content", value)}
                    placeholder="Rédigez le contenu du cours..."
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom save */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/teacher/modules")}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
