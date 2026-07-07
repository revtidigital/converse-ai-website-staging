import { useEditor, EditorContent, Node, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import { useCallback, useEffect, useRef, useState } from "react";
import { checkLink, extractLinks, type LinkCheckResult, type ExtractedLink } from "@/lib/checkLink";
import { uploadBlogImage } from "@/lib/uploadImage";
import { sanitizeHtml } from "@/lib/htmlSanitizer";
import { FileText, ChevronDown, Layout, Type, Image as ImageIcon, Video, Play, Minus, AlertTriangle, Share2, MoreHorizontal, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Custom TipTap node: Callout Box ──────────────────────────────────────────
const CalloutBox = Node.create({
  name: "calloutBox",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: "div[data-type=\"callout\"]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "callout", class: "rte-callout-box" }), 0];
  },
  addCommands() {
    return {
      insertCalloutBox:
        () =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: "calloutBox",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Quick summary: Write your highlighted text here." }],
              },
            ],
          });
        },
    } as any;
  },
});

// ── Custom TipTap node: CTA Box ───────────────────────────────────────────────
const CtaBox = Node.create({
  name: "ctaBox",
  group: "block",
  // Three children: heading paragraph, subtext paragraph, link paragraph
  content: "paragraph paragraph paragraph",
  parseHTML() {
    return [{ tag: "div[data-type=\"cta-box\"]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "cta-box", class: "rte-cta-box" }), 0];
  },
  addCommands() {
    return {
      insertCtaBox:
        () =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: "ctaBox",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Ready to get started?" }],
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: "Tell us your lead problem — get a free discovery call." }],
              },
              {
                type: "paragraph",
                content: [
                  { type: "text", marks: [{ type: "bold" }], text: "Book your free discovery call → " },
                  {
                    type: "text",
                    marks: [
                      { type: "bold" },
                      { type: "link", attrs: { href: "https://theconverseai.com/book-demo" } },
                    ],
                    text: "theconverseai.com/book-demo",
                  },
                ],
              },
            ],
          });
        },
    } as any;
  },
});

/** Small coloured badge summarising a link-check result. */
const CheckBadge = ({ r, checking }: { r: LinkCheckResult | null; checking: boolean }) => {
  if (checking) return <span style={{ fontSize: 12, color: "#6B7280" }}>⏳ checking…</span>;
  if (!r) return null;
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    valid: { bg: "#DCFCE7", fg: "#15803D", label: `✓ ${r.httpCode} OK` },
    redirect: { bg: "#FEF9C3", fg: "#A16207", label: `⤳ ${r.httpCode} redirect` },
    broken: { bg: "#FEE2E2", fg: "#B91C1C", label: r.httpCode ? `✗ ${r.httpCode} broken` : `✗ ${r.error || "broken"}` },
    empty: { bg: "#F3F4F6", fg: "#6B7280", label: "— empty" },
    error: { bg: "#FEE2E2", fg: "#B91C1C", label: `✗ ${r.error || "checker error"}` },
    checking: { bg: "#F3F4F6", fg: "#6B7280", label: "checking…" },
  };
  const s = map[r.status] ?? map.broken;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
};

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    title={title}
    className={cn(
      "px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150 flex items-center gap-2",
      "w-auto md:w-full text-left justify-start shrink-0",
      active 
        ? "bg-violet-100 border-violet-400 text-violet-700 shadow-sm" 
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300",
      disabled && "opacity-40 cursor-not-allowed"
    )}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-[1px] h-[20px] md:w-full md:h-[1px] bg-[#E9E5F3] mx-1 md:my-1 shrink-0" />
);

// ── Dropdown menu for Table sub-actions ───────────────────────────────────────
const TableDropdown = ({ editor }: { editor: any }) => {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<"table" | "cell" | "row" | "column" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSubmenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "6px 14px",
    fontSize: 13,
    color: "#1F2937",
    cursor: "pointer",
    whiteSpace: "nowrap",
    background: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left",
    borderRadius: 6,
  };

  const runCmd = (fn: () => void) => {
    fn();
    setOpen(false);
    setSubmenu(null);
  };

  const tableMenuItems = [
    {
      label: "⊞ Table",
      key: "table" as const,
      submenuItems: [
        { label: "Insert Table (3×3)", action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
        { 
          label: "Insert Custom Table...", 
          action: () => {
            const rowsStr = window.prompt("Enter number of rows:", "3");
            if (rowsStr === null) return;
            const colsStr = window.prompt("Enter number of columns:", "3");
            if (colsStr === null) return;
            const rows = Number(rowsStr);
            const cols = Number(colsStr);
            if (rows > 0 && cols > 0) {
              editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
            } else {
              alert("Please enter valid numbers greater than 0");
            }
          }
        },
        { label: "Delete Table", action: () => editor.chain().focus().deleteTable().run() },
        { label: "Table Properties", action: () => {} },
      ],
    },
    {
      label: "☐ Cell",
      key: "cell" as const,
      submenuItems: [
        { label: "Merge Cells", action: () => editor.chain().focus().mergeCells().run() },
        { label: "Split Cell", action: () => editor.chain().focus().splitCell().run() },
        { label: "Toggle Header Cell", action: () => editor.chain().focus().toggleHeaderCell().run() },
      ],
    },
    {
      label: "▦ Row",
      key: "row" as const,
      submenuItems: [
        { label: "Add Row Before", action: () => editor.chain().focus().addRowBefore().run() },
        { label: "Add Row After", action: () => editor.chain().focus().addRowAfter().run() },
        { label: "Delete Row", action: () => editor.chain().focus().deleteRow().run() },
        { label: "Toggle Header Row", action: () => editor.chain().focus().toggleHeaderRow().run() },
      ],
    },
    {
      label: "▥ Column",
      key: "column" as const,
      submenuItems: [
        { label: "Add Column Before", action: () => editor.chain().focus().addColumnBefore().run() },
        { label: "Add Column After", action: () => editor.chain().focus().addColumnAfter().run() },
        { label: "Delete Column", action: () => editor.chain().focus().deleteColumn().run() },
        { label: "Toggle Header Column", action: () => editor.chain().focus().toggleHeaderColumn().run() },
      ],
    },
  ];

  return (
    <div ref={ref} className="relative inline-block md:block md:w-full shrink-0">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v); setSubmenu(null); }}
        title="Table"
        className={cn(
          "px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150 flex items-center justify-between gap-2",
          "w-auto md:w-full text-left justify-between shrink-0",
          open 
            ? "bg-violet-100 border-violet-400 text-violet-700 shadow-sm" 
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
        )}
      >
        <span className="flex items-center gap-2">
          ⊞ Table
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {open && (
        <div
          className="absolute z-[9999] bg-white border border-[#E9E5F3] rounded-lg shadow-xl min-w-[160px]"
          style={{
            top: "calc(100% + 4px)",
            left: 0,
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            minWidth: 160,
            padding: "6px",
          }}
        >
          {tableMenuItems.map((item) => (
            <div key={item.key} style={{ position: "relative" }}>
              <button
                type="button"
                onMouseEnter={() => setSubmenu(item.key)}
                style={{
                  ...menuItemStyle,
                  background: submenu === item.key ? "#F3E8FF" : "transparent",
                  color: submenu === item.key ? "#7C3AED" : "#1F2937",
                  fontWeight: submenu === item.key ? 700 : 500,
                }}
              >
                {item.label}
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>›</span>
              </button>

              {submenu === item.key && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "calc(100% + 2px)",
                    zIndex: 10000,
                    background: "#fff",
                    border: "1px solid #E9E5F3",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    minWidth: 180,
                    padding: "6px",
                  }}
                >
                  {item.submenuItems.map((sub) => (
                    <button
                      key={sub.label}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCmd(sub.action); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3E8FF"; (e.currentTarget as HTMLElement).style.color = "#7C3AED"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#1F2937"; }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface WidgetItem {
  name: string;
  category: "layout" | "basic" | "general";
  icon: string;
  description: string;
  template: string;
}

const WIDGETS_LIST: WidgetItem[] = [
  {
    name: "Container",
    category: "layout",
    icon: "📦",
    description: "Styled container wrapper box",
    template: `<div class="wp-container" style="padding: 24px; border: 2px solid #000; border-radius: 16px; background: #FAFAFC; margin: 24px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">\n  <h3>Container Box</h3>\n  <p>Add your content here.</p>\n</div>`
  },
  {
    name: "Grid",
    category: "layout",
    icon: "▦",
    description: "2-Column responsive grid",
    template: `<div class="wp-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0;">\n  <div style="border: 2px solid #000; padding: 20px; border-radius: 12px; background: #fff;">\n    <h4>Column 1</h4>\n    <p>Column 1 content text.</p>\n  </div>\n  <div style="border: 2px solid #000; padding: 20px; border-radius: 12px; background: #fff;">\n    <h4>Column 2</h4>\n    <p>Column 2 content text.</p>\n  </div>\n</div>`
  },
  {
    name: "Heading",
    category: "basic",
    icon: "🇹",
    description: "Heading title",
    template: `<h2>Heading Title</h2>`
  },
  {
    name: "Image",
    category: "basic",
    icon: "🖼",
    description: "Image block placeholder",
    template: `<img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800" alt="Blog Image" style="width: 100%; border-radius: 12px; border: 2px solid #000; display: block; margin: 20px 0;" />`
  },
  {
    name: "Text Editor",
    category: "basic",
    icon: "✍",
    description: "Paragraph block text",
    template: `<p>This is a text paragraph block. Double click to customize this text like any element.</p>`
  },
  {
    name: "Video",
    category: "basic",
    icon: "🎥",
    description: "Embed Video player",
    template: `<div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0; border: 2px solid #000; border-radius: 12px;">\n  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>\n</div>`
  },
  {
    name: "Button",
    category: "basic",
    icon: "🔘",
    description: "Gradient Button CTA",
    template: `<div style="text-align: center; margin: 20px 0;">\n  <a href="#" style="background: linear-gradient(135deg, #7c3aed, #d946ef); color: #fff; padding: 12px 28px; border-radius: 99px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); border: 2px solid #000; transition: all 0.2s ease;">Click Here</a>\n</div>`
  },
  {
    name: "Divider",
    category: "basic",
    icon: "➖",
    description: "Horizontal separator line",
    template: `<hr style="border: none; border-top: 2px solid #000; margin: 24px 0;" />`
  },
  {
    name: "HTML",
    category: "general",
    icon: "</>",
    description: "Write raw HTML custom block",
    template: `<div class="custom-html-block" style="margin: 20px 0;">\n  <!-- Write custom HTML/styles here -->\n  <div style="background: #FAFAFC; padding: 16px; border: 2px dashed #7C3AED; border-radius: 8px;">\n    <h4 style="color: #7C3AED; margin: 0 0 8px;">Custom HTML Block</h4>\n    <p style="margin: 0;">Add custom styles or elements here.</p>\n  </div>\n</div>`
  },
  {
    name: "Alert",
    category: "general",
    icon: "⚠️",
    description: "Notification alert banner",
    template: `<div class="wp-alert-box" style="background: #FEE2E2; border: 2px solid #000; border-left: 6px solid #EF4444; padding: 16px; border-radius: 12px; color: #991B1B; margin: 20px 0;">\n  <strong style="font-weight: 700;">Alert:</strong> Update this message box.\n</div>`
  },
  {
    name: "Social Icons",
    category: "general",
    icon: "🔗",
    description: "Row of social links",
    template: `<div class="wp-social-icons" style="display: flex; gap: 16px; justify-content: center; margin: 20px 0;">\n  <a href="#" style="color: #7C3AED; font-weight: 700; border: 2px solid #000; padding: 6px 16px; border-radius: 8px; text-decoration: none; background: #fff;">Facebook</a>\n  <a href="#" style="color: #7C3AED; font-weight: 700; border: 2px solid #000; padding: 6px 16px; border-radius: 8px; text-decoration: none; background: #fff;">Twitter</a>\n  <a href="#" style="color: #7C3AED; font-weight: 700; border: 2px solid #000; padding: 6px 16px; border-radius: 8px; text-decoration: none; background: #fff;">LinkedIn</a>\n</div>`
  },
  {
    name: "Read More",
    category: "general",
    icon: "📝",
    description: "Dashed separator",
    template: `<div class="wp-read-more" style="display: flex; align-items: center; text-align: center; color: #7C3AED; font-weight: 600; margin: 24px 0;">\n  <span style="flex: 1; border-bottom: 2px dashed #7C3AED; margin-right: 16px;"></span>\n  Read More\n  <span style="flex: 1; border-bottom: 2px dashed #7C3AED; margin-left: 16px;"></span>\n</div>`
  }
];

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your blog post..." }: RichTextEditorProps) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [activeTab, setActiveTab] = useState<"format" | "widgets">("format");
  const [widgetSearchQuery, setWidgetSearchQuery] = useState("");
  
  // Immersive editor states
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{
    id: string;
    type: "heading" | "text" | "image" | "html" | null;
    tag: string;
    content: string;
    src?: string;
    link?: string;
  } | null>(null);
  
  const [sidebarTab, setSidebarTab] = useState<"content" | "style" | "advanced">("content");

  // Style customization mock states
  const [align, setAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [textColor, setTextColor] = useState("#1F2937");
  const [margin, setMargin] = useState({ top: 0, right: 0, bottom: 12, left: 0 });
  const [padding, setPadding] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const sidebarImageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CalloutBox,
      CtaBox,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      if (!isHtmlMode) {
        onChange(e.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor-content",
        style: "min-height:400px; outline:none; font-family: Inter, sans-serif;",
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        const htmlBlock = target.closest(".custom-html-block") as HTMLElement | null;
        const heading = target.closest("h1, h2, h3, h4, h5, h6") as HTMLElement | null;
        const paragraph = target.closest("p") as HTMLElement | null;
        const img = target.closest("img") as HTMLElement | null;

        // Remove outline class from all elements in editor
        view.dom.querySelectorAll(".selected-widget-outline").forEach(el => {
          el.classList.remove("selected-widget-outline");
        });

        if (htmlBlock) {
          htmlBlock.classList.add("selected-widget-outline");
          setSelectedElement({
            id: "html-" + pos,
            type: "html",
            tag: "DIV",
            content: htmlBlock.innerHTML,
          });
          setSidebarTab("content");
          return false;
        }

        if (img) {
          img.classList.add("selected-widget-outline");
          setSelectedElement({
            id: "img-" + pos,
            type: "image",
            tag: "IMG",
            content: img.getAttribute("alt") || "",
            src: img.getAttribute("src") || "",
            link: img.parentElement?.tagName === "A" ? img.parentElement.getAttribute("href") || "" : "",
          });
          setSidebarTab("content");
          return false;
        }

        if (heading) {
          heading.classList.add("selected-widget-outline");
          setSelectedElement({
            id: "heading-" + pos,
            type: "heading",
            tag: heading.tagName,
            content: heading.innerText,
            link: heading.querySelector("a")?.getAttribute("href") || "",
          });
          setSidebarTab("content");
          return false;
        }

        if (paragraph) {
          paragraph.classList.add("selected-widget-outline");
          setSelectedElement({
            id: "text-" + pos,
            type: "text",
            tag: "P",
            content: paragraph.innerText,
          });
          setSidebarTab("content");
          return false;
        }

        setSelectedElement(null);
        return false;
      }
    },
  });

  // Sync content updates from parent if changed externally
  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML() && !editor.isFocused && !isHtmlMode) {
      editor.commands.setContent(content);
    }
  }, [content, editor, isHtmlMode]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const addImageByUrl = useCallback(() => {
    const url = window.prompt("Paste image URL:");
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const handleImageFile = useCallback(async (file: File | undefined) => {
    if (!file || !editor) return;
    setUploadingImg(true);
    try {
      const url = await uploadBlogImage(file);
      // Check if updating currently selected image element in sidebar
      if (selectedElement && selectedElement.type === "image") {
        handleImageSrcChange(url);
      } else {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch (err: any) {
      window.alert("Image upload failed: " + (err?.message || "unknown error"));
    } finally {
      setUploadingImg(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (sidebarImageInputRef.current) sidebarImageInputRef.current.value = "";
    }
  }, [editor, selectedElement]);

  // ── Link popover with live URL checking ────────────────────────────────
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkCheck, setLinkCheck] = useState<LinkCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  // ── "Scan all links" panel ─────────────────────────────────────────────
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{ url: string; text: string; result: LinkCheckResult }[]>([]);

  const openLinkEditor = useCallback(() => {
    if (!editor) return;
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setLinkCheck(null);
    setLinkOpen(true);
  }, [editor]);

  // Debounced live check as the URL is typed/pasted
  useEffect(() => {
    if (!linkOpen) return;
    const u = linkUrl.trim();
    if (!/^https?:\/\//i.test(u)) { setLinkCheck(null); setChecking(false); return; }
    setChecking(true);
    const t = setTimeout(async () => {
      const r = await checkLink(u);
      setLinkCheck(r);
      setChecking(false);
    }, 600);
    return () => clearTimeout(t);
  }, [linkUrl, linkOpen]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const u = linkUrl.trim();
    if (u === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: u }).run();
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const scanLinks = useCallback(async () => {
    if (!editor) return;
    const links = extractLinks(editor.getHTML());
    setScanOpen(true);
    setScanResults(links.map((link) => ({ ...link, result: { status: "checking", httpCode: 0 } })));
    setScanning(true);
    
    const uniqueUrls = Array.from(new Set(links.map((l) => l.url)));
    const queue = [...uniqueUrls];
    async function worker() {
      while (queue.length) {
        const url = queue.shift()!;
        const result = await checkLink(url);
        setScanResults((prev) => prev.map((p) => (p.url === url ? { ...p, result } : p)));
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    setScanning(false);
  }, [editor]);

  // HTML toggle handler
  const toggleHtmlMode = () => {
    if (!editor) return;
    if (isHtmlMode) {
      const sanitized = sanitizeHtml(htmlContent).html;
      editor.commands.setContent(sanitized);
      onChange(sanitized);
      setIsHtmlMode(false);
    } else {
      const currentHtml = editor.getHTML();
      setHtmlContent(currentHtml);
      setIsHtmlMode(true);
    }
  };

  const handleHtmlChange = (val: string) => {
    setHtmlContent(val);
    const sanitized = sanitizeHtml(val).html;
    onChange(sanitized);
  };

  const insertWidgetHtml = (htmlTemplate: string) => {
    if (isHtmlMode) {
      const textarea = codeTextareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + htmlTemplate + text.substring(end);
      handleHtmlChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + htmlTemplate.length;
      }, 50);
    } else {
      if (editor) {
        editor.chain().focus().insertContent(htmlTemplate).run();
      }
    }
  };

  // Real-time selected element synchronizers
  const handleHeadingTextChange = (val: string) => {
    if (!editor || !selectedElement) return;
    setSelectedElement(prev => prev ? { ...prev, content: val } : null);
    
    editor.chain().focus().command(({ tr, state }) => {
      const { selection } = state;
      const { $from } = selection;
      const parent = $from.parent;
      if (parent.type.name === "heading") {
        const start = $from.before();
        const end = $from.after();
        const newNode = parent.type.create(parent.attrs, state.schema.text(val));
        tr.replaceWith(start, end, newNode);
        return true;
      }
      return false;
    }).run();
  };

  const handleHeadingLinkChange = (url: string) => {
    if (!editor || !selectedElement) return;
    setSelectedElement(prev => prev ? { ...prev, link: url } : null);
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleHeadingLevelChange = (lvl: string) => {
    const levelNum = parseInt(lvl.replace("H", ""));
    if (!editor || isNaN(levelNum)) return;
    setSelectedElement(prev => prev ? { ...prev, tag: lvl } : null);
    editor.chain().focus().toggleHeading({ level: levelNum as any }).run();
  };

  const handleTextContentChange = (val: string) => {
    if (!editor || !selectedElement) return;
    setSelectedElement(prev => prev ? { ...prev, content: val } : null);
    
    editor.chain().focus().command(({ tr, state }) => {
      const { selection } = state;
      const { $from } = selection;
      const parent = $from.parent;
      if (parent.type.name === "paragraph") {
        const start = $from.before();
        const end = $from.after();
        const newNode = parent.type.create(parent.attrs, state.schema.text(val));
        tr.replaceWith(start, end, newNode);
        return true;
      }
      return false;
    }).run();
  };

  const handleImageSrcChange = (src: string) => {
    if (!editor || !selectedElement) return;
    setSelectedElement(prev => prev ? { ...prev, src } : null);
    editor.chain().focus().command(({ tr, state }) => {
      const { selection } = state;
      if (selection.node && selection.node.type.name === "image") {
        tr.setNodeMarkup(selection.from, undefined, { src, alt: selectedElement.content });
        return true;
      }
      return false;
    }).run();
  };

  const handleHtmlWidgetChange = (val: string) => {
    if (!editor || !selectedElement) return;
    setSelectedElement(prev => prev ? { ...prev, content: val } : null);
    
    editor.chain().focus().command(({ tr, state }) => {
      const { selection } = state;
      const { $from } = selection;
      const start = $from.before();
      const end = $from.after();
      
      const element = document.createElement("div");
      element.innerHTML = val.includes("custom-html-block") ? val : `<div class="custom-html-block">${val}</div>`;
      const parsed = editor.view.domParser.parse(element);
      
      tr.replaceWith(start, end, parsed.content);
      return true;
    }).run();
  };

  const clearSelection = () => {
    if (editor) {
      editor.view.dom.querySelectorAll(".selected-widget-outline").forEach(el => {
        el.classList.remove("selected-widget-outline");
      });
    }
    setSelectedElement(null);
  };

  // Filter widgets by search query
  const filteredWidgets = WIDGETS_LIST.filter((w) =>
    w.name.toLowerCase().includes(widgetSearchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(widgetSearchQuery.toLowerCase())
  );

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div className={cn(
      "flex border border-[#E9E5F3] bg-white shadow-sm transition-all duration-300",
      isFullScreen 
        ? "fixed inset-0 z-[9999] w-screen h-screen rounded-none overflow-hidden flex-col md:flex-row" 
        : "flex-col md:flex-row rounded-xl overflow-visible"
    )}>
      {/* Left Sidebar Layout */}
      <div 
        className={cn(
          "shrink-0 border-b md:border-b-0 md:border-r border-[#F3F4F6] bg-[#FAFAFC] p-4 flex flex-col gap-3 sticky z-40 custom-scrollbar overflow-y-auto w-full md:w-80",
          isFullScreen ? "h-screen max-h-screen" : "md:h-[calc(100vh-140px)] max-h-[500px] md:max-h-[calc(100vh-140px)] rounded-t-xl md:rounded-t-none md:rounded-l-xl"
        )}
        style={{
          position: "sticky",
          top: "0px",
        }}
      >
        {selectedElement ? (
          /* Live Element Edit Panels (Heading, Text Editor, Image) */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-3 shrink-0">
              <h3 className="font-bold text-sm text-gray-800">
                Edit {selectedElement.type === "heading" ? "Heading" : selectedElement.type === "text" ? "Text Editor" : selectedElement.type === "html" ? "HTML" : "Image"}
              </h3>
              <button 
                type="button" 
                onClick={clearSelection} 
                className="text-xs text-violet-600 hover:text-violet-800 font-semibold bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded"
              >
                ✕ Deselect
              </button>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg mb-4 shrink-0">
              {(selectedElement.type === "html"
                ? (["content", "advanced"] as const)
                : (["content", "style", "advanced"] as const)
              ).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSidebarTab(tab)}
                  className={cn(
                    "flex-1 py-1 text-xs font-semibold rounded-md transition-all capitalize",
                    sidebarTab === tab ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Element Panels Content */}
            <div className="flex-1 overflow-y-auto pr-1">
              {sidebarTab === "content" && (
                <>
                  {/* Heading Edit Panel */}
                  {selectedElement.type === "heading" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Heading Title</label>
                        <textarea
                          value={selectedElement.content}
                          onChange={(e) => handleHeadingTextChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200 min-h-[80px]"
                          placeholder="Add Your Heading Text Here"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Link URL</label>
                        <input
                          type="text"
                          value={selectedElement.link || ""}
                          onChange={(e) => handleHeadingLinkChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200"
                          placeholder="Type or paste your URL"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">HTML Tag Level</label>
                        <select
                          value={selectedElement.tag}
                          onChange={(e) => handleHeadingLevelChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white"
                        >
                          <option value="H1">H1</option>
                          <option value="H2">H2</option>
                          <option value="H3">H3</option>
                          <option value="H4">H4</option>
                          <option value="H5">H5</option>
                          <option value="H6">H6</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Text Editor Edit Panel */}
                  {selectedElement.type === "text" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center mb-1 shrink-0">
                        <button 
                          type="button"
                          onClick={() => sidebarImageInputRef.current?.click()}
                          className="px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold rounded-lg flex items-center gap-1 text-gray-700"
                        >
                          🖼 Add Media
                        </button>
                        <input
                          ref={sidebarImageInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageFile(e.target.files?.[0])}
                        />
                        <div className="flex bg-gray-100 rounded-lg p-0.5 text-[10px] font-semibold text-gray-500">
                          <span className="bg-white px-2 py-0.5 rounded shadow-sm">Visual</span>
                          <span className="px-2 py-0.5 cursor-pointer" onClick={toggleHtmlMode}>Code</span>
                        </div>
                      </div>
                      <div>
                        <textarea
                          value={selectedElement.content}
                          onChange={(e) => handleTextContentChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200 min-h-[180px] font-sans leading-relaxed"
                          placeholder="Lorem ipsum dolor sit amet..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Edit Panel */}
                  {selectedElement.type === "image" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Choose Image</label>
                        <div 
                          onClick={() => sidebarImageInputRef.current?.click()}
                          className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden shadow-inner group"
                        >
                          {selectedElement.src ? (
                            <img src={selectedElement.src} alt="Active" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <span className="text-2xl group-hover:scale-110 transition-transform">🖼</span>
                              <span className="text-[11px] font-medium text-gray-500">Click to upload media</span>
                            </>
                          )}
                        </div>
                        <input
                          ref={sidebarImageInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageFile(e.target.files?.[0])}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image Resolution</label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
                          <option>Large - 1024 x 1024</option>
                          <option>Medium - 300 x 300</option>
                          <option>Thumbnail - 150 x 150</option>
                          <option>Full Size - Original</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Caption</label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
                          <option>None</option>
                          <option>Attachment Caption</option>
                          <option>Custom Caption</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Link</label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
                          <option>None</option>
                          <option>Media File</option>
                          <option>Custom URL</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* HTML Edit Panel */}
                  {selectedElement.type === "html" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-semibold text-gray-600">HTML Code</label>
                          <span className="text-xs font-semibold text-violet-600 flex items-center gap-1 cursor-pointer hover:text-violet-800">
                            ✨ Edit with AI
                          </span>
                        </div>
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white text-sm font-mono min-h-[140px]">
                          <div className="bg-gray-50 border-r border-gray-200 px-2 py-2 text-gray-400 text-right select-none text-[11px] leading-relaxed shrink-0">
                            {selectedElement.content.split("\n").map((_, i) => (
                              <div key={i}>{i + 1}</div>
                            ))}
                          </div>
                          <textarea
                            value={selectedElement.content}
                            onChange={(e) => handleHtmlWidgetChange(e.target.value)}
                            className="w-full p-2 text-sm border-none focus:outline-none resize-y leading-relaxed font-mono min-h-[140px]"
                            placeholder="<p>Enter your HTML here</p>"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {sidebarTab === "style" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alignment</label>
                    <div className="flex gap-1">
                      {(["left", "center", "right", "justify"] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAlign(a)}
                          className={cn(
                            "flex-1 py-1.5 border text-xs font-semibold rounded-lg capitalize transition-all",
                            align === a ? "bg-violet-100 border-violet-400 text-violet-700 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={textColor} 
                        onChange={(e) => setTextColor(e.target.value)} 
                        className="w-8 h-8 rounded border border-gray-200 cursor-pointer overflow-hidden p-0"
                      />
                      <input 
                        type="text" 
                        value={textColor} 
                        onChange={(e) => setTextColor(e.target.value)} 
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {sidebarTab === "advanced" && (
                <div className="flex flex-col gap-4">
                  {/* Layout section title */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Layout</span>
                    
                    {/* Margin Control */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Margin (px)</label>
                      <div className="grid grid-cols-4 gap-1">
                        {Object.keys(margin).map((dir) => (
                          <div key={dir}>
                            <input
                              type="number"
                              value={margin[dir as keyof typeof margin]}
                              onChange={(e) => setMargin({ ...margin, [dir]: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-violet-400"
                            />
                            <span className="text-[9px] text-gray-400 block text-center capitalize">{dir}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Padding Control */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Padding (px)</label>
                      <div className="grid grid-cols-4 gap-1">
                        {Object.keys(padding).map((dir) => (
                          <div key={dir}>
                            <input
                              type="number"
                              value={padding[dir as keyof typeof padding]}
                              onChange={(e) => setPadding({ ...padding, [dir]: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-violet-400"
                            />
                            <span className="text-[9px] text-gray-400 block text-center capitalize">{dir}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Width Control */}
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Width</label>
                      <select className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none">
                        <option>Default</option>
                        <option>Full Width (100%)</option>
                        <option>Inline (Auto)</option>
                        <option>Custom</option>
                      </select>
                    </div>

                    {/* Align Self */}
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Align Self</label>
                      <div className="flex gap-1">
                        {["Start", "Center", "End", "Stretch"].map((a) => (
                          <button key={a} type="button" className="flex-1 py-1 border border-gray-200 rounded text-[10px] font-semibold text-gray-650 bg-white hover:bg-gray-50">{a}</button>
                        ))}
                      </div>
                      <span className="text-[9px] text-gray-400 block mt-1">This control will affect contained elements only.</span>
                    </div>

                    {/* Order */}
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Order</label>
                      <div className="flex gap-1">
                        {["Start", "End", "Custom"].map((o) => (
                          <button key={o} type="button" className="flex-1 py-1 border border-gray-200 rounded text-[10px] font-semibold text-gray-650 bg-white hover:bg-gray-50">{o}</button>
                        ))}
                      </div>
                      <span className="text-[9px] text-gray-400 block mt-1">This control will affect contained elements only.</span>
                    </div>

                    {/* Size */}
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Size</label>
                      <div className="flex gap-1">
                        {["Grow", "Shrink", "Set"].map((s) => (
                          <button key={s} type="button" className="flex-1 py-1 border border-gray-200 rounded text-[10px] font-semibold text-gray-650 bg-white hover:bg-gray-50">{s}</button>
                        ))}
                      </div>
                    </div>

                    {/* Position */}
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Position</label>
                      <select className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none">
                        <option>Default</option>
                        <option>Absolute</option>
                        <option>Fixed</option>
                      </select>
                    </div>

                    {/* Z-Index */}
                    <div className="mb-3 flex justify-between items-center gap-2">
                      <label className="text-xs font-semibold text-gray-600">Z-Index</label>
                      <input type="number" className="w-20 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none" placeholder="Auto" />
                    </div>

                    {/* CSS ID */}
                    <div className="mb-3 flex justify-between items-center gap-2">
                      <label className="text-xs font-semibold text-gray-600">CSS ID</label>
                      <input type="text" className="w-40 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none" placeholder="e.g. custom-id" />
                    </div>

                    {/* CSS Classes */}
                    <div className="mb-4 flex justify-between items-center gap-2">
                      <label className="text-xs font-semibold text-gray-600">CSS Classes</label>
                      <input type="text" className="w-40 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none" placeholder="e.g. class1 class2" />
                    </div>
                  </div>

                  {/* Collapsible Panel Headers matching screenshot */}
                  <div className="flex flex-col gap-1 border-t border-gray-200 pt-3">
                    {[
                      "UAIz - Display Conditions 🔒",
                      "UAIz - Parity Props 🔒",
                      "Motion Effects",
                      "Transform",
                      "Background",
                      "Border",
                      "Mask",
                      "Responsive",
                      "Attributes",
                      "Custom CSS"
                    ].map((h) => (
                      <div key={h} className="flex justify-between items-center py-2 px-1 hover:bg-gray-50 cursor-pointer text-xs font-bold text-gray-600 border-b border-gray-100">
                        <span>{h}</span>
                        <span>▾</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Default Toolbar/Elements view */
          <>
            {/* Tab Switches */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("format")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all",
                  activeTab === "format" ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
              >
                Format
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("widgets")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all",
                  activeTab === "widgets" ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
              >
                Widgets
              </button>
            </div>

            {activeTab === "format" ? (
              <div className="flex flex-col gap-2 shrink-0">
                <div className="grid grid-cols-4 gap-1 mb-2">
                  <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                    ↩
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                    ↪
                  </ToolbarButton>
                  <ToolbarButton onClick={toggleHtmlMode} active={isHtmlMode} title="Toggle HTML">
                    HTML
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setIsFullScreen(!isFullScreen)} active={isFullScreen} title="Toggle Fullscreen">
                    {isFullScreen ? "🗖" : "⛶"}
                  </ToolbarButton>
                </div>

                <ToolbarDivider />

                {!isHtmlMode && (
                  <>
                    {/* Typography Heading Grid (Includes P & H1 to H6) */}
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Typography</span>
                      <div className="grid grid-cols-4 gap-1.5 mb-3">
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().setParagraph().run()}
                          className={cn(
                            "py-1.5 px-2 border rounded-lg text-xs font-semibold text-center transition-all",
                            editor.isActive("paragraph") ? "bg-violet-100 border-violet-400 text-violet-700 shadow-sm" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                          )}
                          title="Paragraph"
                        >
                          P
                        </button>
                        {[1, 2, 3, 4, 5, 6].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => editor.chain().focus().toggleHeading({ level: lvl as any }).run()}
                            className={cn(
                              "py-1.5 px-2 border rounded-lg text-xs font-semibold text-center transition-all",
                              editor.isActive("heading", { level: lvl }) ? "bg-violet-100 border-violet-400 text-violet-700 shadow-sm" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                            )}
                            title={`Heading ${lvl}`}
                          >
                            H{lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <ToolbarDivider />

                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Basic Formatting</span>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
                        <strong>B</strong> Bold
                      </ToolbarButton>
                      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
                        <em>I</em> Italic
                      </ToolbarButton>
                      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
                        <span style={{ textDecoration: "underline" }}>U</span> Underline
                      </ToolbarButton>
                      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
                        <s>S</s> Strike
                      </ToolbarButton>
                    </div>

                    <ToolbarDivider />

                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Blocks</span>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
                        • List
                      </ToolbarButton>
                      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
                        1. List
                      </ToolbarButton>
                    </div>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
                      ❝ Quote
                    </ToolbarButton>

                    <ToolbarDivider />

                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tables</span>
                    <TableDropdown editor={editor} />

                    <ToolbarDivider />

                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Custom Blocks</span>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <ToolbarButton
                        onClick={() => (editor.chain().focus() as any).insertCalloutBox().run()}
                        active={editor.isActive("calloutBox")}
                        title="Insert Callout Box"
                      >
                        ❝ Callout
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => (editor.chain().focus() as any).insertCtaBox().run()}
                        active={editor.isActive("ctaBox")}
                        title="Insert CTA Box"
                      >
                        🚀 CTA Box
                      </ToolbarButton>
                    </div>

                    <ToolbarDivider />

                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Hyperlinks</span>
                    <ToolbarButton onClick={openLinkEditor} active={editor.isActive("link")} title="Add / Edit Link">
                      🔗 Link
                    </ToolbarButton>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} title="Remove Link">
                        Unlink
                      </ToolbarButton>
                      <ToolbarButton onClick={scanLinks} active={false} title="Scan All Links">
                        🔍 Scan
                      </ToolbarButton>
                    </div>

                    <ToolbarDivider />

                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Media & Rules</span>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <ToolbarButton onClick={() => imageInputRef.current?.click()} active={false} disabled={uploadingImg} title="Upload image">
                        🖼 Upload
                      </ToolbarButton>
                      <ToolbarButton onClick={addImageByUrl} active={false} title="Image by URL">
                        🔗 URL
                      </ToolbarButton>
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageFile(e.target.files?.[0])}
                    />
                    <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule">
                      ─ Horizontal Rule
                    </ToolbarButton>
                  </>
                )}
              </div>
            ) : (
              /* Widgets element list matching Elementor panels */
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={widgetSearchQuery}
                  onChange={(e) => setWidgetSearchQuery(e.target.value)}
                  placeholder="Search widgets..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
                
                {/* Category: Layout */}
                {filteredWidgets.some(w => w.category === 'layout') && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Layout</span>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredWidgets.filter(w => w.category === 'layout').map(w => (
                        <button
                          key={w.name}
                          type="button"
                          onClick={() => insertWidgetHtml(w.template)}
                          className="p-3 border border-gray-200 rounded-xl bg-white hover:border-violet-400 hover:text-violet-600 transition-all flex flex-col items-center justify-center gap-1.5 text-center shadow-sm"
                        >
                          <span className="text-xl">{w.icon}</span>
                          <span className="text-xs font-semibold text-gray-700">{w.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category: Basic */}
                {filteredWidgets.some(w => w.category === 'basic') && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Basic Elements</span>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredWidgets.filter(w => w.category === 'basic').map(w => (
                        <button
                          key={w.name}
                          type="button"
                          onClick={() => insertWidgetHtml(w.template)}
                          className="p-3 border border-gray-200 rounded-xl bg-white hover:border-violet-400 hover:text-violet-600 transition-all flex flex-col items-center justify-center gap-1.5 text-center shadow-sm"
                        >
                          <span className="text-xl">{w.icon}</span>
                          <span className="text-xs font-semibold text-gray-700">{w.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category: General */}
                {filteredWidgets.some(w => w.category === 'general') && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">General & Coding</span>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredWidgets.filter(w => w.category === 'general').map(w => (
                        <button
                          key={w.name}
                          type="button"
                          onClick={() => insertWidgetHtml(w.template)}
                          className="p-3 border border-gray-200 rounded-xl bg-white hover:border-violet-400 hover:text-violet-600 transition-all flex flex-col items-center justify-center gap-1.5 text-center shadow-sm"
                        >
                          <span className="text-xl">{w.icon}</span>
                          <span className="text-xs font-semibold text-gray-700">{w.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Editor Content & Split preview area */}
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden relative">
        {/* Fullscreen indicator button */}
        {isFullScreen && (
          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className="absolute top-3 right-3 z-[100] px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1"
          >
            🗖 Collapse Fullscreen
          </button>
        )}

        {/* Link editor popover with live check */}
        {linkOpen && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid #F3F4F6", background: "#fff" }}>
            <input
              autoFocus
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } if (e.key === "Escape") setLinkOpen(false); }}
              placeholder="https://example.com/page"
              style={{ flex: "1 1 240px", minWidth: 200, padding: "7px 10px", borderRadius: 8, border: "1px solid #E9E5F3", fontSize: 14, outline: "none" }}
            />
            <CheckBadge r={linkCheck} checking={checking} />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
              style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#7C3AED", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Apply
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); setLinkOpen(false); }}
              style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #E9E5F3", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        )}

        {/* Scan-all-links results */}
        {scanOpen && (
          <div style={{ padding: "12px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFC", maxHeight: 220, overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", marginBottom: 8 }}>
              <strong style={{ fontSize: 13, color: "#374151" }}>
                Link check {scanning ? "(running…)" : "results"} — {scanResults.length} link{scanResults.length !== 1 ? "s" : ""}
                {!scanning && (() => { const bad = scanResults.filter((s) => s.result.status === "broken" || s.result.status === "error").length; return bad ? <span style={{ color: "#B91C1C" }}> · {bad} broken</span> : <span style={{ color: "#15803D" }}> · all OK</span>; })()}
              </strong>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setScanOpen(false); }} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#6B7280", fontSize: 14 }}>✕</button>
            </div>
            {scanResults.length === 0 && <p style={{ fontSize: 13, color: "#6B7280" }}>No external links found in this post.</p>}
            {scanResults.map((s, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid #F0EDF7" }}>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1F2937", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    "{s.text}"
                  </span>
                  <span style={{ fontSize: 11, color: "#6B7280", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {s.url}
                  </span>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <CheckBadge r={s.result} checking={s.result.status === "checking"} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content area switch (Split screen in HTML Mode, full-width in Visual) */}
        {isHtmlMode ? (
          <div className="flex flex-col lg:flex-row h-full min-h-[500px] overflow-hidden">
            {/* HTML Code Editor (Left 50%) */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-[#F3F4F6] overflow-hidden">
              <div className="bg-[#FAFAFC] border-b border-[#F3F4F6] px-4 py-2 text-xs font-semibold text-gray-500 flex justify-between items-center shrink-0">
                <span>HTML Code Editor</span>
                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Supports custom CSS & style tags</span>
              </div>
              <textarea
                ref={codeTextareaRef}
                value={htmlContent}
                onChange={(e) => handleHtmlChange(e.target.value)}
                style={{
                  width: "100%",
                  fontFamily: "Consolas, Monaco, Fira Code, Source Code Pro, monospace",
                  fontSize: "14px",
                  padding: "16px 20px",
                  border: "none",
                  outline: "none",
                  background: "#1E1E24",
                  color: "#A7F3D0",
                  resize: "none",
                  lineHeight: "1.6",
                  overflowY: "auto",
                  flexGrow: 1,
                }}
                placeholder="Write or edit raw HTML content here..."
              />
              <div className="p-3 bg-amber-50 text-[11px] text-amber-700 border-t border-amber-200 shrink-0">
                ⚠️ Warning: Toggling back to Visual mode will drop custom style elements. Save directly in HTML mode to keep advanced styling.
              </div>
            </div>

            {/* Live Visual Preview (Right 50%) */}
            <div className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden">
              <div className="bg-[#FAFAFC] border-b border-[#F3F4F6] px-4 py-2 text-xs font-semibold text-gray-500 flex justify-between items-center shrink-0">
                <span>Real-time Live Preview</span>
                <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">Visual Render</span>
              </div>
              <div 
                className="flex-1 p-6 overflow-y-auto bg-white custom-scrollbar wp-post-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        ) : (
          <div 
            style={{ 
              padding: "20px 24px",
              overflowY: "auto"
            }}
            className="custom-scrollbar flex-1"
          >
            <style>{`
              .tiptap-editor-content .ProseMirror {
                min-height: 450px;
                outline: none;
              }
              .tiptap-editor-content h1 { font-size: 28px; font-weight: 800; color: #1F2937; margin: 32px 0 12px; line-height: 1.3; }
              .tiptap-editor-content h2 { font-size: 22px; font-weight: 700; color: #1F2937; margin: 28px 0 10px; line-height: 1.3; }
              .tiptap-editor-content h3 { font-size: 18px; font-weight: 700; color: #1F2937; margin: 22px 0 8px; }
              .tiptap-editor-content h4 { font-size: 16px; font-weight: 700; color: #1F2937; margin: 18px 0 6px; }
              .tiptap-editor-content h5 { font-size: 14.5px; font-weight: 700; color: #1F2937; margin: 14px 0 6px; }
              .tiptap-editor-content h6 { font-size: 13px; font-weight: 700; color: #1F2937; margin: 12px 0 6px; }
              .tiptap-editor-content p { color: #4B5563; font-size: 15px; line-height: 1.8; margin: 0 0 14px; }
              .tiptap-editor-content ul, .tiptap-editor-content ol { padding-left: 22px; margin: 0 0 14px; }
              .tiptap-editor-content li { color: #4B5563; font-size: 15px; line-height: 1.75; margin-bottom: 6px; }
              .tiptap-editor-content blockquote { border-left: 4px solid #7C3AED; margin: 24px 0; padding: 14px 20px; background: #F3E8FF; border-radius: 0 10px 10px 0; font-style: italic; color: #374151; }
              .tiptap-editor-content a { color: #7C3AED; text-decoration: underline; }
              .tiptap-editor-content img { max-width: 100%; border-radius: 10px; margin: 20px 0; display: block; }
              .tiptap-editor-content hr { border: none; border-top: 2px solid #E9E5F3; margin: 24px 0; }
              .tiptap-editor-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9CA3AF; float: left; height: 0; pointer-events: none; font-style: italic; }

              /* Custom Element highlight outlines in editor preview */
              .tiptap-editor-content .selected-widget-outline {
                outline: 2px solid #d946ef !important;
                outline-offset: 4px;
                border-radius: 4px;
              }

              /* Callout Box */
              .tiptap-editor-content .rte-callout-box {
                border-left: 4px solid #7C3AED;
                background: #F8F5FF;
                padding: 14px 20px;
                border-radius: 0 10px 10px 0;
                margin: 24px 0;
                font-size: 15px;
                color: #374151;
                font-weight: 400;
                line-height: 1.7;
              }
              .tiptap-editor-content .rte-callout-box p {
                margin: 0;
                color: inherit;
                font-size: inherit;
                line-height: inherit;
              }
              .tiptap-editor-content .rte-callout-box p:not(:last-child) {
                margin-bottom: 8px;
              }
              .tiptap-editor-content .rte-callout-box strong { font-style: italic; font-weight: 700; }

              /* CTA Box */
              .tiptap-editor-content .rte-cta-box {
                background: linear-gradient(135deg, #7c3aed, #d946ef);
                padding: 30px;
                border-radius: 24px;
                color: #fff;
                border: 2px solid #000;
                box-shadow: 0 15px 40px rgba(124, 58, 237, 0.25);
                margin: 28px 0;
              }
              .tiptap-editor-content .rte-cta-box p,
              .tiptap-editor-content .rte-cta-box strong {
                color: #fff !important;
              }
              .tiptap-editor-content .rte-cta-box p {
                font-size: 15px;
                margin: 0 0 8px;
                line-height: 1.6;
              }
              .tiptap-editor-content .rte-cta-box p:first-child {
                font-size: 17px;
                font-weight: 600;
                margin-bottom: 6px;
              }
              .tiptap-editor-content .rte-cta-box p:last-child { margin-bottom: 0; }
              .tiptap-editor-content .rte-cta-box a,
              .tiptap-editor-content .rte-cta-box a strong {
                color: #fff !important;
                text-decoration: none !important;
                transition: all 0.3s ease;
                border-bottom: 2px solid transparent;
                font-weight: 700;
              }
              .tiptap-editor-content .rte-cta-box a:hover,
              .tiptap-editor-content .rte-cta-box a:hover * {
                color: #ffeb3b !important;
                border-bottom-color: #ffeb3b;
                text-shadow: none;
              }

              /* Table styles */
              .tiptap-editor-content table { border-collapse: collapse; width: 100%; margin: 20px 0; border-radius: 8px; overflow: hidden; }
              .tiptap-editor-content table td, .tiptap-editor-content table th { border: 1px solid #E9E5F3; padding: 10px 14px; font-size: 14px; min-width: 80px; vertical-align: top; }
              .tiptap-editor-content table th { background: #F3E8FF; color: #7C3AED; font-weight: 700; }
              .tiptap-editor-content table tr:nth-child(even) td { background: #FAFAFC; }
              .tiptap-editor-content .selectedCell { background: #EDE9FE !important; }
            `}</style>
            <EditorContent editor={editor} />
          </div>
        )}

        {/* Footer info bar */}
        <div
          style={{
            borderTop: "1px solid #F3F4F6",
            padding: "8px 16px",
            display: "flex",
            gap: "16px",
            color: "#9CA3AF",
            fontSize: "12px",
            background: "#FAFAFC",
            zIndex: 10,
          }}
          className="shrink-0"
        >
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
