import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FileUploadProps {
  onUpload: (file: File, base64: string) => void;
  isLoading?: boolean;
}

export function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        setError("Please upload a valid PDF or DOCX file under 5MB.");
        return;
      }

      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Strip the data URL prefix if present
        const base64Data = base64.split(",")[1] || base64;
        onUpload(file, base64Data);
      };
      reader.onerror = () => setError("Failed to read file.");
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          isLoading && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium text-foreground">Processing resume...</p>
            <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">
              Drag and drop your resume
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              or click to browse files (PDF, DOCX up to 5MB)
            </p>
            <Button type="button" variant="secondary" disabled={isLoading}>
              Select File
            </Button>
          </>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive mt-3 text-center">{error}</p>
      )}
    </div>
  );
}
