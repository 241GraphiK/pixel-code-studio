import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Image, File, Loader2, Link2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ResourceUploadProps {
  courseId: string;
  onUploaded: () => void;
}

const ACCEPTED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "image/gif": "image",
};

const MAX_SIZE = 10 * 1024 * 1024;

export default function ResourceUpload({ courseId, onUploaded }: ResourceUploadProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [tab, setTab] = useState<"file" | "link">("file");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE) { toast.error("Fichier trop volumineux (max 10 Mo)"); return; }
    if (!ACCEPTED_TYPES[f.type]) { toast.error("Type non supporté. Utilisez PDF, PNG, JPG ou WebP."); return; }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleUploadFile = async () => {
    if (!file || !user || !title.trim()) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${courseId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("course-resources").upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("course-resources").getPublicUrl(path);
      const { error: insertError } = await supabase.from("resources").insert({
        course_id: courseId, title: title.trim(), type: ACCEPTED_TYPES[file.type] || "link", url: urlData.publicUrl,
      });
      if (insertError) throw insertError;
      toast.success("Ressource ajoutée !");
      resetAndClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = async () => {
    if (!user || !title.trim() || !linkUrl.trim()) return;
    // Basic URL validation
    let url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setUploading(true);
    try {
      const { error } = await supabase.from("resources").insert({
        course_id: courseId, title: title.trim(), type: "link", url,
      });
      if (error) throw error;
      toast.success("Lien ajouté !");
      resetAndClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'ajout");
    } finally {
      setUploading(false);
    }
  };

  const resetAndClose = () => {
    setOpen(false);
    setFile(null);
    setTitle("");
    setLinkUrl("");
    setTab("file");
    onUploaded();
  };

  const fileIcon = file
    ? ACCEPTED_TYPES[file.type] === "pdf"
      ? <FileText className="w-8 h-8 text-destructive" />
      : ACCEPTED_TYPES[file.type] === "image"
        ? <Image className="w-8 h-8 text-primary" />
        : <File className="w-8 h-8 text-muted-foreground" />
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Ajouter une ressource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une ressource</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "file" | "link")}>
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1 gap-1.5">
              <Upload className="w-4 h-4" /> Fichier
            </TabsTrigger>
            <TabsTrigger value="link" className="flex-1 gap-1.5">
              <Link2 className="w-4 h-4" /> Lien
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Titre</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nom de la ressource" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Fichier</label>
              <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif" onChange={handleFileChange} className="hidden" />
              {file ? (
                <div onClick={() => inputRef.current?.click()} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  {fileIcon}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
                  </div>
                </div>
              ) : (
                <div onClick={() => inputRef.current?.click()} className="flex flex-col items-center gap-2 p-6 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Cliquez pour sélectionner</p>
                  <p className="text-xs text-muted-foreground">PDF, PNG, JPG, WebP · Max 10 Mo</p>
                </div>
              )}
            </div>
            <Button onClick={handleUploadFile} disabled={!file || !title.trim() || uploading} className="w-full">
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upload en cours...</> : <><Upload className="w-4 h-4 mr-2" /> Uploader</>}
            </Button>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Titre</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Documentation officielle" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">URL</label>
              <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://example.com" type="url" />
            </div>
            <Button onClick={handleAddLink} disabled={!linkUrl.trim() || !title.trim() || uploading} className="w-full">
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ajout en cours...</> : <><Link2 className="w-4 h-4 mr-2" /> Ajouter le lien</>}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
