import { useEffect, useState } from 'react';

interface VisitorCounts {
  current: number;
  today: number;
  lifetime: number;
}

const PING_INTERVAL_MS = 30_000; // 30 seconds

function uuidv4(): string {
  // crypto.randomUUID() requires a secure context (HTTPS).
  // Fall back to Math.random-based UUID v4 for plain HTTP (Docker local).
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem('visitor_id');
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem('visitor_id', id);
  }
  return id;
}

async function ping(sessionId: string): Promise<VisitorCounts | null> {
  try {
    const res = await fetch('/api/visitors/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useVisitors(): VisitorCounts | null {
  const [counts, setCounts] = useState<VisitorCounts | null>(null);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();

    // Initial ping on mount
    ping(sessionId).then(data => { if (data) setCounts(data); });

    // Keep-alive ping every 30s
    const interval = setInterval(() => {
      ping(sessionId).then(data => { if (data) setCounts(data); });
    }, PING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return counts;
}
