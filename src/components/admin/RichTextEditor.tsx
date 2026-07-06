import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useCallback, useEffect, useRef, useState } from "react";
import { checkLink, extractLinks, type LinkCheckResult } from "@/lib/checkLink";
import { uploadBlogImage } from "@/lib/uploadImage";
import { sanitizeHtml } from "@/lib/htmlSanitizer";
import {
  Bold as BoldIcon, Italic as ItalicIcon, Strikethrough as StrikeIcon, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote, Image as ImageIcon,
  Link as LinkIcon, Link2Off, Eye, Globe, RotateCcw, RotateCw, Minus,
  ChevronDown, FileText
} from "lucide-react";

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

// Extend Link extension to support custom attributes title and aria-label
const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      title: {
        default: null,
      },
      "aria-label": {
        default: null,
      },
    };
  },
});

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your blog post..." }: RichTextEditorProps) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      CustomLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
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

  // ── Upgraded Link Tooltip state ─────────────────────────────────────────
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTargetBlank, setLinkTargetBlank] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkRelNoopener, setLinkRelNoopener] = useState(true);
  const [linkRelNofollow, setLinkRelNofollow] = useState(false);
  const [linkAriaLabel, setLinkAriaLabel] = useState("");
  const [linkCheck, setLinkCheck] = useState<LinkCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  // ── "Scan all links" panel ─────────────────────────────────────────────
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{ url: string; result: LinkCheckResult }[]>([]);

  const openLinkEditor = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes("link");
    setLinkUrl(attrs.href ?? "");
    setLinkTargetBlank(attrs.target === "_blank");
    setLinkTitle(attrs.title ?? "");
    const rel = attrs.rel ?? "";
    setLinkRelNoopener(rel.includes("noopener") || rel === "");
    setLinkRelNofollow(rel.includes("nofollow"));
    setLinkAriaLabel(attrs["aria-label"] ?? "");
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
    if (u === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      if (!/^https?:\/\//i.test(u) && !u.startsWith("/") && !u.startsWith("#") && !u.startsWith("mailto:") && !u.startsWith("tel:")) {
        window.alert("Please enter a valid URL (starting with http://, https://, or /)");
        return;
      }
      const rels = [];
      if (linkRelNoopener) rels.push("noopener");
      if (linkRelNofollow) rels.push("nofollow");

      editor.chain().focus().extendMarkRange("link").setLink({
        href: u,
        target: linkTargetBlank ? "_blank" : null,
        rel: rels.length > 0 ? rels.join(" ") : null,
        title: linkTitle.trim() || null,
        "aria-label": linkAriaLabel.trim() || null,
      } as any).run();
    }
    setLinkOpen(false);
  }, [editor, linkUrl, linkTargetBlank, linkRelNoopener, linkRelNofollow, linkTitle, linkAriaLabel]);

  const scanLinks = useCallback(async () => {
    if (!editor) return;
    const urls = extractLinks(editor.getHTML());
    setScanOpen(true);
    setScanResults(urls.map((url) => ({ url, result: { status: "checking", httpCode: 0 } })));
    setScanning(true);
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

  // Custom blocks injectors
  const insertButtonBlock = () => {
    if (!editor) return;
    const label = window.prompt("Enter Button Text:", "Click Here");
    if (!label) return;
    const url = window.prompt("Enter Link URL:", "https://");
    if (!url) return;
    editor.chain().focus().insertContent(
      `<a href="${url}" class="tiptap-btn" style="display:inline-block; padding:10px 22px; background:#7c3aed; color:#ffffff; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px; box-shadow:0 4px 12px rgba(124,58,237,0.25); margin:12px 0;">${label}</a>`
    ).run();
  };

  const insertCalloutBlock = () => {
    if (!editor) return;
    editor.chain().focus().insertContent(
      '<div class="wp-post-callout" style="padding:16px 20px; border-left:4px solid #7c3aed; background:#faf8ff; border-radius:0 8px 8px 0; margin:20px 0;"><p style="margin:0; font-weight:700; color:#1f2937;">💡 Callout</p><p style="margin:4px 0 0; color:#4b5563;">Add callout text here...</p></div>'
    ).run();
  };

  const insertSpoilerBlock = () => {
    if (!editor) return;
    editor.chain().focus().insertContent(
      '<span class="wp-post-spoiler" style="background:#1f2937; color:#1f2937; cursor:pointer; padding:2px 6px; border-radius:4px; font-weight:500;" onclick="this.style.color=\'#ffffff\'; this.style.background=\'#4b5563\'">Spoiler: Click to reveal</span>'
    ).run();
  };

  const insertVideoBlock = () => {
    if (!editor) return;
    const url = window.prompt("Enter YouTube Embed URL or Video URL:");
    if (!url) return;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("embed") ? url.split("/").pop()?.split("?")[0] : url.split("v=")[1]?.split("&")[0];
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      editor.chain().focus().insertContent(
        `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; margin:20px 0; border-radius:12px;"><iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe></div>`
      ).run();
    } else {
      editor.chain().focus().insertContent(
        `<video src="${url}" controls style="max-width:100%; border-radius:12px; margin:20px 0; display:block;"></video>`
      ).run();
    }
  };

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
          gap: "6px",
          padding: "12px",
          borderBottom: "1px solid #F3F4F6",
          background: "#FAFAFC",
          alignItems: "center",
        }}
      >
        {/* Undo/Redo & HTML Source Code Toggle */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <RotateCcw className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <RotateCw className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={toggleHtmlMode} active={isHtmlMode} title="Toggle Source HTML Editor">
          <FileText className="h-3.5 w-3.5 text-violet-600 mr-0.5" /> HTML
        </ToolbarButton>

        <div style={{ width: "1px", height: "20px", background: "#E9E5F3", margin: "0 4px" }} />

        {!isHtmlMode && (
          <>
            {/* Heading Level Dropdown selector */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "p") {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
                  }
                  e.target.value = "";
                }}
                defaultValue=""
                style={{
                  padding: "5px 24px 5px 8px",
                  borderRadius: "6px",
                  border: "1px solid #E9E5F3",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
              >
                <option value="" disabled>Format Text</option>
                <option value="p">Paragraph</option>
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
                <option value="4">Heading 4</option>
                <option value="5">Heading 5</option>
                <option value="6">Heading 6</option>
              </select>
              <ChevronDown className="h-3 w-3 absolute right-2 text-muted-foreground pointer-events-none" />
            </div>

            {/* Standard Marks */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
              <BoldIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
              <ItalicIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
              <UnderlineIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
              <StrikeIcon className="h-3.5 w-3.5" />
            </ToolbarButton>

            {/* Highlight (BG Color) Selector */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "reset") {
                    editor.chain().focus().unsetHighlight().run();
                  } else {
                    editor.chain().focus().toggleHighlight({ color: val }).run();
                  }
                  e.target.value = "";
                }}
                defaultValue=""
                style={{
                  padding: "5px 20px 5px 8px",
                  borderRadius: "6px",
                  border: "1px solid #E9E5F3",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
                title="Highlight Background Color"
              >
                <option value="" disabled>💡 BG Color</option>
                <option value="#fef08a">Yellow</option>
                <option value="#bbf7d0">Green</option>
                <option value="#fecaca">Red</option>
                <option value="#e9d5ff">Purple</option>
                <option value="reset">None / Clear</option>
              </select>
              <ChevronDown className="h-3 w-3 absolute right-1.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Text Color Selector */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "reset") {
                    editor.chain().focus().unsetColor().run();
                  } else {
                    editor.chain().focus().setColor(val).run();
                  }
                  e.target.value = "";
                }}
                defaultValue=""
                style={{
                  padding: "5px 20px 5px 8px",
                  borderRadius: "6px",
                  border: "1px solid #E9E5F3",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
                title="Text Color"
              >
                <option value="" disabled>🎨 Text Color</option>
                <option value="#7C3AED">Brand Purple</option>
                <option value="#2563EB">Blue</option>
                <option value="#16A34A">Green</option>
                <option value="#DC2626">Red</option>
                <option value="#4B5563">Gray</option>
                <option value="#1F2937">Dark</option>
                <option value="reset">Clear</option>
              </select>
              <ChevronDown className="h-3 w-3 absolute right-1.5 text-muted-foreground pointer-events-none" />
            </div>

            <div style={{ width: "1px", height: "20px", background: "#E9E5F3", margin: "0 4px" }} />

            {/* Alignments */}
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
              <AlignLeft className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
              <AlignCenter className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
              <AlignRight className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Align Justify">
              <AlignJustify className="h-3.5 w-3.5" />
            </ToolbarButton>

            <div style={{ width: "1px", height: "20px", background: "#E9E5F3", margin: "0 4px" }} />

            {/* Lists & Quote */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
              <List className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
              <ListOrdered className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Checklist (Task list)">
              <CheckSquare className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
              <Quote className="h-3.5 w-3.5" />
            </ToolbarButton>

            <div style={{ width: "1px", height: "20px", background: "#E9E5F3", margin: "0 4px" }} />

            {/* Link Popover Tooltip */}
            <ToolbarButton onClick={openLinkEditor} active={editor.isActive("link")} title="Add / edit custom link">
              <LinkIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} title="Remove Link">
              <Link2Off className="h-3.5 w-3.5" />
            </ToolbarButton>

            {/* Script */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript">
              x<sub>2</sub>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript">
              x<sup>2</sup>
            </ToolbarButton>

            <div style={{ width: "1px", height: "20px", background: "#E9E5F3", margin: "0 4px" }} />

            {/* Table Dropdown selector */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "insert") editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  if (val === "addRow") editor.chain().focus().addRowAfter().run();
                  if (val === "addCol") editor.chain().focus().addColumnAfter().run();
                  if (val === "delRow") editor.chain().focus().deleteRow().run();
                  if (val === "delCol") editor.chain().focus().deleteColumn().run();
                  if (val === "delete") editor.chain().focus().deleteTable().run();
                  e.target.value = "";
                }}
                defaultValue=""
                style={{
                  padding: "5px 20px 5px 8px",
                  borderRadius: "6px",
                  border: "1px solid #E9E5F3",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
                title="Table actions"
              >
                <option value="" disabled>📋 Table</option>
                <option value="insert">Insert Table</option>
                <option value="addRow">Add Row After</option>
                <option value="addCol">Add Col After</option>
                <option value="delRow">Delete Row</option>
                <option value="delCol">Delete Col</option>
                <option value="delete">Delete Table</option>
              </select>
              <ChevronDown className="h-3 w-3 absolute right-1.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Custom Blocks Dropdown */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "btn") insertButtonBlock();
                  if (val === "callout") insertCalloutBlock();
                  if (val === "spoiler") insertSpoilerBlock();
                  if (val === "video") insertVideoBlock();
                  e.target.value = "";
                }}
                defaultValue=""
                style={{
                  padding: "5px 20px 5px 8px",
                  borderRadius: "6px",
                  border: "1px solid #E9E5F3",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
                title="Insert rich widgets"
              >
                <option value="" disabled>➕ Insert Special</option>
                <option value="btn">Button</option>
                <option value="callout">Callout Box</option>
                <option value="spoiler">Spoiler text</option>
                <option value="video">Video / Embed</option>
              </select>
              <ChevronDown className="h-3 w-3 absolute right-1.5 text-muted-foreground pointer-events-none" />
            </div>

            <div style={{ width: "1px", height: "20px", background: "#E9E5F3", margin: "0 4px" }} />

            {/* Media Upload & Scan links */}
            <ToolbarButton onClick={() => imageInputRef.current?.click()} active={false} disabled={uploadingImg} title="Upload image from computer">
              <ImageIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={addImageByUrl} active={false} title="Insert image by URL">
              URL Image
            </ToolbarButton>
            <ToolbarButton onClick={scanLinks} active={false} title="Scan all links in this post for 404/errors">
              Scan links
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider Line (Horizontal Rule)">
              <Minus className="h-3.5 w-3.5" />
            </ToolbarButton>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageFile(e.target.files?.[0])}
            />
          </>
        )}
      </div>

      {/* Upgraded Link modal tooltip */}
      {linkOpen && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", background: "#fff", display: "grid", gap: "10px", gridTemplateColumns: "1fr" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: "1", minWidth: "220px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#4B5563" }}>Link URL *</label>
              <input
                autoFocus
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com or /services/ai-strategy"
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E9E5F3", fontSize: "13.5px", outline: "none" }}
              />
            </div>
            <div style={{ width: "200px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#4B5563" }}>Link Title (Tooltip)</label>
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="e.g. Visit ConverseAI"
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E9E5F3", fontSize: "13.5px", outline: "none" }}
              />
            </div>
            <div style={{ width: "200px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#4B5563" }}>Accessibility Aria-Label</label>
              <input
                type="text"
                value={linkAriaLabel}
                onChange={(e) => setLinkAriaLabel(e.target.value)}
                placeholder="e.g. Read about AI Strategy Services"
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E9E5F3", fontSize: "13.5px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", background: "#FAF9FE", padding: "10px 14px", borderRadius: "8px" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" checked={linkTargetBlank} onChange={(e) => setLinkTargetBlank(e.target.checked)} style={{ accentColor: "#7c3aed" }} />
              Open in new tab (target="_blank")
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" checked={linkRelNoopener} onChange={(e) => setLinkRelNoopener(e.target.checked)} style={{ accentColor: "#7c3aed" }} />
              Noopener (rel="noopener")
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" checked={linkRelNofollow} onChange={(e) => setLinkRelNofollow(e.target.checked)} style={{ accentColor: "#7c3aed" }} />
              No-follow (rel="nofollow")
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", alignItems: "center", marginTop: "4px" }}>
            <CheckBadge r={linkCheck} checking={checking} />
            <button type="button" onClick={applyLink} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#7C3AED", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
              Save Link
            </button>
            <button type="button" onClick={() => setLinkOpen(false)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #E9E5F3", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
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

      {/* Editor Content or HTML Textarea */}
      {isHtmlMode ? (
        <div style={{ position: "relative" }}>
          <textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            style={{
              width: "100%",
              minHeight: "450px",
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
            }}
            placeholder="Write or edit raw HTML content here..."
          />
        </div>
      ) : (
        <div style={{ padding: "20px 24px" }}>
          <style>{`
            .tiptap-editor-content h1 { font-size: 28px; font-weight: 800; color: #1F2937; margin: 32px 0 14px; line-height: 1.25; }
            .tiptap-editor-content h2 { font-size: 22px; font-weight: 700; color: #1F2937; margin: 28px 0 10px; line-height: 1.3; }
            .tiptap-editor-content h3 { font-size: 18px; font-weight: 700; color: #1F2937; margin: 22px 0 8px; }
            .tiptap-editor-content h4 { font-size: 16px; font-weight: 700; color: #1F2937; margin: 18px 0 6px; }
            .tiptap-editor-content h5 { font-size: 14px; font-weight: 700; color: #1F2937; margin: 16px 0 6px; }
            .tiptap-editor-content h6 { font-size: 13px; font-weight: 700; color: #1F2937; margin: 14px 0 6px; }
            .tiptap-editor-content p { color: #4B5563; font-size: 15px; line-height: 1.8; margin: 0 0 14px; }
            .tiptap-editor-content ul, .tiptap-editor-content ol { padding-left: 22px; margin: 0 0 14px; }
            .tiptap-editor-content li { color: #4B5563; font-size: 15px; line-height: 1.75; margin-bottom: 6px; }
            
            /* Task/Checklist formatting */
            .tiptap-editor-content ul[data-type="taskList"] { list-style: none; padding-left: 0; }
            .tiptap-editor-content li[data-type="taskItem"] { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
            .tiptap-editor-content li[data-type="taskItem"] input[type="checkbox"] { margin-top: 5px; accent-color: #7C3AED; }
            .tiptap-editor-content li[data-type="taskItem"] .task-content { flex: 1; }

            .tiptap-editor-content blockquote { border-left: 4px solid #7C3AED; margin: 24px 0; padding: 14px 20px; background: #F3E8FF; border-radius: 0 10px 10px 0; font-style: italic; color: #374151; }
            .tiptap-editor-content a { color: #7C3AED; text-decoration: underline; }
            .tiptap-editor-content img { max-width: 100%; border-radius: 10px; margin: 20px 0; display: block; }
            .tiptap-editor-content hr { border: none; border-top: 2px solid #E9E5F3; margin: 24px 0; }
            .tiptap-editor-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9CA3AF; float: left; height: 0; pointer-events: none; font-style: italic; }
            
            /* Tables */
            .tiptap-editor-content table { border-collapse: collapse; margin: 24px 0; width: 100%; table-layout: fixed; }
            .tiptap-editor-content th, .tiptap-editor-content td { border: 1px solid #E9E5F3; padding: 8px 12px; text-align: left; min-width: 50px; vertical-align: top; }
            .tiptap-editor-content th { background: #FAFAFC; font-weight: 700; }
            .tiptap-editor-content pre { background: #1f2937; color: #f3f4f6; padding: 14px 18px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
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
  );
};

export default RichTextEditor;
