import { Task } from "../types/task";
import { formatTimeDisplay } from "./dateUtils";
import { playReminderSound, playAlarmSound, playSystemOnSound } from "./sound";

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return "denied";
  }
}

export function getNotificationPermissionState(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Standard Task Reminder (gentle double chime)
 */
export function sendTaskNotification(task: Task, playSound = true): void {
  if (playSound) {
    playReminderSound();
  }

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      const timeStr = task.scheduledTime ? ` at ${formatTimeDisplay(task.scheduledTime)}` : "";
      new Notification(`Office Task Reminder: ${task.title}`, {
        body: `Scheduled${timeStr} · Priority: ${task.priority.toUpperCase()} · [${task.category}]`,
        icon: "/favicon.ico",
        tag: `task-reminder-${task.id}`,
      });
    } catch {
      // Fallback handled in-app
    }
  }
}

/**
 * Task Set-Time ALARM Notification (loud pulsing alarm sound + sticky notification)
 */
export function sendTaskAlarmNotification(task: Task, playSound = true): void {
  if (playSound) {
    playAlarmSound(4); // 4 cycles of dual-pulse alarm beeps
  }

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      const timeStr = task.scheduledTime ? ` at ${formatTimeDisplay(task.scheduledTime)}` : " Now";
      const notif = new Notification(`⏰ DUE NOW: ${task.title}`, {
        body: `Office Task Alarm: Scheduled${timeStr}. Priority: ${task.priority.toUpperCase()} · [${task.category}]`,
        icon: "/favicon.ico",
        tag: `task-alarm-${task.id}`,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch {
      // Fallback in-app
    }
  }
}

/**
 * System ON / Startup Due Date Notification (signals on workspace launch)
 */
export function sendSystemOnDueNotification(overdueCount: number, todayCount: number, playSound = true): void {
  if (playSound) {
    playSystemOnSound();
  }

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      let bodyText = "";
      if (overdueCount > 0 && todayCount > 0) {
        bodyText = `System check: You have ${overdueCount} overdue item(s) and ${todayCount} item(s) due today.`;
      } else if (overdueCount > 0) {
        bodyText = `System check: Attention! You have ${overdueCount} overdue task(s) needing resolution.`;
      } else {
        bodyText = `System check: You have ${todayCount} task(s) scheduled for today.`;
      }

      const notif = new Notification(`🔔 Office Tasks: System ON Due Alert`, {
        body: bodyText,
        icon: "/favicon.ico",
        tag: "system-on-due-alert",
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch {
      // Fallback in-app
    }
  }
}

/**
 * Test Notification & Alarm to confirm desktop integration
 */
export function sendTestNotification(playSound = true): void {
  if (playSound) {
    playAlarmSound(2);
  }

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(`🔔 Office Tasks Alarm Test`, {
        body: `Desktop notifications and audible alarms are successfully enabled and configured!`,
        icon: "/favicon.ico",
        tag: "test-notification",
      });
    } catch {
      // Fallback in-app
    }
  }
}

