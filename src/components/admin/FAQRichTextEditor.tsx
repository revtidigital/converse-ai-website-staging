import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect, useState } from "react";
import { Link2, Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface FAQRichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  isQuestion?: boolean;
}

const FAQRichTextEditor = ({ content, onChange, placeholder = "Type here...", isQuestion = false }: FAQRichTextEditorProps) => {
  // Link editor state
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDisplayText, setLinkDisplayText] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [hasManuallyEditedTitle, setHasManuallyEditedTitle] = useState(false);
  const [linkNewTab, setLinkNewTab] = useState(false);

  // Sync display text to title attribute automatically by default
  useEffect(() => {
    if (!hasManuallyEditedTitle) {
      setLinkTitle(linkDisplayText);
    }
  }, [linkDisplayText, hasManuallyEditedTitle]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      CustomLink.configure({ openOnClick: false, autolink: true }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn("tiptap-editor-content faq-editor", isQuestion && "faq-question-editor"),
        style: isQuestion
          ? "min-height:45px; outline:none; font-family: Inter, sans-serif; line-height: 1.75; font-size: 16.5px; font-weight: 700; color: #1f2937;"
          : "min-height:85px; outline:none; font-family: Inter, sans-serif; line-height: 1.75; font-size: 16.5px; color: #4b5563;",
      },
    },
  });

  // Sync content updates from parent if changed externally
  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const openLinkEditor = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes("link");
    setLinkUrl(attrs.href ?? "");
    setLinkNewTab(attrs.target === "_blank");

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

  const applyLink = useCallback(() => {
    if (!editor) return;
    const u = linkUrl.trim();
    const txt = linkDisplayText.trim();
    const newTab = linkNewTab;
    const titleVal = linkTitle.trim() || txt || u;

    if (u === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (txt) {
        if (hasSelection || txt !== editor.state.doc.textBetween(from, to, " ")) {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "text",
              text: txt,
              marks: [
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

  if (!editor) {
    return <div className="min-h-[80px] border border-gray-200 rounded-lg bg-gray-50 animate-pulse" />;
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border border-gray-200 rounded-t-lg bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 transition-colors",
            editor.isActive("bold") && "bg-violet-100 text-violet-700"
          )}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 transition-colors",
            editor.isActive("italic") && "bg-violet-100 text-violet-700"
          )}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 transition-colors",
            editor.isActive("bulletList") && "bg-violet-100 text-violet-700"
          )}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 transition-colors",
            editor.isActive("orderedList") && "bg-violet-100 text-violet-700"
          )}
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <div className="w-[1px] h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={openLinkEditor}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 transition-colors",
            editor.isActive("link") && "bg-violet-100 text-violet-700"
          )}
          title="Insert Link"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editor */}
      <div className="border border-t-0 border-gray-200 rounded-b-lg bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Link Editor Modal */}
      {linkOpen && (
        <div className="fixed inset-0 z-[100005] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-xl">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Insert Link</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display Text</label>
                <input
                  type="text"
                  value={linkDisplayText}
                  onChange={(e) => setLinkDisplayText(e.target.value)}
                  placeholder="Link text"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link Title (Tooltip / SEO)</label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => {
                    setLinkTitle(e.target.value);
                    setHasManuallyEditedTitle(true);
                  }}
                  placeholder="Link title tag"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newTab"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="newTab" className="text-xs text-gray-600">Open in new tab</label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                    setLinkOpen(false);
                  }}
                  className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Remove Link
                </button>
                <button
                  type="button"
                  onClick={() => setLinkOpen(false)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyLink}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .faq-editor p {
          margin: 0.5em 0;
          font-size: 16.5px;
          line-height: 1.75;
          color: #4b5563;
        }
        .faq-editor p:first-child {
          margin-top: 0;
        }
        .faq-editor p:last-child {
          margin-bottom: 0;
        }
        .faq-editor a {
          color: #7c3aed;
          text-decoration: underline;
          font-weight: bold;
        }
        .faq-question-editor p {
          font-weight: 700 !important;
          color: #1f2937 !important;
        }
        .faq-editor ul, .faq-editor ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .faq-editor ul {
          list-style-type: disc;
        }
        .faq-editor ol {
          list-style-type: decimal;
        }
        .faq-editor:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default FAQRichTextEditor;
