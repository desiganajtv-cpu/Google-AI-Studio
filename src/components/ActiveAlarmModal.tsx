import React from "react";
import { Task } from "../types/task";
import { formatTimeDisplay } from "../utils/dateUtils";
import { stopAlarmSound } from "../utils/sound";
import { Bell, CheckCircle2, Clock, VolumeX } from "lucide-react";

interface ActiveAlarmModalProps {
  task: Task | null;
  onDismiss: () => void;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string, minutes: number) => void;
}

export const ActiveAlarmModal: React.FC<ActiveAlarmModalProps> = ({
  task,
  onDismiss,
  onComplete,
  onSnooze,
}) => {
  if (!task) return null;

  const handleDismiss = () => {
    stopAlarmSound();
    onDismiss();
  };

  const handleComplete = () => {
    stopAlarmSound();
    onComplete(task.id);
    onDismiss();
  };

  const handleSnooze = (minutes = 5) => {
    stopAlarmSound();
    onSnooze(task.id, minutes);
    onDismiss();
  };

  return (
    <div
      id="active-alarm-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xl animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alarm-title"
    >
      <div className="w-full max-w-md bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_24px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)] overflow-hidden transition-all">
        {/* Apple Luxury Header */}
        <div className="bg-[#FF9500]/10 dark:bg-[#FF9500]/20 border-b border-[#FF9500]/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9500] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF9500]"></span>
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-xs tracking-tight text-[#FF9500]">
              <Bell className="w-4 h-4 fill-current animate-bounce" />
              <span>Alarm · Scheduled Task Due Now</span>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            title="Silence alarm"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.1] transition-colors"
          >
            <VolumeX className="w-4 h-4" />
          </button>
        </div>

        {/* Task Details */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#86868B] mb-1.5">
              <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                {task.category}
              </span>
              <span>·</span>
              <span className="capitalize font-medium text-[#FF9500]">
                {task.priority} Priority
              </span>
              {task.scheduledTime && (
                <>
                  <span>·</span>
                  <span className="font-mono text-[#1D1D1F] dark:text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#86868B]" />
                    {formatTimeDisplay(task.scheduledTime)}
                  </span>
                </>
              )}
            </div>

            <h2 id="alarm-title" className="text-lg font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-snug">
              {task.title}
            </h2>

            {task.description && (
              <p className="text-xs text-[#86868B] dark:text-[#98989D] mt-2 line-clamp-3 bg-black/[0.02] dark:bg-white/[0.04] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
                {task.description}
              </p>
            )}
          </div>

          <div className="text-[11px] text-[#86868B] bg-black/[0.03] dark:bg-white/[0.05] px-3.5 py-2 rounded-xl flex items-center justify-between">
            <span>Audio chime is ringing</span>
            <button
              onClick={handleDismiss}
              className="text-[#0071E3] dark:text-[#0A84FF] hover:underline font-medium cursor-pointer"
            >
              Silence Audio
            </button>
          </div>

          {/* Apple Action Buttons */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <button
              id="btn-alarm-snooze"
              onClick={() => handleSnooze(5)}
              className="px-3 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.12] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <Clock className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Snooze 5m</span>
            </button>

            <button
              id="btn-alarm-dismiss"
              onClick={handleDismiss}
              className="px-3 py-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium transition-all cursor-pointer active:scale-95"
            >
              Dismiss
            </button>

            <button
              id="btn-alarm-complete"
              onClick={handleComplete}
              className="px-3 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
