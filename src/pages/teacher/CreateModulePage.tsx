import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Plus, Trash2, GripVertical } from "lucide-react";
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
import RoleGuard from "@/components/auth/RoleGuard";

interface CourseForm {
  title: string;
  content: string;
  duration: string;
}

export default function CreateModulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [field, setField] = useState("");
  const [level, setLevel] = useState("L1");
  const [courses, setCourses] = useState<CourseForm[]>([{ title: "", content: "", duration: "" }]);

  const addCourse = () => setCourses([...courses, { title: "", content: "", duration: "" }]);
  const removeCourse = (i: number) => setCourses(courses.filter((_, idx) => idx !== i));
  const updateCourse = (i: number, key: keyof CourseForm, value: string) => {
    const updated = [...courses];
    updated[i] = { ...updated[i], [key]: value };
    setCourses(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !field.trim()) {
      toast.error("Veuillez remplir le titre et la filière");
      return;
    }

    setSaving(true);
    try {
      const { data: mod, error: modError } = await supabase
        .from("modules")
        .insert({ title: title.trim(), description: description.trim(), field: field.trim(), level, teacher_id: user.id })
        .select()
        .single();

      if (modError) throw modError;

      const validCourses = courses.filter(c => c.title.trim());
      if (validCourses.length > 0) {
        const { error: coursesError } = await supabase
          .from("courses")
          .insert(validCourses.map((c, i) => ({
            module_id: mod.id,
            title: c.title.trim(),
            content: c.content.trim(),
            duration: c.duration.trim(),
            order: i + 1,
          })));
        if (coursesError) throw coursesError;
      }

      toast.success("Module créé avec succès !");
      navigate("/modules");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["teacher", "admin"]}>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Créer un module
          </h1>
          <p className="text-muted-foreground">Ajoutez un nouveau module avec ses cours</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Module info */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
            <h2 className="font-semibold text-foreground">Informations du module</h2>
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Algèbre linéaire" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez le contenu du module..." rows={3} maxLength={1000} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field">Filière *</Label>
                <Input id="field" value={field} onChange={e => setField(e.target.value)} placeholder="Ex: Informatique" required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["L1", "L2", "L3", "M1", "M2"].map(l => (
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
              <h2 className="font-semibold text-foreground">Cours ({courses.length})</h2>
              <Button type="button" variant="outline" size="sm" onClick={addCourse}>
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </div>

            {courses.map((course, i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                    Cours {i + 1}
                  </div>
                  {courses.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCourse(i)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Input value={course.title} onChange={e => updateCourse(i, "title", e.target.value)} placeholder="Titre du cours" maxLength={200} />
                <div className="space-y-2">
                  <Label>Contenu du cours</Label>
                  <RichTextEditor
                    value={course.content}
                    onChange={(value) => updateCourse(i, "content", value)}
                    placeholder="Rédigez le contenu du cours..."
                  />
                </div>
                <Input value={course.duration} onChange={e => updateCourse(i, "duration", e.target.value)} placeholder="Durée (ex: 45 min)" maxLength={50} />
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Création..." : "Créer le module"}
            </Button>
          </div>
        </form>
        </div>
      </RoleGuard>
    </AppLayout>
  );
}

