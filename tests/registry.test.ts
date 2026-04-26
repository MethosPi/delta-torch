import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { saveHandoff } from "../src/handoff.js";
import { initProject } from "../src/store.js";

describe("registry updates", () => {
  it("creates an active registry entry after save", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-handoff-registry-"));
    await initProject(root);

    const result = await saveHandoff({
      cwd: root,
      reason: "context-limit",
      now: new Date("2026-04-26T12:30:00Z"),
      sections: {
        goal: "Ship v1.",
      },
    });

    const registry = JSON.parse(
      await readFile(join(root, ".handoff", "registry.json"), "utf8"),
    ) as {
      activeHandoffId: string | null;
      entries: Array<{ id: string }>;
    };

    expect(result.id).toBe("2026-04-26T12-30-00Z-context-limit");
    expect(registry.activeHandoffId).toBe(result.id);
    expect(registry.entries[0]?.id).toBe(result.id);
  });
});
