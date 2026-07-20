import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  id?: string;
}

const BUCKET = "case-study-images";

const ImageUpload = ({ label, value, onChange, required, id }: ImageUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so the same file can be re-selected if needed
    e.target.value = "";

    setUploading(true);
    try {
      // Derive extension from the actual MIME type to prevent spoofing via filename
      const mimeToExt: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/svg+xml": "svg",
      };
      const ext = mimeToExt[file.type];
      if (!ext) throw new Error(`Unsupported file type: ${file.type}`);

      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => onChange("");

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && " *"}
      </Label>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        /* Preview */
        <div className="relative w-full rounded-lg border border-border/60 overflow-hidden bg-secondary/20">
          <img
            src={value}
            alt="Preview"
            className="w-full max-h-48 object-contain p-2"
          />
          <div className="flex items-center gap-2 px-3 py-2 border-t border-border/40 bg-white">
            <span className="text-xs text-muted-foreground truncate flex-1">{value}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-shrink-0 text-xs h-7 px-2"
            >
              <Upload className="w-3 h-3 mr-1" />
              {uploading ? "Uploading…" : "Replace"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={uploading}
              className="flex-shrink-0 h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Upload area */
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-secondary/10 py-8 text-sm text-muted-foreground hover:border-primary/40 hover:bg-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-muted-foreground/60" />
                <span>
                  Click to upload an image
                </span>
                <span className="text-xs">PNG, JPG, GIF, WebP – max 5 MB</span>
              </>
            )}
          </button>
          {/* URL fallback */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-xs text-muted-foreground">or paste URL</span>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
