import type { RichText } from "../types";

export function toTextProps(
  body: string | RichText[],
  defaults: { fontSize?: number; color?: string; fontFace?: string } = {}
): Array<{
  text: string;
  options: Record<string, unknown>;
}> {
  if (typeof body === "string") {
    return body.split("\n").map((line, i, arr) => ({
      text: line,
      options: {
        fontSize: defaults.fontSize,
        color: defaults.color,
        fontFace: defaults.fontFace,
        breakType: i < arr.length - 1 ? "paragraph" : undefined,
      },
    }));
  }

  return body.map((rt) => ({
    text: rt.text,
    options: {
      fontSize: rt.fontSize ?? defaults.fontSize,
      color: rt.color ?? defaults.color,
      fontFace: defaults.fontFace,
      bold: rt.bold,
      italic: rt.italic,
      breakType: rt.breakType === "paragraph"
        ? "paragraph"
        : rt.breakType === "line"
          ? "line"
          : undefined,
    },
  }));
}

export function formatDate(date?: string): string {
  if (date) return date;
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}
