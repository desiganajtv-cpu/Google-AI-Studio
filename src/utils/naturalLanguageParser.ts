import { Priority, NaturalLanguageParseResult } from "../types/task";
import { getTodayString, getTomorrowString, getNextMondayString } from "./dateUtils";

export function parseNaturalLanguageTask(input: string, availableCategories: string[]): NaturalLanguageParseResult {
  let text = input.trim();
  let scheduledDate: string | undefined = undefined;
  let scheduledTime: string | undefined = undefined;
  let priority: Priority | undefined = undefined;
  let category: string | undefined = undefined;

  const rawMatched: NaturalLanguageParseResult["rawMatched"] = {};

  // 1. Priority detection
  const priorityPatterns: [RegExp, Priority, string][] = [
    [/\b(urgent|critical|asap|p1)\b/i, "urgent", "Urgent"],
    [/\b(high priority|high|p2)\b/i, "high", "High"],
    [/\b(medium priority|medium|med|normal|p3)\b/i, "medium", "Medium"],
    [/\b(low priority|low|p4)\b/i, "low", "Low"],
  ];

  for (const [regex, prioVal, prioLabel] of priorityPatterns) {
    if (regex.test(text)) {
      priority = prioVal;
      rawMatched.priorityText = prioLabel;
      text = text.replace(regex, " ").trim();
      break;
    }
  }

  // 2. Date detection
  const todayRegex = /\b(today|tonight)\b/i;
  const tomorrowRegex = /\b(tomorrow|tmrw)\b/i;
  const nextMondayRegex = /\b(next monday)\b/i;

  if (nextMondayRegex.test(text)) {
    scheduledDate = getNextMondayString();
    rawMatched.dateText = "Next Monday";
    text = text.replace(nextMondayRegex, " ").trim();
  } else if (tomorrowRegex.test(text)) {
    scheduledDate = getTomorrowString();
    rawMatched.dateText = "Tomorrow";
    text = text.replace(tomorrowRegex, " ").trim();
  } else if (todayRegex.test(text)) {
    scheduledDate = getTodayString();
    rawMatched.dateText = "Today";
    text = text.replace(todayRegex, " ").trim();
  } else {
    // Check specific days of week: "on monday", "this friday", etc.
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayRegex = new RegExp(`\\b(?:on\\s+|this\\s+)?(${dayNames.join("|")})\\b`, "i");
    const dayMatch = text.match(dayRegex);
    if (dayMatch) {
      const targetDayIndex = dayNames.indexOf(dayMatch[1].toLowerCase());
      if (targetDayIndex !== -1) {
        const d = new Date();
        const currentDayIndex = d.getDay();
        let daysToAdd = targetDayIndex - currentDayIndex;
        if (daysToAdd <= 0) daysToAdd += 7;
        d.setDate(d.getDate() + daysToAdd);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dayStr = String(d.getDate()).padStart(2, "0");
        scheduledDate = `${y}-${m}-${dayStr}`;
        rawMatched.dateText = dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1);
        text = text.replace(dayRegex, " ").trim();
      }
    }
  }

  // 3. Time detection
  // e.g. "at 5pm", "at 5:30pm", "5pm", "10:30am", "17:00", "2:00 PM"
  const timeRegex = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
  const timeMatch = text.match(timeRegex);

  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3].toLowerCase();

    if (meridian === "pm" && hour < 12) hour += 12;
    if (meridian === "am" && hour === 12) hour = 0;

    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    scheduledTime = `${hh}:${mm}`;
    rawMatched.timeText = timeMatch[0].trim();
    text = text.replace(timeRegex, " ").trim();
  } else {
    // Check 24-hour e.g. "at 14:00" or "17:30"
    const militaryRegex = /\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/;
    const milMatch = text.match(militaryRegex);
    if (milMatch) {
      scheduledTime = `${milMatch[1].padStart(2, "0")}:${milMatch[2]}`;
      rawMatched.timeText = milMatch[0].trim();
      text = text.replace(militaryRegex, " ").trim();
    }
  }

  // 4. Category matching (optional)
  // Check if text ends with or includes "cat:Server" or "#Server" or explicit category keyword
  const tagRegex = /(?:#|cat:)([a-zA-Z0-9_-]+)/i;
  const tagMatch = text.match(tagRegex);
  if (tagMatch) {
    const foundCat = availableCategories.find(
      (c) => c.toLowerCase() === tagMatch[1].toLowerCase()
    );
    if (foundCat) {
      category = foundCat;
      rawMatched.categoryText = foundCat;
      text = text.replace(tagRegex, " ").trim();
    }
  }

  // Clean up punctuation and multiple spaces
  const cleanTitle = text
    .replace(/\s{2,}/g, " ")
    .replace(/^[-—:,.]\s*/, "")
    .replace(/\s*[-—:,.]\s*$/, "")
    .trim();

  return {
    title: cleanTitle || input.trim(),
    scheduledDate,
    scheduledTime,
    priority,
    category,
    rawMatched,
  };
}
