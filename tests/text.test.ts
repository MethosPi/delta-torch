import { describe, expect, it } from "vitest";
import {
  asBulletList,
  compactJoin,
  formatTimestampForId,
  normalizeBlock,
  sanitizeReason,
  splitCsvLike,
} from "../src/text.js";

describe("normalizeBlock", () => {
  it("converts CRLF to LF and trims trailing whitespace per line", () => {
    expect(normalizeBlock("first\r\nsecond  \r\nthird\t")).toBe("first\nsecond\nthird");
  });

  it("trims leading and trailing blank lines", () => {
    expect(normalizeBlock("\n\nbody\n\n")).toBe("body");
  });

  it("leaves single-line input untouched aside from trim", () => {
    expect(normalizeBlock("  hello  ")).toBe("hello");
  });
});

describe("asBulletList", () => {
  it("returns the empty placeholder when no values are provided", () => {
    expect(asBulletList([])).toBe("- None recorded.");
  });

  it("formats values as a markdown bullet list", () => {
    expect(asBulletList(["a", "b", "c"])).toBe("- a\n- b\n- c");
  });
});

describe("splitCsvLike", () => {
  it("splits comma-delimited values and trims each", () => {
    expect(splitCsvLike(["a, b , c"])).toEqual(["a", "b", "c"]);
  });

  it("flattens multiple inputs and drops empties", () => {
    expect(splitCsvLike(["a,b", "", " ,c, ,d"])).toEqual(["a", "b", "c", "d"]);
  });
});

describe("compactJoin", () => {
  it("returns undefined when every part is empty", () => {
    expect(compactJoin([undefined, "", "   "])).toBeUndefined();
  });

  it("joins distinct blocks with a blank line between them", () => {
    expect(compactJoin(["alpha", "beta"])).toBe("alpha\n\nbeta");
  });

  it("deduplicates identical blocks after normalization", () => {
    expect(compactJoin(["alpha", "alpha\n", "alpha  "])).toBe("alpha");
  });

  it("normalizes CRLF and trailing whitespace inside each block", () => {
    expect(compactJoin(["alpha\r\nline2  ", "beta"])).toBe("alpha\nline2\n\nbeta");
  });
});

describe("sanitizeReason", () => {
  it("lowercases and replaces non-alphanumeric runs with single dashes", () => {
    expect(sanitizeReason("Ready For Review")).toBe("ready-for-review");
    expect(sanitizeReason("plan -> implement")).toBe("plan-implement");
  });

  it("strips leading and trailing dashes", () => {
    expect(sanitizeReason("--context-limit--")).toBe("context-limit");
  });

  it("falls back to 'manual' for empty or fully sanitized input", () => {
    expect(sanitizeReason("")).toBe("manual");
    expect(sanitizeReason("   ")).toBe("manual");
    expect(sanitizeReason("!!!???")).toBe("manual");
  });

  it("clips the result at 48 characters", () => {
    const long = "a".repeat(60);
    const result = sanitizeReason(long);
    expect(result.length).toBe(48);
    expect(result).toBe("a".repeat(48));
  });
});

describe("formatTimestampForId", () => {
  it("replaces colons with dashes and drops milliseconds", () => {
    const date = new Date("2026-04-26T12:34:56.789Z");
    expect(formatTimestampForId(date)).toBe("2026-04-26T12-34-56Z");
  });

  it("is filesystem-safe (no characters outside [A-Za-z0-9._-])", () => {
    const date = new Date("2026-04-26T01:02:03.000Z");
    const id = formatTimestampForId(date);
    expect(id).toMatch(/^[A-Za-z0-9.\-]+$/);
  });
});
