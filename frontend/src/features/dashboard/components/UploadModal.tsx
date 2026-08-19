import { X } from "lucide-react";
import { UploadCard } from "./UploadCard";
type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (data: any, file: File) => void;
};

export function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-[#2E3A4E] bg-[#1B2433] shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2E3A4E] px-6 py-5">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Analyze Dataset
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Upload a CSV dataset to begin AI analysis.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-[#273244]"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Body */}
<div className="p-6">
  <UploadCard
  onSuccess={onUploadSuccess}
  isUploaded={false}
/>
</div>
        </div>
      </div>
    </>
  );
}