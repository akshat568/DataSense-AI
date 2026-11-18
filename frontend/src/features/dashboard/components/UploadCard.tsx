import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  X,
} from 'lucide-react';
import { uploadDataset } from '../../../services/api';

interface UploadCardProps {
  onSuccess: (data: any, file: File) => void;
  isUploaded?: boolean;
  onClose?: () => void;
}

export function UploadCard({ onSuccess, isUploaded = false, onClose }: UploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isUploading) {
      setProgress(10);
      timer = setInterval(() => {
        setProgress((p) => (p >= 90 ? p : p + Math.random() * 12));
      }, 350);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [isUploading]);

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length > 0) {
        const code = rejected[0].errors[0].code;
        if (code === 'file-too-large') setError('File exceeds size limit. Maximum allowed size is 100 MB.');
        else if (code === 'file-invalid-type') setError('Only CSV files are supported.');
        else setError(rejected[0].errors[0].message);
        return;
      }
      if (accepted.length === 0) return;
      const file = accepted[0];
      setIsUploading(true);
      try {
        const res = await uploadDataset(file);
        if (res.success) {
          setProgress(100);
          setTimeout(() => onSuccess(res.data, file), 300);
        } else {
          setError(res.message || 'Upload failed.');
        }
      } catch (e: any) {
        setError(e.response?.data?.message || e.message || 'An error occurred during upload.');
      } finally {
        setIsUploading(false);
      }
    },
    [onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxSize: 100 * 1024 * 1024,
    multiple: false,
    noClick: true,
  });

  /* ── Already uploaded state ── */
  if (isUploaded) {
    return (
      <div className="w-full p-4.5 rounded-xl border border-[#E5E9E2] bg-white flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#EDF7F1] border border-[#BCE2CC] text-[#2A7E4F] flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[13.5px] font-bold text-[#26332D]">Dataset Active in Workspace</p>
            <p className="text-[12.5px] text-[#64736A]">CSV processed in memory. Ready for profiling and modeling.</p>
          </div>
        </div>
        <button
          onClick={open}
          className="btn btn-secondary text-[13px] gap-2 flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#64736A]" />
          Replace Dataset
        </button>
        <input {...getInputProps()} />
      </div>
    );
  }

  /* ── Interactive Upload Zone ── */
  return (
    <div
      {...getRootProps()}
      onClick={open}
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden ${
        isUploading ? 'pointer-events-none' : ''
      } ${
        isDragActive
          ? 'border-[#26332D] bg-[#F1F6EC]'
          : error
          ? 'border-[#DC2626] bg-[#FEF2F2]'
          : 'border-[#D6DCD3] hover:border-[#26332D] bg-white hover:bg-[#FAFBF9]'
      }`}
    >
      <input {...getInputProps()} />

      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[#78827A] hover:text-[#26332D] hover:bg-[#F1F5EF] transition-colors z-20"
          title="Close upload card"
          aria-label="Close upload card"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {isUploading ? (
        /* ── Progress State ── */
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center text-[#26332D]">
            <UploadCloud className="w-6 h-6 animate-pulse text-[#26332D]" strokeWidth={2} />
          </div>
          <div className="w-full max-w-sm">
            <div className="flex justify-between text-[12.5px] mb-2 font-medium">
              <span className="text-[#64736A]">Ingesting and profiling dataset…</span>
              <span className="font-bold text-[#26332D] font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="w-full rounded-full h-2 overflow-hidden bg-[#E5E9E2]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: '#26332D' }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ── Dropzone Layout ── */
        <div className="flex flex-col sm:flex-row items-stretch">
          {/* Left illustration panel */}
          <div className="flex items-center justify-center sm:w-[200px] flex-shrink-0 p-6 bg-[#F9FAF7] border-b sm:border-b-0 sm:border-r border-[#E5E9E2]">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E9E2] flex items-center justify-center shadow-xs">
              <UploadCloud
                className="w-8 h-8 text-[#26332D]"
                strokeWidth={1.8}
              />
            </div>
          </div>

          {/* Right text & meta details */}
          <div className="flex-1 flex flex-col justify-center p-6">
            {error ? (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#DC2626] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[14.5px] font-bold text-[#DC2626]">Upload Failed</p>
                  <p className="text-[13px] text-[#DC2626] mt-0.5">{error}</p>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-[17px] font-bold text-[#26332D] tracking-tight mb-1">
                  {isDragActive ? "Drop your CSV dataset here" : "Upload your dataset"}
                </h3>
                <p className="text-[13.5px] text-[#64736A] mb-4">
                  Drag &amp; drop a CSV file here, or click to browse your files.
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold bg-[#F1F5EF] border border-[#E5E9E2] text-[#26332D]">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#64736A]" />
                    Format: CSV
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold bg-[#F1F5EF] border border-[#E5E9E2] text-[#26332D]">
                    <HardDrive className="w-3.5 h-3.5 text-[#64736A]" />
                    Maximum Size: 100 MB
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold bg-[#EDF7F1] border border-[#BCE2CC] text-[#166534]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2A7E4F]" />
                    Client/Memory Secure
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
