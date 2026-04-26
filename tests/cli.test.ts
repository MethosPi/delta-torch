import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();
const cliPath = join(workspaceRoot, "dist", "cli.js");

function runCli(
  args: string[],
  options: {
    cwd: string;
    input?: string;
  },
) {
  return spawnSync("node", [cliPath, ...args], {
    cwd: options.cwd,
    encoding: "utf8",
    input: options.input,
  });
}

function runGit(args: string[], cwd: string) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${args.join(" ")} failed`);
  }
}

beforeAll(() => {
  const probe = spawnSync("node", [cliPath, "help"], {
    cwd: workspaceRoot,
    encoding: "utf8",
  });

  if (probe.status !== 0) {
    throw new Error("CLI build artifact is missing. Run pnpm build first.");
  }
});

describe("cli", () => {
  it("initializes the handoff directory", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-handoff-init-"));
    const result = runCli(["init"], { cwd: root });

    expect(result.status).toBe(0);
    const config = await readFile(join(root, ".handoff", "config.json"), "utf8");
    expect(config).toContain(`"language": "en"`);
  });

  it("fails to save when .handoff is missing", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-handoff-missing-"));
    const result = runCli(["save", "--reason", "manual"], { cwd: root });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Run `delta-torch init`");
  });

  it("saves, lists, and resumes in a non-git folder", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-handoff-nongit-"));
    runCli(["init"], { cwd: root });

    const save = runCli(["save", "--reason", "manual"], {
      cwd: root,
      input: `## Goal
Ship v1.

## Next Steps
Push it.
`,
    });

    expect(save.status).toBe(0);
    expect(save.stdout).toContain("Saved task #1");

    const list = runCli(["list"], { cwd: root });
    expect(list.stdout).toContain("#1");
    expect(list.stdout).toContain("manual");

    const resume = runCli(["resume", "1"], { cwd: root });
    expect(resume.stdout).toContain("Task: #1");
    expect(resume.stdout).toContain("## Resume Prompt");
    expect(resume.stdout).toContain("Checkpoint:");
  });

  it("captures git branch and dirty files", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-handoff-git-"));
    runGit(["init"], root);
    runGit(["config", "user.name", "DeltaTorch Test"], root);
    runGit(["config", "user.email", "test@example.com"], root);
    await writeFile(join(root, "tracked.txt"), "hello\n", "utf8");
    runGit(["add", "tracked.txt"], root);
    runGit(["commit", "-m", "init"], root);
    await writeFile(join(root, "tracked.txt"), "hello\nworld\n", "utf8");

    runCli(["init"], { cwd: root });
    const save = runCli(["save", "--reason", "context-limit"], {
      cwd: root,
      input: `## Goal
Keep going.
`,
    });

    expect(save.status).toBe(0);
    const handoffPath = save.stdout.trim().split("\n").at(-1);
    expect(handoffPath).toBeTruthy();
    const markdown = await readFile(handoffPath!, "utf8");
    expect(markdown).toContain("Current branch:");
    expect(markdown).toContain("tracked.txt");
  });

  it("installs project skills", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-handoff-skills-"));
    const result = runCli(["install-skills", "--target", "project"], { cwd: root });

    expect(result.status).toBe(0);
    const skill = await readFile(
      join(root, ".claude", "skills", "handoff-save", "SKILL.md"),
      "utf8",
    );
    expect(skill).toContain("pnpm dlx delta-torch save");
  });
});
