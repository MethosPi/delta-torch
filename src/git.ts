import { spawnSync } from "node:child_process";
import type { GitChangedFile, GitContext } from "./types.js";
import { isSensitivePath } from "./security.js";
import { HANDOFF_DIR_NAME } from "./constants.js";

function runGit(cwd: string, args: string[]): string | null {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
  });

  if (result.error) {
    process.stderr.write(
      `delta-torch: git ${args.join(" ")} could not be executed: ${result.error.message}\n`,
    );
    return null;
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    if (stderr && !isBenignGitError(stderr)) {
      process.stderr.write(
        `delta-torch: git ${args.join(" ")} failed (exit ${result.status}): ${stderr}\n`,
      );
    }
    return null;
  }

  return result.stdout.trimEnd();
}

function isBenignGitError(stderr: string): boolean {
  return /not a git repository/i.test(stderr);
}

function parseChangedFiles(statusLines: string[]): GitChangedFile[] {
  return statusLines
    .map((line) => {
      const status = line.slice(0, 2).trim() || line.slice(0, 1);
      const rawPath = line.slice(3).trim();
      const normalizedPath = normalizeStatusPath(rawPath);

      return {
        status,
        path: normalizedPath,
      };
    })
    .filter((entry) => entry.path.length > 0)
    .filter((entry) => !isHandoffMetadataPath(entry.path))
    .filter((entry) => !isSensitivePath(entry.path));
}

function normalizeStatusPath(rawPath: string): string {
  return rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) ?? rawPath : rawPath;
}

function isHandoffMetadataPath(pathLike: string): boolean {
  return pathLike === HANDOFF_DIR_NAME || pathLike.startsWith(`${HANDOFF_DIR_NAME}/`);
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
    .filter((line) => {
      const path = normalizeStatusPath(line.slice(3).trim());
      return !isSensitivePath(path) && !isHandoffMetadataPath(path);
    });

  return {
    isRepo: true,
    root,
    branch: branch ?? null,
    statusLines,
    changedFiles: parseChangedFiles(statusLines),
  };
}
