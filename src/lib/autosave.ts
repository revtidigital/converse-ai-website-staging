const PREFIX = 'blog_autosave_';

interface AutosaveData {
  data: unknown;
  savedAt: string;
}

/** Starts autosave interval + visibilitychange listener. Returns cleanup fn. */
export function startAutosave(
  key: string,
  getData: () => unknown,
  intervalMs = 30_000
): () => void {
  const save = () => {
    try {
      const payload: AutosaveData = { data: getData(), savedAt: new Date().toISOString() };
      localStorage.setItem(PREFIX + key, JSON.stringify(payload));
    } catch {
      // localStorage may be full or unavailable
    }
  };

  const timer = setInterval(save, intervalMs);

  const handleVisibility = () => {
    if (document.visibilityState === 'hidden') save();
  };
  document.addEventListener('visibilitychange', handleVisibility);

  const handleBeforeUnload = () => save();
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}

/** Loads autosave from localStorage. Returns null if not found. */
export function loadAutosave(key: string): { data: unknown; savedAt: Date } | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed: AutosaveData = JSON.parse(raw);
    return { data: parsed.data, savedAt: new Date(parsed.savedAt) };
  } catch {
    return null;
  }
}

/** Clears autosave entry from localStorage */
export function clearAutosave(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch { /* noop */ }
}

/** Returns human-readable age like "2 minutes ago" */
export function getAutosaveAge(savedAt: Date): string {
  const diffMs = Date.now() - savedAt.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return `${diffSecs} seconds ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  const diffHrs = Math.floor(diffMins / 60);
  return `${diffHrs} hour${diffHrs === 1 ? '' : 's'} ago`;
}
