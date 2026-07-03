import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useCallback } from "react";

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

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter link URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
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
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Add Link">
          🔗 Link
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} title="Remove Link">
          Unlink
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
