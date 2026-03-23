/**
 * DocumentUpload — Drag-and-drop file upload center for bureau response letters,
 * ID documents, and supporting files. Shows uploaded files with status badges.
 */
import { useState, useRef, DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Upload,
  File,
  FileText,
  Image,
  CheckCircle2,
  Download,
  Eye,
  CloudUpload,
} from "lucide-react";

export interface UploadedFile {
  id: string;
  name: string;
  uploadedAt: string;
  type: "pdf" | "jpg" | "png" | "doc";
  category: "Bureau Letter" | "Identity" | "Supporting";
  status: "received" | "processing" | "reviewed";
  sizeKb?: number;
}

interface DocumentUploadProps {
  uploadedFiles: UploadedFile[];
}

const ACCEPTED_TYPES = ["PDF", "JPG", "PNG", "DOC"];

const CATEGORY_COLORS: Record<UploadedFile["category"], string> = {
  "Bureau Letter": "bg-blue-100 text-blue-700 border-blue-200",
  Identity: "bg-purple-100 text-purple-700 border-purple-200",
  Supporting: "bg-slate-100 text-slate-700 border-slate-200",
};

const STATUS_COLORS: Record<UploadedFile["status"], string> = {
  received: "bg-emerald-100 text-emerald-700 border-emerald-200",
  processing: "bg-amber-100 text-amber-700 border-amber-200",
  reviewed: "bg-blue-100 text-blue-700 border-blue-200",
};

function FileIcon({ type }: { type: UploadedFile["type"] }) {
  if (type === "jpg" || type === "png") return <Image className="h-4 w-4 text-blue-500" />;
  return <FileText className="h-4 w-4 text-red-500" />;
}

export function DocumentUpload({ uploadedFiles }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    // Demo: show success state
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = () => {
    // Demo: show success state
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-slate-900">Document Upload Center</CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Upload bureau response letters, ID documents, or supporting files
        </p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragging
              ? "border-blue-400 bg-blue-50 scale-[1.01]"
              : uploadSuccess
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />

          {uploadSuccess ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-emerald-700 font-semibold">File uploaded successfully!</p>
              <p className="text-xs text-emerald-600">Our team has been notified</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <CloudUpload
                className={`h-10 w-10 ${isDragging ? "text-blue-500" : "text-slate-400"}`}
              />
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Drop files here or{" "}
                  <span className="text-blue-600 underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Drop bureau response letters, ID documents, or supporting files
                </p>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {ACCEPTED_TYPES.map((t) => (
                  <Badge key={t} className="bg-slate-200 text-slate-600 border-0 text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload button */}
        <Button
          onClick={handleFileSelect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>

        {/* Uploaded files list */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Uploaded Files ({uploadedFiles.length})
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-blue-200 transition-colors"
                >
                  <FileIcon type={file.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-500">{file.uploadedAt}</span>
                      <Badge
                        className={`${CATEGORY_COLORS[file.category]} border text-[10px] h-4 px-1.5`}
                      >
                        {file.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${STATUS_COLORS[file.status]} border text-[10px] capitalize h-5`}
                    >
                      {file.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
