import Link from "next/link";
import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import type { Components } from "react-markdown";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Tags stripped from the HAST before JSX (defense in depth with `skipHtml` and
 * `defaultUrlTransform` on links/images).
 */
export const MARKDOWN_DISALLOWED_ELEMENTS = [
  "script",
  "iframe",
  "object",
  "embed",
  "base",
  "link",
  "meta",
  "style",
  "form",
  "title",
] as const;

const ALERT_TITLE: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
};

function plainTextFromNode(node: ReactNode): string {
  let out = "";
  Children.forEach(node, (child) => {
    if (child == null || typeof child === "boolean") return;
    if (typeof child === "string" || typeof child === "number") {
      out += String(child);
      return;
    }
    if (isValidElement(child)) {
      const props = child.props as Record<string, unknown>;
      if (props != null && typeof props === "object" && "children" in props) {
        out += plainTextFromNode(props.children as ReactNode);
      }
    }
  });
  return out.trim();
}

function flattenChildrenDeep(nodes: ReactNode): ReactNode[] {
  const acc: ReactNode[] = [];
  Children.forEach(nodes, (node) => {
    if (node == null || node === false) return;
    if (isValidElement(node) && node.type === Fragment) {
      acc.push(
        ...flattenChildrenDeep(
          (node.props as { children?: ReactNode }).children,
        ),
      );
    } else {
      acc.push(node);
    }
  });
  return acc;
}

const ALERT_LEAD_PLAIN = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i;

function stripAlertLeadFromParagraphChildren(
  children: ReactNode,
  kind: string,
): ReactNode[] {
  const prefix = new RegExp(`^\\s*\\[!${kind}\\]\\s*(?:\\n|\r\n|$)`, "i");
  const parts = flattenChildrenDeep(children);
  if (parts.length === 0) return [];
  const head = parts[0];
  if (typeof head !== "string") return parts;
  const m = head.match(prefix);
  if (!m) return parts;
  const rest = head.slice(m[0].length);
  const tail = [...(rest.length ? [rest] : []), ...parts.slice(1)];
  return tail.filter((c) => c != null && c !== false && c !== "");
}

/**
 * GitHub-flavored blockquote alerts (`> [!WARNING]` first line) rendered as
 * alert panels (custom component; same class names as typical GFM alert markup).
 */
function GithubAlertBlockquote({
  children,
}: React.ComponentPropsWithoutRef<"blockquote">) {
  const items = flattenChildrenDeep(children);
  const firstElement = items.find(
    (n): n is ReactElement<{ children?: ReactNode }> => {
      if (!isValidElement(n)) return false;
      const props = n.props as Record<string, unknown>;
      return props != null && typeof props === "object" && "children" in props;
    },
  );

  if (firstElement) {
    const pChildren = firstElement.props.children;
    if (pChildren == null) {
      return <blockquote>{children}</blockquote>;
    }
    const full = plainTextFromNode(pChildren);
    const lead = full.match(ALERT_LEAD_PLAIN);
    if (lead?.[1]) {
      const kind = lead[1].toLowerCase();
      const title = ALERT_TITLE[kind] ?? kind;
      const tailNodes = stripAlertLeadFromParagraphChildren(pChildren, kind);
      const tail = tailNodes.length ? <p>{tailNodes}</p> : null;
      const restItems = items.filter((n) => n !== firstElement);
      return (
        <div className={`markdown-alert markdown-alert-${kind}`}>
          <p className="markdown-alert-title">{title}</p>
          {tail}
          {restItems}
        </div>
      );
    }
  }

  return <blockquote>{children}</blockquote>;
}

export const defaultMarkdownLink: NonNullable<Components["a"]> = ({
  href,
  children,
}) => {
  if (!href) return <span>{children}</span>;
  if (href.startsWith("/")) {
    return <Link href={href}>{children}</Link>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

const baseMarkdownComponents: Partial<Components> = {
  a: defaultMarkdownLink,
};

export type MarkdownContentProps = {
  /** Markdown source string. */
  children: string;
  className?: string;
  /**
   * When true, `> [!NOTE]` / `[!TIP]` / … first lines become alert panels
   * (GitHub-style blockquote alerts).
   */
  githubAlertCallouts?: boolean;
  /** Merged after built-ins; overrides `blockquote` when alerts are off. */
  components?: Partial<Components>;
};

/**
 * Renders markdown to React (GFM). Hardens parsing with `skipHtml`, a small
 * disallowed-element list, and safe URL handling — no raw HTML pass-through.
 */
export function MarkdownContent({
  children,
  className,
  githubAlertCallouts = false,
  components: componentsProp,
}: MarkdownContentProps) {
  const components: Partial<Components> = {
    ...baseMarkdownComponents,
    ...componentsProp,
    ...(githubAlertCallouts ? { blockquote: GithubAlertBlockquote } : {}),
  };

  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm]}
      skipHtml
      disallowedElements={[...MARKDOWN_DISALLOWED_ELEMENTS]}
      urlTransform={defaultUrlTransform}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
