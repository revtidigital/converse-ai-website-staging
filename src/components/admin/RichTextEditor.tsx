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
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { checkLink, extractLinks, analyzeAnchorRules, type LinkCheckResult, type ExtractedLink, type AnchorRuleIssue } from "@/lib/checkLink";
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
  content: "block+",
  defining: true,
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

const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      title: {
        default: null,
        parseHTML: element => element.getAttribute("title"),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {};
          }
          return {
            title: attributes.title,
          };
        },
      },
    };
  },
});

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
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

export interface ScanState {
  sig: string;          // signature of the links present when scanned (url+text)
  brokenCount: number;  // links that are broken / empty
  anchorCount: number;  // SEO anchor-rule violations
}

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Reports the result after a Scan Links run so the page can gate publishing. */
  onScanState?: (state: ScanState) => void;
}

export interface RichTextEditorHandle {
  /** Opens the Link Checker modal and scans all links (URL health + SEO anchor rules). */
  scanLinks: () => void;
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
  const ref = useRef<HTMLDivElement>(null);
  
  const [customTableOpen, setCustomTableOpen] = useState(false);
  const [customRows, setCustomRows] = useState(3);
  const [customCols, setCustomCols] = useState(3);

  const runCmd = (fn: () => void) => {
    fn();
  };

  return (
    <div ref={ref} className="w-full flex flex-col gap-1 shrink-0">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        title="Table Actions"
        className={cn(
          "w-full py-2.5 px-4 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center justify-between cursor-pointer",
          open 
            ? "bg-violet-100 border-violet-300 text-violet-750" 
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        )}
      >
        <span className="flex items-center gap-2">
          ⊞ Table Actions
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="flex flex-col gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl mt-1 animate-fadeIn">
          {/* Group 1: Table */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2">Table Options</span>
            <div className="grid grid-cols-1 gap-1">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()); }}
                className="w-full text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Insert Table (3×3)
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setCustomTableOpen(true); }}
                className="w-full text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Insert Custom Table...
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().deleteTable().run()); }}
                className="w-full text-left py-1.5 px-3 hover:bg-red-50 hover:text-red-650 text-[11px] font-semibold text-red-500 rounded-lg transition-colors cursor-pointer"
              >
                Delete Table
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-gray-200" />

          {/* Group 2: Cell */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2">Cell Options</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().mergeCells().run()); }}
                className="text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Merge
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().splitCell().run()); }}
                className="text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Split
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().toggleHeaderCell().run()); }}
                className="col-span-2 text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Toggle Header Cell
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-gray-200" />

          {/* Group 3: Row */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2">Row Options</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().addRowBefore().run()); }}
                className="text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Add Above
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().addRowAfter().run()); }}
                className="text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Add Below
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().deleteRow().run()); }}
                className="text-left py-1.5 px-3 hover:bg-red-50 hover:text-red-650 text-[11px] font-semibold text-red-500 rounded-lg transition-colors cursor-pointer"
              >
                Delete Row
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().toggleHeaderRow().run()); }}
                className="text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Header Row
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-gray-200" />

          {/* Group 4: Column */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2">Column Options</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().addColumnBefore().run()); }}
                className="text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Add Left
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().addColumnAfter().run()); }}
                className="text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Add Right
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().deleteColumn().run()); }}
                className="text-left py-1.5 px-3 hover:bg-red-50 hover:text-red-650 text-[11px] font-semibold text-red-500 rounded-lg transition-colors cursor-pointer"
              >
                Delete Col
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCmd(() => editor.chain().focus().toggleHeaderColumn().run()); }}
                className="text-left py-1.5 px-3 hover:bg-violet-100 hover:text-violet-700 text-[11px] font-semibold text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Header Col
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Custom Table */}
      {customTableOpen && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-150 animate-in fade-in-50 zoom-in-95 duration-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              ⊞ Insert Custom Table
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Number of Rows</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customRows}
                  onChange={(e) => setCustomRows(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Number of Columns</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customCols}
                  onChange={(e) => setCustomCols(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setCustomTableOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customRows > 0 && customCols > 0) {
                    editor.chain().focus().insertTable({ rows: customRows, cols: customCols, withHeaderRow: true }).run();
                    setCustomTableOpen(false);
                    setOpen(false);
                  }
                }}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
              >
                Insert Table
              </button>
            </div>
          </div>
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

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({
  content,
  onChange,
  placeholder = "Start writing your blog post...",
  onScanState
}, ref) => {
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
    alt?: string;
    title?: string;
    link?: string;
    pos?: number;
  } | null>(null);
  
  const [sidebarTab, setSidebarTab] = useState<"content" | "style" | "advanced">("content");
  const [textEditorMode, setTextEditorMode] = useState<"visual" | "code">("visual");

  // Prevent page scroll when editor is in immersive fullscreen mode
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  const [imgResolutionMode, setImgResolutionMode] = useState("Large - 1024 × 572");
  const [customWidth, setCustomWidth] = useState("1024");
  const [customHeight, setCustomHeight] = useState("572");

  // Floating bubble menu states
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
  const [bubbleUrl, setBubbleUrl] = useState("");

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
      CustomImage.configure({ inline: false, allowBase64: true }),
      CustomLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
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
    onSelectionUpdate: ({ editor: e }) => {
      const { selection } = e.state;
      if (selection && (selection as any).node && (selection as any).node.type.name === "image") {
        const node = (selection as any).node;
        const pos = selection.from;
        
        // Remove outline class from all elements in editor
        if (e.view) {
          e.view.dom.querySelectorAll(".selected-widget-outline").forEach(el => {
            el.classList.remove("selected-widget-outline");
          });
        }

        setSelectedElement({
          id: "img-" + pos,
          type: "image",
          tag: "IMG",
          content: node.attrs.alt || "",
          src: node.attrs.src || "",
          alt: node.attrs.alt || "",
          title: node.attrs.title || node.attrs.alt || "",
          pos: pos,
        });
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

        let parentPos = pos;
        try {
          const domPos = view.posAtDOM(target, 0);
          if (domPos !== undefined && domPos !== null) {
            parentPos = domPos;
          } else {
            const $pos = view.state.doc.resolve(pos);
            parentPos = $pos.depth > 0 ? $pos.before($pos.depth) : pos;
          }
        } catch (err) {
          try {
            const $pos = view.state.doc.resolve(pos);
            parentPos = $pos.depth > 0 ? $pos.before($pos.depth) : pos;
          } catch (e) {
            parentPos = pos;
          }
        }

        if (htmlBlock) {
          htmlBlock.classList.add("selected-widget-outline");
          setSelectedElement({
            id: "html-" + parentPos,
            type: "html",
            tag: "DIV",
            content: htmlBlock.innerHTML,
            pos: parentPos,
          });
          setSidebarTab("content");
          return true;
        }

        if (img) {
          img.classList.add("selected-widget-outline");
          const w = img.getAttribute("width") || "";
          const h = img.getAttribute("height") || "";
          if (w && h) {
            setImgResolutionMode("Custom");
            setCustomWidth(w);
            setCustomHeight(h);
          } else {
            setImgResolutionMode("Full Size - Original");
          }
          setSelectedElement({
            id: "img-" + parentPos,
            type: "image",
            tag: "IMG",
            content: img.getAttribute("alt") || "",
            src: img.getAttribute("src") || "",
            alt: img.getAttribute("alt") || "",
            title: img.getAttribute("title") || img.getAttribute("alt") || "",
            link: img.parentElement?.tagName === "A" ? img.parentElement.getAttribute("href") || "" : "",
            pos: parentPos,
          });
          setSidebarTab("content");
          return true;
        }

        // Text and Heading inline editing directly (no sidebar widget select)

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
      console.warn("Storage upload failed, falling back to base64 encoding:", err);
      // Fallback: convert file to inline Base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          if (selectedElement && selectedElement.type === "image") {
            handleImageSrcChange(base64Url);
          } else {
            editor.chain().focus().setImage({ src: base64Url }).run();
          }
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImg(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (sidebarImageInputRef.current) sidebarImageInputRef.current.value = "";
    }
  }, [editor, selectedElement]);

  // ── Link popover with live URL checking ────────────────────────────────
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDisplayText, setLinkDisplayText] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkError, setLinkError] = useState("");
  const [hasManuallyEditedTitle, setHasManuallyEditedTitle] = useState(false);
  const [linkNewTab, setLinkNewTab] = useState(false);
  const [linkCheck, setLinkCheck] = useState<LinkCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  // Sync display text to title attribute automatically by default
  useEffect(() => {
    if (!hasManuallyEditedTitle) {
      setLinkTitle(linkDisplayText);
    }
  }, [linkDisplayText, hasManuallyEditedTitle]);

  // ── "Scan all links" panel ─────────────────────────────────────────────
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{ url: string; text: string; result: LinkCheckResult }[]>([]);
  const [anchorIssues, setAnchorIssues] = useState<AnchorRuleIssue[]>([]);

  const openLinkEditor = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes("link");
    setLinkUrl(attrs.href ?? "");
    setLinkNewTab(attrs.target === "_blank");
    setLinkCheck(null);
    setLinkError("");

    // Get display text (either current selection or existing link text)
    let selectedText = "";
    const { from, to } = editor.state.selection;
    if (from !== to) {
      selectedText = editor.state.doc.textBetween(from, to, " ");
    } else if (attrs.href) {
      const { state } = editor;
      const type = state.schema.marks.link;
      const $pos = state.doc.resolve(from);
      let markRange = { from: 0, to: 0 };
      $pos.parent.forEach((node, offset) => {
        if (node.isText && type.isInSet(node.marks)) {
          const start = $pos.start() + offset;
          const end = start + node.nodeSize;
          if (from >= start && from <= end) {
            markRange = { from: start, to: end };
          }
        }
      });
      if (markRange.from !== markRange.to) {
        selectedText = state.doc.textBetween(markRange.from, markRange.to, " ");
      }
    }
    setLinkDisplayText(selectedText || "");
    if (attrs.title) {
      setLinkTitle(attrs.title);
      setHasManuallyEditedTitle(true);
    } else {
      setLinkTitle(selectedText || attrs.href || "");
      setHasManuallyEditedTitle(false);
    }
    
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

  // Listen to selection/cursor updates to position the link floating tooltip bubble menu
  useEffect(() => {
    if (!editor) return;
    const updateHandler = () => {
      const isLink = editor.isActive("link");
      if (isLink && !isHtmlMode) {
        const { view } = editor;
        const { state } = view;
        const { from } = state.selection;
        try {
          const coords = view.coordsAtPos(from);
          const editorBounds = view.dom.getBoundingClientRect();
          
          setBubblePos({
            top: coords.top - editorBounds.top - 40,
            left: coords.left - editorBounds.left,
          });
          setBubbleUrl(editor.getAttributes("link").href || "");
          setBubbleOpen(true);
        } catch (e) {
          setBubbleOpen(false);
        }
      } else {
        setBubbleOpen(false);
      }
    };

    editor.on("selectionUpdate", updateHandler);
    editor.on("update", updateHandler);
    return () => {
      editor.off("selectionUpdate", updateHandler);
      editor.off("update", updateHandler);
    };
  }, [editor, isHtmlMode]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const u = linkUrl.trim();
    const txt = linkDisplayText.trim();
    const newTab = linkNewTab;
    const titleVal = linkTitle.trim() || txt || u;

    if (u === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().unsetColor().run();
    } else {
      const htmlContent = editor.getHTML();
      const links = extractLinks(htmlContent, true);
      const cleanTxt = txt.toLowerCase().trim();
      const cleanUrl = u.toLowerCase().trim();
      const isEditingCurrent = editor.isActive("link");
      
      const duplicateCount = links.filter(l =>
        l.text.toLowerCase().trim() === cleanTxt &&
        l.url.toLowerCase().trim() === cleanUrl
      ).length;

      // Same word → same link may appear at most TWICE. Adding a new one is blocked
      // only when two identical links already exist (this would be the 3rd). When
      // editing the current link, it is itself counted, so block once there are 3.
      if ((isEditingCurrent && duplicateCount > 2) || (!isEditingCurrent && duplicateCount >= 2)) {
        setLinkError("This word already links here twice — a 3rd is not allowed (SEO rule).");
        return;
      }

      setLinkError("");
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      // Preserve existing marks (e.g. custom text color, bold)
      const currentMarks = editor.state.selection.$from.marks();
      const otherMarks = currentMarks.filter(m => m.type.name !== "link").map(m => ({
        type: m.type.name,
        attrs: m.attrs
      }));

      if (txt) {
        if (hasSelection || txt !== editor.state.doc.textBetween(from, to, " ")) {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "text",
              text: txt,
              marks: [
                ...otherMarks,
                {
                  type: "link",
                  attrs: {
                    href: u,
                    target: newTab ? "_blank" : null,
                    title: titleVal,
                  },
                },
              ],
            })
            .run();
        } else {
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({
              href: u,
              target: newTab ? "_blank" : null,
              title: titleVal,
            })
            .run();
        }
      } else {
        if (!hasSelection) {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "text",
              text: u,
              marks: [
                ...otherMarks,
                {
                  type: "link",
                  attrs: {
                    href: u,
                    target: newTab ? "_blank" : null,
                    title: titleVal,
                  },
                },
              ],
            })
            .run();
        } else {
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({
              href: u,
              target: newTab ? "_blank" : null,
              title: titleVal,
            })
            .run();
        }
      }
    }
    setLinkOpen(false);
  }, [editor, linkUrl, linkDisplayText, linkTitle, linkNewTab]);

  const scanLinks = useCallback(async () => {
    if (!editor) return;
    const html = editor.getHTML();
    const links = extractLinks(html);
    // SEO anchor-text rules run on internal + external links (include relative hrefs).
    const allLinks = extractLinks(html, true);
    const anchors = analyzeAnchorRules(allLinks);
    setAnchorIssues(anchors);
    setScanOpen(true);
    setScanResults(links.map((link) => ({ ...link, result: { status: "checking", httpCode: 0 } })));
    setScanning(true);

    const uniqueUrls = Array.from(new Set(links.map((l) => l.url)));
    const resultByUrl = new Map<string, LinkCheckResult>();
    const queue = [...uniqueUrls];
    async function worker() {
      while (queue.length) {
        const url = queue.shift()!;
        const result = await checkLink(url);
        resultByUrl.set(url, result);
        setScanResults((prev) => prev.map((p) => (p.url === url ? { ...p, result } : p)));
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    setScanning(false);

    // Report the outcome so the page can decide whether publishing is allowed.
    const brokenCount = links.filter((l) => {
      const st = resultByUrl.get(l.url)?.status;
      return st === "broken" || st === "empty";
    }).length;
    onScanState?.({ sig: JSON.stringify(allLinks), brokenCount, anchorCount: anchors.length });
  }, [editor, onScanState]);

  useImperativeHandle(ref, () => ({ scanLinks }), [scanLinks]);

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
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;
    setSelectedElement(prev => prev ? { ...prev, content: val } : null);
    
    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && node.type.name === "heading") {
        const newNode = node.type.create(node.attrs, val ? state.schema.text(val) : []);
        tr.replaceWith(nodePos, nodePos + node.nodeSize, newNode);
        return true;
      }
      return false;
    }).run();
  };

  const handleHeadingLinkChange = (url: string) => {
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;
    setSelectedElement(prev => prev ? { ...prev, link: url } : null);
    
    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && node.type.name === "heading") {
        const linkMarkType = state.schema.marks.link;
        if (linkMarkType) {
          const from = nodePos + 1;
          const to = nodePos + node.nodeSize - 1;
          if (url.trim() === "") {
            tr.removeMark(from, to, linkMarkType);
          } else {
            tr.addMark(from, to, linkMarkType.create({ href: url }));
          }
          return true;
        }
      }
      return false;
    }).run();
  };

  const handleHeadingLevelChange = (lvl: string) => {
    const levelNum = parseInt(lvl.replace("H", ""));
    if (!editor || !selectedElement || selectedElement.pos === undefined || isNaN(levelNum)) return;
    setSelectedElement(prev => prev ? { ...prev, tag: lvl } : null);
    
    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && node.type.name === "heading") {
        const newAttrs = { ...node.attrs, level: levelNum };
        const newNode = node.type.create(newAttrs, node.content);
        tr.replaceWith(nodePos, nodePos + node.nodeSize, newNode);
        return true;
      }
      return false;
    }).run();
  };

  const handleTextContentChange = (val: string) => {
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;
    setSelectedElement(prev => prev ? { ...prev, content: val } : null);
    
    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && node.type.name === "paragraph") {
        const newNode = node.type.create(node.attrs, val ? state.schema.text(val) : []);
        tr.replaceWith(nodePos, nodePos + node.nodeSize, newNode);
        return true;
      }
      return false;
    }).run();
  };

  const handleTextHtmlChange = (val: string) => {
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;
    setSelectedElement(prev => prev ? { ...prev, content: val } : null);
    
    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && node.type.name === "paragraph") {
        const element = document.createElement("div");
        element.innerHTML = val;
        const parsed = editor.view.domParser.parse(element);
        tr.replaceWith(nodePos, nodePos + node.nodeSize, parsed.content);
        return true;
      }
      return false;
    }).run();
  };

  const handleImageSrcChange = (src: string) => {
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;
    setSelectedElement(prev => prev ? { ...prev, src } : null);
    
    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && node.type.name === "image") {
        tr.setNodeMarkup(nodePos, undefined, { ...node.attrs, src });
        return true;
      }
      return false;
    }).run();
  };

  const handleImageAltChange = (alt: string) => {
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;
    
    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && node.type.name === "image") {
        const oldAlt = node.attrs.alt || "";
        const oldTitle = node.attrs.title || "";
        const shouldSyncTitle = oldTitle === oldAlt || oldTitle === "";
        const newTitle = shouldSyncTitle ? alt : oldTitle;

        const newAttrs = {
          ...node.attrs,
          alt,
          title: newTitle,
        };

        setSelectedElement(prev => prev ? { ...prev, alt, title: newTitle } : null);
        tr.setNodeMarkup(nodePos, undefined, newAttrs);
        return true;
      }
      return false;
    }).run();
  };

  const handleImageTitleChange = (title: string) => {
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;
    setSelectedElement(prev => prev ? { ...prev, title } : null);
    
    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && node.type.name === "image") {
        tr.setNodeMarkup(nodePos, undefined, { ...node.attrs, title });
        return true;
      }
      return false;
    }).run();
  };

  const handleImageSizeChange = (mode: string, widthVal: string, heightVal: string) => {
    setImgResolutionMode(mode);
    setCustomWidth(widthVal);
    setCustomHeight(heightVal);
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;

    let w: string | null = null;
    let h: string | null = null;

    if (mode.includes("Large")) { w = "1024"; h = "572"; }
    else if (mode.includes("Medium")) { w = "300"; h = "300"; }
    else if (mode.includes("Thumbnail")) { w = "150"; h = "150"; }
    else if (mode === "Custom") { w = widthVal; h = heightVal; }

    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && node.type.name === "image") {
        tr.setNodeMarkup(nodePos, undefined, {
          ...node.attrs,
          width: w || null,
          height: h || null,
        });
        return true;
      }
      return false;
    }).run();
  };

  const handleHtmlWidgetChange = (val: string) => {
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;
    setSelectedElement(prev => prev ? { ...prev, content: val } : null);
    
    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node) {
        const element = document.createElement("div");
        element.innerHTML = val.includes("custom-html-block") ? val : `<div class="custom-html-block">${val}</div>`;
        const parsed = editor.view.domParser.parse(element);
        tr.replaceWith(nodePos, nodePos + node.nodeSize, parsed.content);
        return true;
      }
      return false;
    }).run();
  };

  const handleAlignChange = (alignment: "left" | "center" | "right" | "justify") => {
    setAlign(alignment);
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;

    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && (node.type.name === "heading" || node.type.name === "paragraph")) {
        tr.setNodeMarkup(nodePos, undefined, {
          ...node.attrs,
          textAlign: alignment,
        });
        return true;
      }
      return false;
    }).run();
  };

  const handleTextColorChange = (colorValue: string) => {
    setTextColor(colorValue);
    if (!editor || !selectedElement || selectedElement.pos === undefined) return;

    const nodePos = selectedElement.pos;
    editor.chain().command(({ tr, state }) => {
      const node = state.doc.nodeAt(nodePos);
      if (node && (node.type.name === "heading" || node.type.name === "paragraph")) {
        const textStyleMark = state.schema.marks.textStyle;
        if (textStyleMark) {
          const from = nodePos + 1;
          const to = nodePos + node.nodeSize - 1;
          tr.addMark(from, to, textStyleMark.create({ color: colorValue }));
          return true;
        }
      }
      return false;
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn(
      "flex bg-white transition-all duration-300",
      isFullScreen 
        ? "fixed inset-0 z-[9999] w-screen h-screen rounded-none overflow-hidden flex-col lg:flex-row border-none shadow-none" 
        : "border border-[#E9E5F3] flex-col lg:flex-row rounded-xl overflow-y-auto lg:overflow-hidden shadow-sm lg:h-[650px]"
    )}>
      {/* Permanent Left Sidebar Layout Wrapper */}
      <div className="shrink-0 border-b lg:border-b-0 lg:border-r border-[#F3F4F6] bg-white w-full lg:w-64 relative flex flex-col lg:h-full min-h-0">
        {/* Mobile toolbar toggle */}
        <button
          type="button"
          className="flex lg:hidden items-center justify-between w-full px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border-b border-[#F3F4F6]"
          onClick={() => setSidebarOpen(o => !o)}
        >
          <span>🛠 Toolbar</span>
          <span className="text-lg leading-none">{sidebarOpen ? '▲' : '▼'}</span>
        </button>
        <div 
          className={cn(
            "p-4 flex-col gap-3 z-40 custom-scrollbar overflow-y-auto w-full flex-1",
            isFullScreen ? "h-screen max-h-screen sticky top-0" : "h-full relative top-0",
            sidebarOpen ? "flex" : "hidden lg:flex"
          )}
        >
        {selectedElement ? (
          /* Live Element Edit Panels (Heading, Text Editor, Image, HTML) */
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
            {selectedElement.type !== "html" && (
              <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg mb-4 shrink-0">
                {(["content", "style"] as const).map((tab) => (
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
            )}

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
                    <div className="flex flex-col gap-3">
                      {/* Top Action Row */}
                      <div className="flex justify-between items-center mb-1 shrink-0">
                        <button 
                          type="button"
                          onClick={() => sidebarImageInputRef.current?.click()}
                          className="px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 text-gray-700 shadow-sm"
                        >
                          📷 Add Media
                        </button>
                        <input
                          ref={sidebarImageInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageFile(e.target.files?.[0])}
                        />
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 text-xs font-semibold text-gray-500">
                          <button
                            type="button"
                            onClick={() => setTextEditorMode("visual")}
                            className={cn("px-3 py-0.5 rounded transition-all", textEditorMode === "visual" ? "bg-white text-gray-800 shadow-sm" : "hover:text-gray-800")}
                          >
                            Visual
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextEditorMode("code")}
                            className={cn("px-3 py-0.5 rounded transition-all", textEditorMode === "code" ? "bg-white text-gray-800 shadow-sm" : "hover:text-gray-800")}
                          >
                            Code
                          </button>
                          <button type="button" className="p-1 text-gray-400 hover:text-gray-650" title="Custom Fields">🗄</button>
                        </div>
                      </div>

                      {/* Formatting Buttons Toolbar inside Widget Sidebar */}
                      {textEditorMode === "visual" && (
                        <div className="border border-gray-200 rounded-lg p-1.5 bg-white flex flex-wrap gap-1 items-center shrink-0 shadow-sm">
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={cn("w-6 h-6 flex items-center justify-center text-xs font-bold rounded hover:bg-gray-100", editor.isActive("bold") && "bg-violet-100 text-violet-700")}
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={cn("w-6 h-6 flex items-center justify-center text-xs font-italic rounded hover:bg-gray-100", editor.isActive("italic") && "bg-violet-100 text-violet-700")}
                          >
                            I
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={cn("w-6 h-6 flex items-center justify-center text-xs underline rounded hover:bg-gray-100", editor.isActive("underline") && "bg-violet-100 text-violet-700")}
                          >
                            U
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={cn("w-6 h-6 flex items-center justify-center text-xs rounded hover:bg-gray-100", editor.isActive("bulletList") && "bg-violet-100 text-violet-700")}
                            title="Bullet List"
                          >
                            •≡
                          </button>
                          <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={cn("w-6 h-6 flex items-center justify-center text-xs rounded hover:bg-gray-100", editor.isActive("orderedList") && "bg-violet-100 text-violet-700")}
                            title="Numbered List"
                          >
                            1≡
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              openLinkEditor();
                            }}
                            className={cn("w-6 h-6 flex items-center justify-center text-xs rounded hover:bg-gray-100", editor.isActive("link") && "bg-violet-100 text-violet-700")}
                            title="Insert Link"
                          >
                            🔗
                          </button>
                        </div>
                      )}

                      {/* Content textarea */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white shadow-sm flex-1 min-h-[220px]">
                        <textarea
                          value={selectedElement.content}
                          onChange={(e) => {
                            if (textEditorMode === "visual") {
                              handleTextContentChange(e.target.value);
                            } else {
                              handleTextHtmlChange(e.target.value);
                            }
                          }}
                          className="w-full p-3 focus:outline-none resize-none leading-relaxed text-sm font-sans flex-1 min-h-[200px]"
                          placeholder="Type your content paragraph block here..."
                        />
                        <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 text-[10px] font-semibold text-gray-400 flex justify-between items-center shrink-0">
                          <span>P</span>
                          <span className="cursor-ns-resize text-[12px] hover:text-gray-600">▤</span>
                        </div>
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
                        <select 
                          value={imgResolutionMode}
                          onChange={(e) => handleImageSizeChange(e.target.value, customWidth, customHeight)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white mb-2"
                        >
                          <option>Large - 1024 × 572</option>
                          <option>Medium - 300 × 300</option>
                          <option>Thumbnail - 150 × 150</option>
                          <option>Full Size - Original</option>
                          <option>Custom</option>
                        </select>

                        {imgResolutionMode === "Custom" && (
                          <div className="flex flex-col gap-2 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                            <span className="text-[11px] text-gray-500 italic leading-relaxed">
                              You can crop the original image size to any custom size. You can also set a single value for height or width in order to keep the original size ratio.
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1">
                                <input
                                  type="number"
                                  placeholder="Width"
                                  value={customWidth}
                                  onChange={(e) => setCustomWidth(e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 bg-white"
                                />
                                <span className="text-[9px] text-gray-400 block text-center mt-0.5">Width</span>
                              </div>
                              <span className="text-xs text-gray-400 font-bold">x</span>
                              <div className="flex-1">
                                <input
                                  type="number"
                                  placeholder="Height"
                                  value={customHeight}
                                  onChange={(e) => setCustomHeight(e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 bg-white"
                                />
                                <span className="text-[9px] text-gray-400 block text-center mt-0.5">Height</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleImageSizeChange("Custom", customWidth, customHeight)}
                                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alt Text (Alternative Text)</label>
                        <input
                          type="text"
                          placeholder="Describe this image for SEO..."
                          value={selectedElement.alt || ""}
                          onChange={(e) => handleImageAltChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image Title Tag (SEO Tooltip)</label>
                        <input
                          type="text"
                          placeholder="Enter image title attribute..."
                          value={selectedElement.title || ""}
                          onChange={(e) => handleImageTitleChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 bg-white"
                        />
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
                          onClick={() => handleAlignChange(a)}
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
                        onChange={(e) => handleTextColorChange(e.target.value)} 
                        className="w-8 h-8 rounded border border-gray-200 cursor-pointer overflow-hidden p-0"
                      />
                      <input 
                        type="text" 
                        value={textColor} 
                        onChange={(e) => handleTextColorChange(e.target.value)} 
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Vertical Formatting Toolbar when nothing is selected */
          <div className="flex flex-col select-none">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-3 shrink-0">
              <h3 className="font-bold text-sm text-gray-800">Toolbar</h3>
            </div>

            {/* Scrollable list of items */}
            <div className="overflow-y-auto pr-1 flex flex-col gap-2.5 custom-scrollbar">
              
              {/* Undo / Redo */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="flex-1 py-2 px-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-semibold text-center text-gray-700 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Undo"
                >
                  <span className="text-base">↩</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="flex-1 py-2 px-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-semibold text-center text-gray-700 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Redo"
                >
                  <span className="text-base">↪</span>
                </button>
              </div>

              {/* Typography Selector Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Typography</label>
                <select
                  value={editor.isActive("heading", { level: 1 }) ? "H1" : editor.isActive("heading", { level: 2 }) ? "H2" : editor.isActive("heading", { level: 3 }) ? "H3" : editor.isActive("heading", { level: 4 }) ? "H4" : editor.isActive("heading", { level: 5 }) ? "H5" : editor.isActive("heading", { level: 6 }) ? "H6" : "P"}
                  onChange={(e) => {
                    if (e.target.value === "P") {
                      editor.chain().focus().setParagraph().run();
                    } else {
                      const lvl = parseInt(e.target.value.replace("H", ""));
                      editor.chain().focus().toggleHeading({ level: lvl as any }).run();
                    }
                  }}
                  className="w-full py-2.5 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none font-semibold text-xs text-gray-700 shadow-sm cursor-pointer hover:border-gray-300 transition-all"
                >
                  <option value="P">Paragraph</option>
                  <option value="H1">H1 Heading</option>
                  <option value="H2">H2 Heading</option>
                  <option value="H3">H3 Heading</option>
                  <option value="H4">H4 Heading</option>
                  <option value="H5">H5 Heading</option>
                  <option value="H6">H6 Heading</option>
                </select>
              </div>

              {/* Basic Formatting Group */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Formatting</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("bold") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm font-bold w-4 text-center">B</span> Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("italic") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm italic w-4 text-center">I</span> Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("underline") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm underline w-4 text-center">U</span> Underline
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("strike") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm line-through w-4 text-center">S</span> Strikethrough
                  </button>
                </div>
              </div>

              {/* Lists and Blockquotes */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blocks</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("bulletList") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm w-4 text-center">•</span> List
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("orderedList") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm w-4 text-center">1.</span> List
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("blockquote") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm w-4 text-center">❝</span> Quote
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tables</label>
                <TableDropdown editor={editor} />
              </div>

              {/* Custom Blocks */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Custom Blocks</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => (editor.chain().focus() as any).insertCalloutBox().run()}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("calloutBox") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm w-4 text-center">❝</span> Callout Box
                  </button>
                  <button
                    type="button"
                    onClick={() => (editor.chain().focus() as any).insertCtaBox().run()}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("ctaBox") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm w-4 text-center">🚀</span> CTA Box
                  </button>

                </div>
              </div>

              {/* Hyperlinks */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hyperlinks</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      openLinkEditor();
                    }}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      editor.isActive("link") ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm w-4 text-center">🔗</span> Link
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().unsetColor().run()}
                    disabled={!editor.isActive("link")}
                    className="w-full py-2 px-3.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 text-xs font-semibold text-left text-gray-700 transition-all shadow-sm flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="text-sm w-4 text-center">✕</span> Unlink
                  </button>
                  <button
                    type="button"
                    onClick={scanLinks}
                    className="w-full py-2 px-3.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-xs font-semibold text-left text-gray-700 transition-all shadow-sm flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="text-sm w-4 text-center">🔍</span> Scan Links
                  </button>
                </div>
              </div>

              {/* Media & Page */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Media & Page</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImg}
                    className="w-full py-2 px-3.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 text-xs font-semibold text-left text-gray-700 transition-all shadow-sm flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="text-sm w-4 text-center">🖼</span> Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={addImageByUrl}
                    className="w-full py-2 px-3.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-xs font-semibold text-left text-gray-700 transition-all shadow-sm flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="text-sm w-4 text-center">🔗</span> Image by URL
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="w-full py-2 px-3.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-xs font-semibold text-left text-gray-700 transition-all shadow-sm flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="text-sm w-4 text-center">─</span> Horizontal Rule
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={toggleHtmlMode}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      isHtmlMode ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm w-4 text-center">💻</span> HTML Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className={cn(
                      "w-full py-2 px-3.5 border rounded-xl text-xs font-semibold text-left transition-all shadow-sm flex items-center gap-2.5 cursor-pointer",
                      isFullScreen ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm w-4 text-center">{isFullScreen ? "🗖" : "⛶"}</span> {isFullScreen ? "Collapse screen" : "Fullscreen"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
        </div>
      </div>
      <div 
        className={cn(
          "flex-1 min-w-0 min-h-0 flex flex-col bg-white overflow-hidden relative",
          isFullScreen ? "h-screen max-h-screen" : "lg:h-full"
        )}
      >
        {/* Fullscreen indicator button */}
        {isFullScreen && (
          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className="absolute top-3 right-3 z-[100] w-8 h-8 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow flex items-center justify-center transition-all hover:scale-105"
            title="Collapse Fullscreen"
          >
            🗖
          </button>
        )}

        {/* Link editor modal dialog matching WordPress/Elementor styling */}
        {linkOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 backdrop-blur-sm transition-all animate-fadeIn">
            {/* Modal Box */}
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-150 overflow-hidden mx-4 transform scale-100 transition-transform duration-200">
              
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">URL</h3>
                <button 
                  type="button" 
                  onClick={() => setLinkOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body Form */}
              <div className="p-6 flex flex-col gap-5">
                {linkError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <span className="text-sm">⚠️</span> {linkError}
                  </div>
                )}
                {/* URL Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    URL <span className="text-gray-400 font-normal lowercase">(required)</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      autoFocus
                      type="url"
                      value={linkUrl}
                      onChange={(e) => { setLinkUrl(e.target.value); setLinkError(""); }}
                      placeholder="Enter URL"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 bg-white text-gray-800 placeholder-gray-400 transition-all font-medium pr-10"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyLink();
                        }
                        if (e.key === "Escape") {
                          setLinkOpen(false);
                        }
                      }}
                    />
                    {linkUrl.trim() !== "" && (
                      <div className="absolute right-3.5 shrink-0 flex items-center">
                        <CheckBadge r={linkCheck} checking={checking} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Text Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Display Text
                  </label>
                  <input
                    type="text"
                    value={linkDisplayText}
                    onChange={(e) => { setLinkDisplayText(e.target.value); setLinkError(""); }}
                    placeholder="Enter display text"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 bg-white text-gray-800 placeholder-gray-400 transition-all font-medium"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyLink();
                      }
                      if (e.key === "Escape") {
                        setLinkOpen(false);
                      }
                    }}
                  />
                </div>

                {/* Link Title Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Link Title (Tooltip / SEO)
                  </label>
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={(e) => {
                      setLinkTitle(e.target.value);
                      setHasManuallyEditedTitle(true);
                    }}
                    placeholder="Enter link title attribute"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 bg-white text-gray-800 placeholder-gray-400 transition-all font-medium"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyLink();
                      }
                      if (e.key === "Escape") {
                        setLinkOpen(false);
                      }
                    }}
                  />
                </div>

                {/* Toggle Target options */}
                <div className="flex items-center gap-3 mt-1 py-1 select-none cursor-pointer" onClick={() => setLinkNewTab(!linkNewTab)}>
                  {/* Proper pill toggle */}
                  <div
                    className={cn(
                      "relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200 shrink-0",
                      linkNewTab ? "bg-violet-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
                        linkNewTab ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    Open link in new tab
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-3">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().extendMarkRange("link").unsetLink().unsetColor().run();
                      setLinkUrl("");
                      setLinkText("");
                      setLinkOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Remove Link
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setLinkOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyLink}
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-750 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Add Link
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}


        {/* Floating Link Bubble Menu */}
        {bubbleOpen && !linkOpen && (
          <div 
            className="absolute bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 px-3 flex items-center gap-2.5 z-[90] animate-fadeIn"
            style={{
              top: `${bubblePos.top}px`,
              left: `${bubblePos.left}px`,
              transform: "translateX(-20%)",
            }}
          >
            <a 
              href={bubbleUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-blue-600 hover:underline max-w-[180px] truncate font-semibold"
            >
              {bubbleUrl}
            </a>
            <div className="w-[1px] h-3.5 bg-gray-200" />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                openLinkEditor();
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              title="Edit Link"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setBubbleOpen(false);
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              title="Remove Link"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        )}

        {/* Scan-all-links results */}
        {/* Scan-all-links results in Dialog box modal */}
        {scanOpen && (() => {
          const correctLinks = scanResults.filter((s) => s.result.status === "valid" || s.result.status === "redirect");
          const brokenLinks = scanResults.filter((s) => s.result.status === "broken" || s.result.status === "error" || s.result.status === "empty" || s.result.status === "checking");
          return (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh] transform scale-100 transition-all duration-300">
                
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Link Checker {scanning ? "(Running Check…)" : "Results"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {scanResults.length} total link{scanResults.length !== 1 ? "s" : ""} scanned in this post
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setScanOpen(false)} 
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content - Scrollable area with two rows */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 max-h-[60vh] custom-scrollbar text-left">

                  {/* Row 0: SEO Anchor-Text Issues */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
                      <span className={`w-2.5 h-2.5 rounded-full ${anchorIssues.length ? "bg-amber-500" : "bg-green-500"}`}></span>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${anchorIssues.length ? "text-amber-800" : "text-green-800"}`}>
                        SEO Link Issues ({anchorIssues.length})
                      </h4>
                    </div>

                    {/* Plain-language rule reminder so the errors are easy to understand */}
                    <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-[11px] text-gray-500 leading-relaxed">
                      <span className="font-semibold text-gray-600">Anchor rules:</span> the same word/phrase may link to the same URL at most <b>2 times</b> (a 3rd is an error), and one URL must use <b>only one</b> anchor text (two different words pointing to the same link is an error). Applies to internal &amp; external links.
                    </div>

                    {anchorIssues.length === 0 ? (
                      <p className="text-xs text-green-600 italic pl-2">No anchor-text issues — link usage looks SEO-clean. ✅</p>
                    ) : (
                      <div className="grid gap-3">
                        {anchorIssues.map((iss, idx) => (
                          <div key={idx} className="flex flex-col p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl gap-1.5 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-amber-700 uppercase bg-white border border-amber-200 rounded px-1.5 py-0.5 shadow-sm">
                                {iss.type === "duplicate-anchor-link" ? "Used > 2 times" : "Different anchors"}
                              </span>
                              <span className="text-xs font-semibold text-gray-800 break-words">{iss.message}</span>
                            </div>
                            <div className="text-[11px] text-amber-800 break-all pl-0.5 font-medium">
                              <a href={iss.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{iss.url}</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Row 1: Correct / Valid Links */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-green-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">
                        Correct Links ({correctLinks.length})
                      </h4>
                    </div>
                    
                    {correctLinks.length === 0 ? (
                      <p className="text-xs text-gray-400 italic pl-2">No correct/valid links found.</p>
                    ) : (
                      <div className="grid gap-3">
                        {correctLinks.map((s, idx) => (
                          <div key={idx} className="flex flex-col p-3 bg-green-50/40 border border-green-100/50 rounded-xl hover:bg-green-50/60 transition-colors gap-2 text-left">
                            <div className="min-w-0 w-full">
                              <div className="text-xs font-bold text-gray-800 break-words">
                                "{s.text}"
                              </div>
                              <div className="text-[11px] text-green-700 break-all mt-1 font-medium">
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {s.url}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-green-100 shadow-sm self-start mt-0.5">
                              <span className="text-[10px] font-bold text-green-700 uppercase">
                                {s.result.status === "redirect" ? "Redirect (OK)" : "Valid"}
                              </span>
                              <CheckBadge r={s.result} checking={false} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Row 2: Broken / Incorrect Links */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-red-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">
                        Incorrect or Broken Links ({brokenLinks.length})
                      </h4>
                    </div>
                    
                    {brokenLinks.length === 0 ? (
                      <p className="text-xs text-gray-400 italic pl-2">No incorrect or broken links found.</p>
                    ) : (
                      <div className="grid gap-3">
                        {brokenLinks.map((s, idx) => (
                          <div key={idx} className="flex flex-col p-3 bg-red-50/40 border border-red-100/50 rounded-xl hover:bg-red-50/60 transition-colors gap-2 text-left">
                            <div className="min-w-0 w-full">
                              <div className="text-xs font-bold text-gray-800 break-words">
                                "{s.text}"
                              </div>
                              <div className="text-[11px] text-red-700 break-all mt-1 font-medium">
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {s.url}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-red-100 shadow-sm self-start mt-0.5">
                              <span className="text-[10px] font-bold text-red-700 uppercase">
                                {s.result.status === "checking" ? "Checking..." : s.result.status}
                              </span>
                              <CheckBadge r={s.result} checking={s.result.status === "checking"} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setScanOpen(false)} 
                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Close Results
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

        {/* Content area switch (Split screen in HTML Mode, full-width in Visual) */}
        {isHtmlMode ? (
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
            {/* HTML Code Editor (Left 50%) */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-[#F3F4F6] overflow-hidden min-h-0">
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
            <div className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden min-h-0">
              <div className="bg-[#FAFAFC] border-b border-[#F3F4F6] px-4 py-2 text-xs font-semibold text-gray-500 flex justify-between items-center shrink-0">
                <span>Real-time Live Preview</span>
                <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">Visual Render</span>
              </div>
              <div 
                className="flex-1 p-6 overflow-y-auto bg-white custom-scrollbar wp-post-content min-h-0"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        ) : (
          <div 
            style={{ 
              padding: "20px 24px"
            }}
            className="custom-scrollbar flex-1 min-h-0 overflow-y-auto"
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
              .tiptap-editor-content ul { list-style-type: disc !important; padding-left: 22px; margin: 0 0 14px; }
              .tiptap-editor-content ol { list-style-type: decimal !important; padding-left: 22px; margin: 0 0 14px; }
              .wp-post-content ul { list-style-type: disc !important; padding-left: 22px; margin: 0 0 14px; }
              .wp-post-content ol { list-style-type: decimal !important; padding-left: 22px; margin: 0 0 14px; }
              .tiptap-editor-content li { color: #4B5563; font-size: 15px; line-height: 1.75; margin-bottom: 6px; }
              .tiptap-editor-content blockquote { border-left: 4px solid #7C3AED; margin: 24px 0; padding: 14px 20px; background: #F3E8FF; border-radius: 0 10px 10px 0; font-style: italic; color: #374151; }
              .tiptap-editor-content a { color: #7C3AED; text-decoration: underline; font-weight: bold; }
              .wp-post-content a { color: #7C3AED; text-decoration: underline; font-weight: bold; }
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
              .tiptap-editor-content table {
                width: 100%;
                table-layout: fixed;
                border-collapse: separate;
                border-spacing: 0;
                margin: 24px 0;
                border: 1px solid #94a3b8;
                border-radius: 0px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
              }
              .tiptap-editor-content table th, .tiptap-editor-content table td {
                border-bottom: 1px solid #94a3b8;
                border-right: 1px solid #94a3b8;
                padding: 18px 20px;
                font-size: 14.5px;
                line-height: 1.5;
                text-align: center;
                vertical-align: middle;
                background: #ffffff;
                color: #4b5563;
                min-width: 80px;
                word-break: break-word;
                overflow-wrap: anywhere;
              }
              .tiptap-editor-content table th:last-child, .tiptap-editor-content table td:last-child {
                border-right: none;
              }
              .tiptap-editor-content table tr:last-child th, .tiptap-editor-content table tr:last-child td {
                border-bottom: none;
              }
              .tiptap-editor-content table th {
                background: #ffffff;
                font-weight: 700;
                color: #1f2937;
              }
              .tiptap-editor-content table th:first-child, .tiptap-editor-content table td:first-child {
                text-align: left;
                font-weight: 700;
                color: #1f2937;
              }
              .tiptap-editor-content .selectedCell { background: #EDE9FE !important; }

              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fadeIn {
                animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}</style>
            <EditorContent editor={editor} />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageFile(e.target.files?.[0])}
            />
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
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
