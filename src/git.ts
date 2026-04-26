import { spawnSync } from "node:child_process";
import type { GitChangedFile, GitContext } from "./types.js";
import { isSensitivePath } from "./security.js";

function runGit(cwd: string, args: string[]): string | null {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trimEnd();
}

function parseChangedFiles(statusLines: string[]): GitChangedFile[] {
  return statusLines
    .map((line) => {
      const status = line.slice(0, 2).trim() || line.slice(0, 1);
      const rawPath = line.slice(3).trim();
      const normalizedPath = rawPath.includes(" -> ")
        ? rawPath.split(" -> ").at(-1) ?? rawPath
        : rawPath;

      return {
        status,
        path: normalizedPath,
      };
    })
    .filter((entry) => entry.path.length > 0)
    .filter((entry) => !isSensitivePath(entry.path));
}

export function collectGitContext(cwd: string): GitContext {
  const root = runGit(cwd, ["rev-parse", "--show-toplevel"]);
  if (!root) {
    return {
      isRepo: false,
      root: null,
      branch: null,
      statusLines: [],
      changedFiles: [],
    };
  }

  const branch =
    runGit(cwd, ["symbolic-ref", "--quiet", "--short", "HEAD"]) ??
    runGit(cwd, ["rev-parse", "--short", "HEAD"]);
  const statusOutput = runGit(cwd, ["status", "--short"]) ?? "";
  const statusLines = statusOutput
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .filter((line) => !isSensitivePath(line.slice(3).trim()));

  return {
    isRepo: true,
    root,
    branch: branch ?? null,
    statusLines,
    changedFiles: parseChangedFiles(statusLines),
  };
}
