import { useEffect, useRef, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  htmlContent: string;
  contentRef: React.RefObject<HTMLDivElement>;
}

function extractHeadings(html: string): Heading[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const nodes = doc.querySelectorAll("h2, h3");
  return Array.from(nodes).map((el, i) => ({
    id: `toc-heading-${i}`,
    text: el.textContent?.trim() || "",
    level: (parseInt(el.tagName[1]) as 2 | 3),
  }));
}

export default function TableOfContents({ htmlContent, contentRef }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from HTML
  useEffect(() => {
    setHeadings(extractHeadings(htmlContent));
    setActiveId("");
  }, [htmlContent]);

  // Inject IDs into DOM headings after they render
  useEffect(() => {
    if (!contentRef.current || headings.length === 0) return;

    const domHeadings = contentRef.current.querySelectorAll("h2, h3");
    domHeadings.forEach((el, i) => {
      el.setAttribute("id", `toc-heading-${i}`);
    });

    // Set up IntersectionObserver
    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0 }
    );

    domHeadings.forEach((el) => observer.observe(el));
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [headings, contentRef]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-6">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <List className="w-3.5 h-3.5" />
          <span>Sommaire</span>
        </div>
        <nav className="space-y-0.5">
          {headings.map((h) => (
            <button
              key={h.id}
              onClick={() => handleClick(h.id)}
              className={cn(
                "w-full text-left text-sm leading-snug px-2 py-1.5 rounded-md transition-colors",
                h.level === 3 && "pl-4",
                activeId === h.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {h.text}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
