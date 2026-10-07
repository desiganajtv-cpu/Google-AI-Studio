import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Continue",
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xl">
      <div className="w-full max-w-md bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-full transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full text-white shadow-xs transition-all active:scale-95 cursor-pointer ${
              isDestructive
                ? "bg-[#FF3B30] hover:bg-[#E0352B]"
                : "bg-[#0071E3] hover:bg-[#0077ED]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
