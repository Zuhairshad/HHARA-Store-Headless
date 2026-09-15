"use client";
// Thin client wrapper: accepts the server-rendered hero as a child (slot
// pattern) so HeroServer stays a true Server Component, while this component
// can use useEffect to hide the shell once HharaApp has hydrated.
import { useEffect } from "react";

export default function ServerHeroShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // First useEffect fires after React has mounted the full client tree.
    // By this point HharaApp's own hero is rendered, so it is safe to hide
    // the server shell — it has already served its LCP purpose.
    const shell = document.getElementById("server-hero-shell");
    if (shell) {
      shell.style.display = "none";
    }
  }, []);

  return (
    <div
      id="server-hero-shell"
      style={{
        // Overlay the .app container's hero slot so only one hero is visible
        // before hydration completes.
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        // Disable pointer events so the shell doesn't block interaction in
        // the brief window before it is hidden.
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}
