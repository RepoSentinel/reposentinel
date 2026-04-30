"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./CodeBlock.module.css";

export type CodeBlockProps = {
  /** Raw text shown in the block (and copied). */
  text: string;
  copyLabel?: string;
};

/**
 * Bordered code panel: code and copy control in a flex row with token gap.
 */
export function CodeBlock({
  text,
  copyLabel = "Copy to clipboard",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setCopied(false);
        resetTimerRef.current = null;
      }, 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <div className={styles.shell}>
      <pre className={styles.pre}>
        <code>{text}</code>
      </pre>
      <button
        type="button"
        className={styles.copyBtn}
        onClick={handleCopy}
        aria-label={copied ? "Copied" : copyLabel}
        title={copied ? "Copied" : copyLabel}
      >
        {copied ? (
          <Check size={16} strokeWidth={2} aria-hidden />
        ) : (
          <Copy size={16} strokeWidth={2} aria-hidden />
        )}
      </button>
    </div>
  );
}
