import { useEffect, useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Undo2,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const isHtml = (content: string) => /<\/?[a-z][\s\S]*>/i.test(content);

const normalizeContent = (content: string) => {
  const trimmed = content.trim();
  if (!trimmed) return "<p></p>";
  return isHtml(trimmed) ? trimmed : `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
};

export default function RichTextEditor({ value, onChange, placeholder = "Rédigez votre contenu...", className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md border border-border max-w-full',
        },
      }),
    ],
    content: normalizeContent(value),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[180px] p-3 text-foreground focus:outline-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const normalized = normalizeContent(value);
    if (editor.getHTML() !== normalized) {
      editor.commands.setContent(normalized, { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL du lien', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('URL de l\'image');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={cn("rounded-lg border border-input bg-background", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={cn(editor.isActive("bold") && "bg-accent text-accent-foreground")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={cn(editor.isActive("italic") && "bg-accent text-accent-foreground")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={cn(editor.isActive("strike") && "bg-accent text-accent-foreground")}>
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn(editor.isActive("heading", { level: 2 }) && "bg-accent text-accent-foreground")}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn(editor.isActive("bulletList") && "bg-accent text-accent-foreground")}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn(editor.isActive("orderedList") && "bg-accent text-accent-foreground")}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="mx-1 h-6 w-px bg-border" />
        <Button type="button" variant="ghost" size="icon" onClick={setLink} className={cn(editor.isActive("link") && "bg-accent text-accent-foreground")}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <div className="mx-1 h-6 w-px bg-border" />
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={cn(editor.isActive({ textAlign: 'left' }) && "bg-accent text-accent-foreground")}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={cn(editor.isActive({ textAlign: 'center' }) && "bg-accent text-accent-foreground")}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={cn(editor.isActive({ textAlign: 'right' }) && "bg-accent text-accent-foreground")}>
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={cn(editor.isActive({ textAlign: 'justify' }) && "bg-accent text-accent-foreground")}>
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="min-h-[180px]" />
      {editor.isEmpty && (
        <p className="pointer-events-none px-3 pb-3 text-sm text-muted-foreground">{placeholder}</p>
      )}
    </div>
  );
}
