import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UsageRecord = {
  date: string;
  count: number;
};

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

export function useDailyRateLimit(featureKey: string, dailyLimit: number) {
  const storageKey = useMemo(() => `bmpl:usage:${featureKey}`, [featureKey]);
  const [count, setCount] = useState(0);
  const [dateStr, setDateStr] = useState<string | null>(null);
  const [resetAt, setResetAt] = useState<Date>(() => computeNextLocalMidnight(new Date()));
  const [resetIn, setResetIn] = useState<string>(formatResetIn(resetAt));
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const readStorage = useCallback((): UsageRecord => {
    if (typeof window === "undefined") return { date: formatLocalDateYYYYMMDD(new Date()), count: 0 };
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return { date: formatLocalDateYYYYMMDD(new Date()), count: 0 };
      const parsed = JSON.parse(raw) as UsageRecord;
      if (!parsed || typeof parsed.date !== "string" || typeof parsed.count !== "number") {
        return { date: formatLocalDateYYYYMMDD(new Date()), count: 0 };
      }
      return parsed;
    } catch {
      return { date: formatLocalDateYYYYMMDD(new Date()), count: 0 };
    }
  }, [storageKey]);

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
    const stored = readStorage();
    const normalized = stored.date === today ? stored : { date: today, count: 0 };
    if (normalized !== stored) writeStorage(normalized);
    setCount(normalized.count);
    setDateStr(normalized.date);
    const nextMidnight = computeNextLocalMidnight(new Date());
    setResetAt(nextMidnight);
    setResetIn(formatResetIn(nextMidnight));
  }, [readStorage, writeStorage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // schedule refresh at next midnight
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

  // update the human string periodically
  useEffect(() => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      setResetIn(formatResetIn(resetAt));
    }, 30000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [resetAt]);

  const increment = useCallback(() => {
    const today = formatLocalDateYYYYMMDD(new Date());
    const stored = readStorage();
    const base = stored.date === today ? stored : { date: today, count: 0 };
    if (base.count >= dailyLimit) return;
    const updated = { date: today, count: base.count + 1 };
    writeStorage(updated);
    setCount(updated.count);
    setDateStr(updated.date);
  }, [dailyLimit, readStorage, writeStorage]);

  const limit = dailyLimit;
  const remaining = Math.max(0, limit - count);
  const canUse = remaining > 0;

  return { count, limit, remaining, canUse, resetAt, resetIn, increment, refresh, date: dateStr } as const;
}


