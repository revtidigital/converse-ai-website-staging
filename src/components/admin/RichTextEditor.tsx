import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useCallback, useEffect, useState } from "react";
import { checkLink, extractLinks, type LinkCheckResult } from "@/lib/checkLink";

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
    style={{
      padding: "5px 9px",
      borderRadius: "6px",
      border: "1px solid",
      borderColor: active ? "#7C3AED" : "#E9E5F3",
      background: active ? "#F3E8FF" : "#fff",
      color: active ? "#7C3AED" : "#374151",
      fontSize: "13px",
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      lineHeight: 1,
      display: "inline-flex",
      alignItems: "center",
      gap: "3px",
      transition: "all 0.15s",
    }}
  >
    {children}
  </button>
);

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your blog post..." }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor-content",
        style: "min-height:400px; outline:none; font-family: Inter, sans-serif;",
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
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
  const [scanResults, setScanResults] = useState<{ url: string; result: LinkCheckResult }[]>([]);

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
    const urls = extractLinks(editor.getHTML());
    setScanOpen(true);
    setScanResults(urls.map((url) => ({ url, result: { status: "checking", httpCode: 0 } })));
    setScanning(true);
    // check with limited concurrency
    const out: { url: string; result: LinkCheckResult }[] = [];
    const queue = [...urls];
    async function worker() {
      while (queue.length) {
        const url = queue.shift()!;
        const result = await checkLink(url);
        out.push({ url, result });
        setScanResults((prev) => prev.map((p) => (p.url === url ? { url, result } : p)));
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    setScanning(false);
  }, [editor]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div
      style={{
        border: "1px solid #E9E5F3",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(124,58,237,0.04)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          padding: "10px 12px",
          borderBottom: "1px solid #F3F4F6",
          background: "#FAFAFC",
        }}
      >
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <s>S</s>
        </ToolbarButton>
        <div style={{ width: "1px", background: "#E9E5F3", margin: "0 4px" }} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          H3
        </ToolbarButton>
        <div style={{ width: "1px", background: "#E9E5F3", margin: "0 4px" }} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
          1. List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          ❝ Quote
        </ToolbarButton>
        <div style={{ width: "1px", background: "#E9E5F3", margin: "0 4px" }} />
        <ToolbarButton onClick={openLinkEditor} active={editor.isActive("link")} title="Add / edit link (with live check)">
          🔗 Link
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} title="Remove Link">
          Unlink
        </ToolbarButton>
        <ToolbarButton onClick={scanLinks} active={false} title="Check all links in this post for 404/errors">
          🔍 Scan Links
        </ToolbarButton>
        <ToolbarButton onClick={addImage} active={false} title="Insert Image">
          🖼 Image
        </ToolbarButton>
        <div style={{ width: "1px", background: "#E9E5F3", margin: "0 4px" }} />
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule">
          ─ HR
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          ↩ Undo
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          ↪ Redo
        </ToolbarButton>
      </div>

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
          {scanResults.map((s) => (
            <div key={s.url} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderTop: "1px solid #F0EDF7" }}>
              <span style={{ flex: 1, fontSize: 12, color: "#4B5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.url}</span>
              <CheckBadge r={s.result} checking={s.result.status === "checking"} />
            </div>
          ))}
        </div>
      )}

      {/* Editor area */}
      <div style={{ padding: "20px 24px" }}>
        <style>{`
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
        `}</style>
        <EditorContent editor={editor} />
      </div>

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
  );
};

export default RichTextEditor;
