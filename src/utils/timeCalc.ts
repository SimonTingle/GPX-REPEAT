/** Parse "MM:SS" string → total seconds. Returns 0 on bad input. */
export function parseMmSs(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  const parts = value.trim().split(':');
  if (parts.length !== 2) return 0;
  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1], 10);
  if (isNaN(mins) || isNaN(secs)) return 0;
  return mins * 60 + secs;
}

/** Parse "HH:MM" string → minutes since midnight. Returns -1 on bad input. */
export function parseHhMm(value: string): number {
  if (!value || typeof value !== 'string') return -1;
  const parts = value.trim().split(':');
  if (parts.length !== 2) return -1;
  const hours = parseInt(parts[0], 10);
  const mins = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(mins)) return -1;
  return hours * 60 + mins;
}

/** Format total seconds as "H:MM:SS" */
export function formatDuration(totalSecs: number): string {
  const s = Math.round(totalSecs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return `${h}:${mm}:${ss}`;
}

/** Format "MM:SS" from a seconds value (for per-lap display) */
export function formatMmSs(totalSecs: number): string {
  const s = Math.round(totalSecs);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Format a finish time from start (minutes since midnight) + duration (seconds).
 * Wraps past midnight. Returns "HH:MM".
 */
export function formatFinishTime(startMins: number, durationSecs: number): string {
  const totalMins = startMins + Math.round(durationSecs / 60);
  const wrapped = ((totalMins % 1440) + 1440) % 1440; // wrap 24 h
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface TimingResult {
  lapSecs: number;      // duration of one lap
  restSecs: number;     // total rest across all gaps
  totalSecs: number;    // full event duration
  finishTime: string;   // "HH:MM" or "" if no startTime
}

/**
 * Calculate full timing for a multi-lap route.
 * reps = 0 is treated as 1 lap.
 * Rest applies between laps only (not after the final lap).
 */
export function calcTiming(
  distance: number,
  reps: number,
  targetPace: string,
  startTime: string,
  restTime: string,
): TimingResult {
  const effectiveReps = Math.max(1, reps);
  const paceSecs = parseMmSs(targetPace);      // seconds per km
  const restPerGap = parseMmSs(restTime);      // seconds per rest gap
  const gaps = Math.max(0, effectiveReps - 1);

  const lapSecs = distance * paceSecs;
  const restSecs = restPerGap * gaps;
  const totalSecs = lapSecs * effectiveReps + restSecs;

  const startMins = parseHhMm(startTime);
  const finishTime = startMins >= 0 ? formatFinishTime(startMins, totalSecs) : '';

  return { lapSecs, restSecs, totalSecs, finishTime };
}
