// A page loaded before a deploy calls server actions by IDs that the new deploy doesn't have (Next.js regenerates action
// IDs on every build). Next then throws UnrecognizedActionError and the add-to-cart / sign-up silently does nothing.
// Primary fix: Vercel Skew Protection (Project → Settings → Advanced), which routes those calls to the old deployment.
// This is the safety net: reload once so the visitor gets the current page, then let them retry.

const RELOAD_KEY = "hhara_stale_deploy_reload";

export function isStaleDeployError(err: unknown): boolean {
  const e = err as { name?: string; message?: string } | null;
  return (
    !!e &&
    (e.name === "UnrecognizedActionError" ||
      /was not found on the server|failed-to-find-server-action/i.test(e.message || ""))
  );
}

/** Reloads the page once if `err` is a stale server-action error. Returns true when it reloads. */
export function recoverFromStaleDeploy(err: unknown): boolean {
  if (typeof window === "undefined" || !isStaleDeployError(err)) return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 60_000) return false; // already reloaded a moment ago: don't loop
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // storage blocked: reload anyway, worst case once per failure
  }
  window.location.reload();
  return true;
}
