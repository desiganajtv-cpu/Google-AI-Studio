import React, { useState } from "react";
import { Bell, Volume2, X, ShieldAlert } from "lucide-react";

interface NotificationBannerProps {
  notificationsEnabled: boolean;
  permissionState: NotificationPermission | "unsupported";
  onEnable: () => Promise<boolean | void>;
  onTestAlarm: () => void;
  soundEnabled: boolean;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notificationsEnabled,
  permissionState,
  onEnable,
  onTestAlarm,
  soundEnabled,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  // If already granted and enabled, don't show the setup banner
  if (isDismissed || (permissionState === "granted" && notificationsEnabled)) {
    return null;
  }

  const handleEnableClick = async () => {
    setIsEnabling(true);
    try {
      await onEnable();
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <div
      id="desktop-notifications-banner"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-white/95 dark:bg-[#1C1C20]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1F] dark:text-[#F5F5F7] px-4 py-3 rounded-2xl transition-all shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-7 h-7 rounded-full bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center shrink-0">
            {permissionState === "denied" ? <ShieldAlert className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-[#1C1C1F] dark:text-white truncate">
              {permissionState === "denied" ? "Notifications Blocked" : "Enable Task Alarms"}
            </p>
            <p className="text-[11px] text-[#777780] dark:text-[#9999A0] truncate">
              {permissionState === "denied" ? "Check browser site permissions" : "Play audio alarms when tasks are due"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="btn-test-alarm-banner"
            onClick={onTestAlarm}
            title="Test alarm chime"
            className="px-2.5 py-1 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1C1C1F] dark:text-[#F5F5F7] text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Volume2 className="w-3 h-3 text-[#777780]" />
            <span className="hidden xs:inline">Test</span>
          </button>

          {permissionState !== "denied" && (
            <button
              id="btn-enable-notifications-banner"
              onClick={handleEnableClick}
              disabled={isEnabling}
              className="px-3 py-1 rounded-xl bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] text-[11px] font-bold shadow-xs hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <Bell className="w-3 h-3 fill-current" />
              <span>{isEnabling ? "..." : "Enable"}</span>
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            title="Dismiss banner"
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
