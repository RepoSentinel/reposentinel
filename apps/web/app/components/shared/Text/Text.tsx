import {
  createElement,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

const VARIANT_TO_SIZE = {
  "2xs": "var(--ms-text-2xs)",
  xs: "var(--ms-text-xs)",
  sm: "var(--ms-text-sm)",
  md: "var(--ms-text-md)",
  base: "var(--ms-text-base)",
  lg: "var(--ms-text-lg)",
  xl: "var(--ms-text-xl)",
  "2xl": "var(--ms-text-2xl)",
} as const;

const WEIGHT_TO_VAR = {
  regular: "var(--ms-font-weight-regular)",
  medium: "var(--ms-font-weight-medium)",
  semibold: "var(--ms-font-weight-semibold)",
  bold: "var(--ms-font-weight-bold)",
} as const;

export type TextVariant = keyof typeof VARIANT_TO_SIZE;
export type TextWeight = keyof typeof WEIGHT_TO_VAR;

type TextProps = {
  variant?: TextVariant;
  weight?: TextWeight;
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "style" | "children">;

export function Text({
  variant = "base",
  weight = "regular",
  as = "span",
  children,
  style,
  ...rest
}: TextProps) {
  return createElement(
    as,
    {
      ...rest,
      style: {
        fontSize: VARIANT_TO_SIZE[variant],
        fontWeight: WEIGHT_TO_VAR[weight],
        ...style,
      },
    },
    children,
  );
}
