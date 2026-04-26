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
      nextTaskNumber: number;
      entries: Array<{ id: string; taskNumber: number }>;
    };

    expect(result.id).toBe("2026-04-26T12-30-00Z-context-limit");
    expect(result.taskNumber).toBe(1);
    expect(registry.activeHandoffId).toBe(result.id);
    expect(registry.nextTaskNumber).toBe(2);
    expect(registry.entries[0]?.taskNumber).toBe(1);
    expect(registry.entries[0]?.id).toBe(result.id);
  });
});
