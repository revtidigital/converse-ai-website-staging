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
import { FileText, ChevronDown } from "lucide-react";
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

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your blog post..." }: RichTextEditorProps) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
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
    },
  });

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
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err: any) {
      window.alert("Image upload failed: " + (err?.message || "unknown error"));
    } finally {
      setUploadingImg(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }, [editor]);

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

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div className="flex flex-col md:flex-row border border-[#E9E5F3] rounded-xl overflow-visible bg-white shadow-sm">
      {/* Sticky Left Sidebar Toolbar (Horizontal topbar on mobile) */}
      <div 
        className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-[#F3F4F6] bg-[#FAFAFC] p-3 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto sticky z-40 h-[56px] md:h-auto max-h-[56px] md:max-h-[calc(100vh-140px)] rounded-t-xl md:rounded-t-none md:rounded-l-xl custom-scrollbar"
        style={{
          position: "sticky",
          top: "0px",
        }}
      >
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          ↩ Undo
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          ↪ Redo
        </ToolbarButton>
        <ToolbarButton onClick={toggleHtmlMode} active={isHtmlMode} title="Toggle Source HTML Editor">
          <FileText style={{ width: 14, height: 14, marginRight: 4, display: "inline-block", verticalAlign: "middle" }} /> HTML
        </ToolbarButton>

        <ToolbarDivider />

        {!isHtmlMode && (
          <>
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

            <ToolbarDivider />

            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
              H2 Heading
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
              H3 Heading
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
              • List
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
              1. List
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
              ❝ Quote
            </ToolbarButton>

            <ToolbarDivider />

            {/* Table dropdown */}
            <TableDropdown editor={editor} />

            {/* Callout Box */}
            <ToolbarButton
              onClick={() => (editor.chain().focus() as any).insertCalloutBox().run()}
              active={editor.isActive("calloutBox")}
              title="Insert Callout Box (highlighted summary)"
            >
              ❝ Callout Box
            </ToolbarButton>

            {/* CTA Box */}
            <ToolbarButton
              onClick={() => (editor.chain().focus() as any).insertCtaBox().run()}
              active={editor.isActive("ctaBox")}
              title="Insert CTA Box (purple gradient call-to-action)"
            >
              🚀 CTA Box
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton onClick={openLinkEditor} active={editor.isActive("link")} title="Add / edit link (with live check)">
              🔗 Link
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} title="Remove Link">
              Unlink
            </ToolbarButton>
            <ToolbarButton onClick={scanLinks} active={false} title="Check all links in this post for 404/errors">
              🔍 Scan Links
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton onClick={() => imageInputRef.current?.click()} active={false} disabled={uploadingImg} title="Upload image from computer">
              {uploadingImg ? "⏳ Uploading…" : "🖼 Upload Image"}
            </ToolbarButton>
            <ToolbarButton onClick={addImageByUrl} active={false} title="Insert image by URL">
              🔗 Image URL
            </ToolbarButton>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageFile(e.target.files?.[0])}
            />

            <ToolbarDivider />

            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule">
              ─ HR
            </ToolbarButton>
          </>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 min-w-0">

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
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

      {/* Editor Content or HTML Textarea */}
      {isHtmlMode ? (
        <div style={{ position: "relative" }}>
          <textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            style={{
              width: "100%",
              minHeight: "450px",
              maxHeight: "600px",
              fontFamily: "Consolas, Monaco, Fira Code, Source Code Pro, monospace",
              fontSize: "14px",
              padding: "16px 20px",
              border: "none",
              outline: "none",
              background: "#1E1E24",
              color: "#A7F3D0",
              borderRadius: "0 0 12px 12px",
              resize: "vertical",
              lineHeight: "1.6",
              overflowY: "auto",
            }}
            placeholder="Write or edit raw HTML content here..."
          />
        </div>
      ) : (
        <div 
          style={{ 
            padding: "20px 24px",
            maxHeight: "600px",
            overflowY: "auto"
          }}
          className="custom-scrollbar"
        >
          <style>{`
            .tiptap-editor-content .ProseMirror {
              min-height: 450px;
              outline: none;
            }
            .tiptap-editor-content h2 { font-size: 22px; font-weight: 700; color: #1F2937; margin: 28px 0 10px; line-height: 1.3; }
            .tiptap-editor-content h3 { font-size: 18px; font-weight: 700; color: #1F2937; margin: 22px 0 8px; }
            .tiptap-editor-content p { color: #4B5563; font-size: 15px; line-height: 1.8; margin: 0 0 14px; }
            .tiptap-editor-content ul, .tiptap-editor-content ol { padding-left: 22px; margin: 0 0 14px; }
            .tiptap-editor-content li { color: #4B5563; font-size: 15px; line-height: 1.75; margin-bottom: 6px; }
            .tiptap-editor-content blockquote { border-left: 4px solid #7C3AED; margin: 24px 0; padding: 14px 20px; background: #F3E8FF; border-radius: 0 10px 10px 0; font-style: italic; color: #374151; }
            .tiptap-editor-content a { color: #7C3AED; text-decoration: underline; }
            .tiptap-editor-content img { max-width: 100%; border-radius: 10px; margin: 20px 0; display: block; }
            .tiptap-editor-content hr { border: none; border-top: 2px solid #E9E5F3; margin: 24px 0; }
            .tiptap-editor-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9CA3AF; float: left; height: 0; pointer-events: none; font-style: italic; }

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

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #F3F4F6",
          padding: "8px 16px",
          display: "flex",
          gap: "16px",
          color: "#9CA3AF",
          fontSize: "12px",
          background: "#FAFAFC",
        }}
      >
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
