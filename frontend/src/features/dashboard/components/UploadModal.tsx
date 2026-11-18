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
        className="fixed inset-0 bg-[#26332D]/40 backdrop-blur-xs z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-[#E5E9E2] bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E9E2] px-6 py-4.5 bg-white">
            <div>
              <h2 className="text-[19px] font-bold text-[#26332D]">
                Upload &amp; Analyze Dataset
              </h2>
              <p className="text-[13px] text-[#64736A] mt-0.5">
                Upload a CSV dataset to initiate automated intelligence analysis.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#78827A] hover:text-[#26332D] hover:bg-[#F1F5EF] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 bg-[#FAFBF9]">
            <UploadCard
              onSuccess={onUploadSuccess}
              isUploaded={false}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </>
  );
}
