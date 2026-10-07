import React, { useState, useRef, useEffect } from "react";
import { getTodayString, getTomorrowString, getNextMondayString } from "../utils/dateUtils";
import { Calendar, Clock, ChevronRight, X } from "lucide-react";

interface RescheduleMenuProps {
  currentDate?: string;
  currentTime?: string;
  onReschedule: (date?: string, time?: string) => void;
  onClose: () => void;
}

export const RescheduleMenu: React.FC<RescheduleMenuProps> = ({
  currentDate,
  currentTime,
  onReschedule,
  onClose,
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customDate, setCustomDate] = useState(currentDate || getTodayString());
  const [customTime, setCustomTime] = useState(currentTime || "17:00");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  const handleQuickDate = (dateStr: string) => {
    onReschedule(dateStr, currentTime || "17:00");
    onClose();
  };

  const handleClearSchedule = () => {
    onReschedule(undefined, undefined);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReschedule(customDate, customTime);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 z-50 w-64 bg-white dark:bg-[#1b212d] rounded-xl border border-neutral-200 dark:border-neutral-700/80 shadow-lg p-2 text-xs text-neutral-800 dark:text-neutral-200"
    >
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-100 dark:border-neutral-800 px-1">
        <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          Quick Reschedule
        </span>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {!showCustom ? (
        <div className="space-y-0.5">
          <button
            onClick={() => handleQuickDate(getTodayString())}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium flex items-center justify-between transition-colors"
          >
            <span>Today</span>
            <span className="text-[11px] text-neutral-400">Later today</span>
          </button>
          <button
            onClick={() => handleQuickDate(getTomorrowString())}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium flex items-center justify-between transition-colors"
          >
            <span>Tomorrow</span>
            <span className="text-[11px] text-neutral-400">Same time</span>
          </button>
          <button
            onClick={() => handleQuickDate(getNextMondayString())}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium flex items-center justify-between transition-colors"
          >
            <span>Next Monday</span>
            <span className="text-[11px] text-neutral-400">Next week</span>
          </button>

          <div className="pt-1 mt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-0.5">
            <button
              onClick={() => setShowCustom(true)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium flex items-center justify-between transition-colors text-neutral-900 dark:text-white"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Choose Date & Time...
              </span>
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            </button>
            <button
              onClick={handleClearSchedule}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium transition-colors"
            >
              Remove Schedule
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCustomSubmit} className="space-y-2.5 p-1">
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">
              Select Time
            </label>
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
