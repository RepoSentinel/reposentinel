import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { MarkdownContent } from "../app/components/shared/MarkdownContent/MarkdownContent";

describe("MarkdownContent", () => {
  it("renders GitHub blockquote alert panels when enabled", () => {
    const md = `> [!WARNING]\n> **Risky** - test.`;
    const html = renderToStaticMarkup(
      <MarkdownContent githubAlertCallouts={true}>{md}</MarkdownContent>,
    );
    expect(html).toContain("markdown-alert-warning");
    expect(html).toContain("markdown-alert-title");
    expect(html).toContain("Warning");
    expect(html).toContain("Risky");
  });

  it("strips disallowed tags from markdown", () => {
    const md = `Hello\n\n<script>evil()</script>\n\nWorld`;
    const html = renderToStaticMarkup(<MarkdownContent>{md}</MarkdownContent>);
    expect(html).not.toContain("script");
    expect(html).toContain("Hello");
    expect(html).toContain("World");
  });

  it("neutralizes javascript: URLs in links", () => {
    const md = `[x](javascript:alert(1))`;
    const html = renderToStaticMarkup(<MarkdownContent>{md}</MarkdownContent>);
    expect(html).not.toContain("javascript:");
  });

  it("strips img onerror from inline HTML", () => {
    const md = `Hello\n\n<img src=x onerror=alert(1)>\n\nWorld`;
    const html = renderToStaticMarkup(<MarkdownContent>{md}</MarkdownContent>);
    expect(html).not.toContain("onerror");
    expect(html).toContain("Hello");
    expect(html).toContain("World");
  });

  it("strips svg onload from inline HTML", () => {
    const md = `Hello\n\n<svg onload=alert(1)></svg>\n\nWorld`;
    const html = renderToStaticMarkup(<MarkdownContent>{md}</MarkdownContent>);
    expect(html).not.toContain("onload");
    expect(html).toContain("Hello");
    expect(html).toContain("World");
  });

  it("neutralizes javascript: URLs in markdown images", () => {
    const md = `![x](javascript:alert(1))`;
    const html = renderToStaticMarkup(<MarkdownContent>{md}</MarkdownContent>);
    expect(html).not.toContain("javascript:");
  });

  it("renders a very long string without throwing", () => {
    const md = "a".repeat(50_000);
    expect(() =>
      renderToStaticMarkup(<MarkdownContent>{md}</MarkdownContent>),
    ).not.toThrow();
  });
});
