"use client";

// Lightweight localStorage-backed "Remember Progress" helper for the
// YouTube course player (SRD: Video Player > Remember Progress).

const STORAGE_KEY = "harshdev_video_progress_v1";

interface ProgressMap {
  [courseId: string]: { time: number; duration: number; updatedAt: number };
}

function readAll(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeAll(data: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full / unavailable — fail silently, non-critical feature
  }
}

export function getProgress(courseId: number): { time: number; duration: number } | null {
  const all = readAll();
  const entry = all[String(courseId)];
  return entry ? { time: entry.time, duration: entry.duration } : null;
}

export function saveProgress(courseId: number, time: number, duration: number) {
  const all = readAll();
  all[String(courseId)] = { time, duration, updatedAt: Date.now() };
  writeAll(all);
}

export function clearProgress(courseId: number) {
  const all = readAll();
  delete all[String(courseId)];
  writeAll(all);
}

// Returns true if the saved position is meaningful enough to resume from
// (watched more than 8s, and not already within the last ~12s of the video).
export function shouldResume(time: number, duration: number): boolean {
  if (!duration || duration <= 0) return time > 8;
  return time > 8 && time < duration - 12;
}
