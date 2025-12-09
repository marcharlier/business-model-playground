import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UsageRecord = {
  date: string;
  count: number;
};

const RATE_LIMIT_UPDATE_EVENT = "bmpl:rate-limit-update";

/**
 * Daily limit for AI feature usage across the application.
 * This is the maximum number of AI generations allowed per day.
 */
export const DAILY_AI_LIMIT = 10;

function formatLocalDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeNextLocalMidnight(from: Date): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1, 0, 0, 0, 0);
}

function formatResetIn(target: Date): string {
  const now = Date.now();
  const diffMs = Math.max(0, target.getTime() - now);
  const totalMinutes = Math.round(diffMs / 60000);
  if (totalMinutes <= 1) return "in 1m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `in ${minutes}m`;
  return `in ${hours}h ${minutes}m`;
}

// Synchronous storage read function for lazy initialization
function readStorageSync(key: string): UsageRecord {
  const today = formatLocalDateYYYYMMDD(new Date());
  if (typeof window === "undefined") return { date: today, count: 0 };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { date: today, count: 0 };
    const parsed = JSON.parse(raw) as UsageRecord;
    if (!parsed || typeof parsed.date !== "string" || typeof parsed.count !== "number") {
      return { date: today, count: 0 };
    }
    // Normalize to today if stored date is stale
    return parsed.date === today ? parsed : { date: today, count: 0 };
  } catch {
    return { date: today, count: 0 };
  }
}

export function useDailyRateLimit(featureKey: string, dailyLimit: number) {
  const storageKey = useMemo(() => `bmpl:usage:${featureKey}`, [featureKey]);

  // Lazy initialization from localStorage - runs synchronously on first render
  const [usage, setUsage] = useState<UsageRecord>(() => readStorageSync(`bmpl:usage:${featureKey}`));
  const [resetAt, setResetAt] = useState<Date>(() => computeNextLocalMidnight(new Date()));
  const [resetIn, setResetIn] = useState<string>(() => formatResetIn(computeNextLocalMidnight(new Date())));

  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const writeStorage = useCallback((record: UsageRecord) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(record));
    } catch {
      // ignore storage write errors
    }
  }, [storageKey]);

  const refresh = useCallback(() => {
    const today = formatLocalDateYYYYMMDD(new Date());
    const stored = readStorageSync(storageKey);
    const normalized = stored.date === today ? stored : { date: today, count: 0 };
    if (normalized.date !== stored.date || normalized.count !== stored.count) {
      writeStorage(normalized);
    }
    setUsage(normalized);
    const nextMidnight = computeNextLocalMidnight(new Date());
    setResetAt(nextMidnight);
    setResetIn(formatResetIn(nextMidnight));
  }, [storageKey, writeStorage]);

  // Schedule refresh at next midnight
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const now = Date.now();
    const ms = Math.max(0, resetAt.getTime() - now) + 50;
    timerRef.current = window.setTimeout(() => {
      refresh();
    }, ms);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [resetAt, refresh]);

  // Update the human-readable string periodically
  useEffect(() => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      setResetIn(formatResetIn(resetAt));
    }, 30000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [resetAt]);

  // Listen for updates from other hook instances
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail;
      if (detail.key === storageKey) {
        refresh();
      }
    };
    window.addEventListener(RATE_LIMIT_UPDATE_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(RATE_LIMIT_UPDATE_EVENT, handleUpdate);
    };
  }, [storageKey, refresh]);

  const increment = useCallback(() => {
    const today = formatLocalDateYYYYMMDD(new Date());
    const stored = readStorageSync(storageKey);
    const base = stored.date === today ? stored : { date: today, count: 0 };
    if (base.count >= dailyLimit) return;
    const updated = { date: today, count: base.count + 1 };
    writeStorage(updated);
    setUsage(updated);
    // Notify other hook instances to refresh
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(RATE_LIMIT_UPDATE_EVENT, { detail: { key: storageKey } }));
    }
  }, [dailyLimit, storageKey, writeStorage]);

  const limit = dailyLimit;
  const remaining = Math.max(0, limit - usage.count);
  const canUse = remaining > 0;

  return { count: usage.count, limit, remaining, canUse, resetAt, resetIn, increment, refresh, date: usage.date } as const;
}
