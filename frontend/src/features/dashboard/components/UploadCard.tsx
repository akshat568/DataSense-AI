import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import {
  UploadCloud,
  FileSpreadsheet,
  Database,
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
      }, 400);
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
        if (code === 'file-too-large') setError('File is too large. Maximum 100 MB.');
        else if (code === 'file-invalid-type') setError('Only CSV files are accepted.');
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
        setError(e.response?.data?.message || e.message || 'An error occurred.');
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

  /* ── Already uploaded: compact status banner ── */
  if (isUploaded) {
    return (
      <div
        className="w-full p-4 flex items-center justify-between gap-4"
        style={{
          background: '#1E1F22',
          border: '1px solid #28292E',
          borderRadius: '10px',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(62, 207, 113, 0.10)',
              border: '1px solid rgba(62, 207, 113, 0.20)',
            }}
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: '#3ECF71' }} />
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: '#E8E9ED' }}>Dataset Ingested &amp; Active</p>
            <p className="text-[12px]" style={{ color: '#6B6E76' }}>CSV processed in memory. Replace anytime.</p>
          </div>
        </div>
        <button onClick={open} className="btn btn-secondary flex-shrink-0 gap-2 text-[13px]" style={{ height: '38px' }}>
          <RefreshCw className="w-3.5 h-3.5" style={{ color: '#9DA0A8' }} />
          Replace
        </button>
        <input {...getInputProps()} />
      </div>
    );
  }

  /* ── Hero Upload Card ── */
  return (
    <div
      {...getRootProps()}
      onClick={open}
      className={`
        relative w-full overflow-hidden transition-all duration-200 cursor-pointer
        ${isUploading ? 'pointer-events-none' : ''}
      `}
      style={{
        border: isDragActive
          ? '1px solid rgba(124,92,252,0.5)'
          : error
          ? '1px solid rgba(229,83,75,0.4)'
          : '1px dashed #323338',
        borderRadius: '10px',
        background: isDragActive
          ? 'rgba(124,92,252,0.05)'
          : error
          ? 'rgba(229,83,75,0.03)'
          : '#1A1B1F',
      }}
    >
      <input {...getInputProps()} />

      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors z-20"
          style={{
            background: "#25262A",
            border: "1px solid #323338",
            color: "#9DA0A8",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#E8E9ED";
            e.currentTarget.style.borderColor = "#454750";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9DA0A8";
            e.currentTarget.style.borderColor = "#323338";
          }}
          title="Close upload card"
          aria-label="Close upload card"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {isUploading ? (
        /* ── Progress state ── */
        <div className="flex flex-col items-center justify-center py-10 px-8 text-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(124,92,252,0.10)',
              border: '1px solid rgba(124,92,252,0.20)',
            }}
          >
            <UploadCloud className="w-6 h-6 animate-pulse" style={{ color: '#7C5CFC' }} strokeWidth={1.75} />
          </div>
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-[12px] mb-2">
              <span style={{ color: '#9DA0A8' }}>Ingesting &amp; profiling…</span>
              <span className="font-bold" style={{ color: '#E8E9ED' }}>{Math.round(progress)}%</span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: '#25262A' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: '#7C5CFC' }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ── Two-column layout matching reference ── */
        <div className="flex flex-col sm:flex-row items-stretch">

          {/* LEFT: dark panel with icon illustration */}
          <div
            className="relative flex items-center justify-center sm:w-[200px] flex-shrink-0 px-4 py-6 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1C1D22 0%, #1F2028 50%, #1A1B22 100%)' }}
          >
            {/* Dot-grid texture */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: 'radial-gradient(circle, #7C5CFC 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Decorative symbols */}
            <span className="absolute top-3 left-4 text-[14px] opacity-25 select-none leading-none" style={{ color: '#7C5CFC' }}>+</span>
            <span className="absolute top-3 right-5 text-[10px] opacity-20 select-none leading-none" style={{ color: '#7C5CFC' }}>✦</span>
            <span className="absolute bottom-3 left-8 text-[9px] opacity-15 select-none leading-none" style={{ color: '#7C5CFC' }}>✦</span>
            <span className="absolute bottom-3 right-4 text-[14px] opacity-20 select-none leading-none" style={{ color: '#7C5CFC' }}>+</span>

            {/* Icon row */}
            <div className="relative z-10 flex items-center gap-2">
              {/* FileSpreadsheet */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(62, 207, 113, 0.12)',
                  border: '1px solid rgba(62, 207, 113, 0.22)',
                }}
              >
                <FileSpreadsheet className="w-4 h-4" style={{ color: '#5BDF8E' }} strokeWidth={1.75} />
              </div>

              <div className="w-5 h-px" style={{ background: '#3A3B42' }} />

              {/* UploadCloud — center hero icon */}
              <div
                className="w-[56px] h-[56px] rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(124,92,252,0.12)',
                  border: '1px solid rgba(124,92,252,0.25)',
                }}
              >
                <UploadCloud
                  className="w-7 h-7"
                  style={{ color: isDragActive ? '#A78BFA' : '#7C5CFC' }}
                  strokeWidth={1.75}
                />
              </div>

              <div className="w-5 h-px" style={{ background: '#3A3B42' }} />

              {/* Database */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(124,92,252,0.10)',
                  border: '1px solid rgba(124,92,252,0.20)',
                }}
              >
                <Database className="w-4 h-4" style={{ color: '#A78BFA' }} strokeWidth={1.75} />
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden sm:block w-px self-stretch" style={{ background: '#28292E' }} />

          {/* RIGHT: text content */}
          <div className="flex-1 flex flex-col justify-center px-6 py-5">
            {error ? (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#E5534B' }} />
                <div>
                  <p className="text-[15px] font-bold" style={{ color: '#E5534B' }}>Upload Failed</p>
                  <p className="text-[13px] mt-0.5" style={{ color: '#E5534B' }}>{error}</p>
                </div>
              </div>
            ) : (
              <>
                <h2
                  className="text-[18px] font-bold tracking-tight mb-1.5"
                  style={{ color: '#E8E9ED' }}
                >
                  {isDragActive ? 'Drop your CSV here' : 'Upload your dataset'}
                </h2>
                <p
                  className="text-[14px] leading-relaxed mb-4 max-w-[500px]"
                  style={{ color: '#9DA0A8' }}
                >
                  Drag &amp; drop your CSV file here, or click to browse from your computer.
                </p>

                {/* Metadata pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold"
                    style={{
                      background: '#25262A',
                      border: '1px solid #323338',
                      color: '#9DA0A8',
                    }}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" style={{ color: '#7C5CFC' }} />
                    Format: CSV
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold"
                    style={{
                      background: '#25262A',
                      border: '1px solid #323338',
                      color: '#9DA0A8',
                    }}
                  >
                    <HardDrive className="w-3.5 h-3.5" style={{ color: '#7C5CFC' }} />
                    Maximum Size: 100 MB
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold"
                    style={{
                      background: '#25262A',
                      border: '1px solid #323338',
                      color: '#9DA0A8',
                    }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#3ECF71' }} />
                    Secure Processing
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
