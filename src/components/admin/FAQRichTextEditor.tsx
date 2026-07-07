import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect, useState } from "react";
import { Link2, Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQRichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const FAQRichTextEditor = ({ content, onChange, placeholder = "Type your answer..." }: FAQRichTextEditorProps) => {
  // Link editor state
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor-content faq-editor",
        style: "min-height:80px; outline:none; font-family: Inter, sans-serif; line-height: 1.5;",
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
    setLinkOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const u = linkUrl.trim();
    const newTab = linkNewTab;

    if (u === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

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
          })
          .run();
      }
    }
    setLinkOpen(false);
  }, [editor, linkUrl, linkNewTab]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-xl">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Insert Link</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  autoFocus
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
