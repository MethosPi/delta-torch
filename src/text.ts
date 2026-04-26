export function normalizeBlock(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .trim();
}

export function asBulletList(values: string[]): string {
  if (values.length === 0) {
    return "- None recorded.";
  }

  return values.map((value) => `- ${value}`).join("\n");
}

export function splitCsvLike(values: string[]): string[] {
  return values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function compactJoin(parts: Array<string | undefined>): string | undefined {
  const cleaned = parts
    .map((part) => (part ? normalizeBlock(part) : ""))
    .filter(Boolean);

  if (cleaned.length === 0) {
    return undefined;
  }

  return Array.from(new Set(cleaned)).join("\n\n");
}

export function sanitizeReason(reason: string): string {
  return reason
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "manual";
}

export function formatTimestampForId(input: Date): string {
  return input.toISOString().replace(/:/g, "-").replace(/\.\d{3}Z$/, "Z");
}
