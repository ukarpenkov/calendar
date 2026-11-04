type IdleRuntime = typeof globalThis & {
  requestIdleCallback?: (callback: () => void) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/** RN 0.84 provides idle callbacks at runtime, but not in its TS globals. */
export function scheduleIdleTask(callback: () => void): () => void {
  const runtime = globalThis as IdleRuntime;
  if (runtime.requestIdleCallback && runtime.cancelIdleCallback) {
    const handle = runtime.requestIdleCallback(callback);
    return () => runtime.cancelIdleCallback?.(handle);
  }
  const timer = setTimeout(callback, 32);
  return () => clearTimeout(timer);
}
