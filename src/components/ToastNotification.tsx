import React from "react";
import { ToastMessage } from "../hooks/useTasks";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  onSelectTask?: (taskId: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
  onSelectTask,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let colorClass = "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800";
        let iconColor = "text-emerald-500";

        if (toast.type === "warning") {
          Icon = AlertTriangle;
          colorClass = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800";
          iconColor = "text-amber-500";
        } else if (toast.type === "error") {
          Icon = AlertCircle;
          colorClass = "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800";
          iconColor = "text-rose-500";
        } else if (toast.type === "info") {
          Icon = Info;
          colorClass = "bg-neutral-900 text-white border-neutral-800 dark:bg-neutral-800 dark:text-white dark:border-neutral-700";
          iconColor = "text-blue-400";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${colorClass}`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold leading-tight truncate">
                {toast.title}
              </h5>
              {toast.message && (
                <p className="text-[11px] opacity-90 mt-0.5 leading-snug line-clamp-2">
                  {toast.message}
                </p>
              )}
              {toast.taskId && onSelectTask && (
                <button
                  onClick={() => onSelectTask(toast.taskId!)}
                  className="text-[10px] font-semibold underline mt-1 block hover:opacity-80"
                >
                  View Task
                </button>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-0.5 rounded opacity-70 hover:opacity-100 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
