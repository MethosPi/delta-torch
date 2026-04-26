import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const skillsRoot = join(process.cwd(), "skills");

function parseFrontmatter(markdown: string): Record<string, string> {
  const match = /^---\n([\s\S]+?)\n---/m.exec(markdown);
  if (!match) {
    throw new Error("Missing frontmatter");
  }

  const body = match[1] ?? "";

  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");
      accumulator[key] = value;
      return accumulator;
    }, {});
}

describe("skill pack", () => {
  it("ships valid frontmatter and documented CLI commands", async () => {
    const directories = await readdir(skillsRoot);

    for (const directory of directories) {
      const skillPath = join(skillsRoot, directory, "SKILL.md");
      const markdown = await readFile(skillPath, "utf8");
      const frontmatter = parseFrontmatter(markdown);

      expect(frontmatter.name).toBeTruthy();
      expect(frontmatter.description).toBeTruthy();

      if (directory === "handoff-save") {
        expect(markdown).toContain("pnpm dlx agent-handoff save");
      }

      if (directory === "handoff-resume") {
        expect(markdown).toContain("pnpm dlx agent-handoff resume");
      }

      if (directory === "handoff-status") {
        expect(markdown).toContain("pnpm dlx agent-handoff list");
      }
    }
  });
});
