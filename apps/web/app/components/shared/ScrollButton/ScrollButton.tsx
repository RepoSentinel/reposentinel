"use client";

import type { ReactNode } from "react";

/**
 * Renders a <button> that smooth-scrolls to an element by id.
 * Respects `prefers-reduced-motion`; falls back to instant scroll when set.
 */
export function ScrollButton({
  targetId,
  className,
  children,
}: {
  targetId: string;
  className?: string;
  children: ReactNode;
}) {
  function handleClick() {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById(targetId)?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
