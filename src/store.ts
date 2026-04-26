import { mkdir, readFile, stat, writeFile, cp, chmod } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, parse, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONFIG_FILE_NAME,
  DEFAULT_LANGUAGE,
  HANDOFF_DIR_NAME,
  HANDOFF_FORMAT_VERSION,
  HANDOFFS_DIR_NAME,
  REGISTRY_FILE_NAME,
} from "./constants.js";
import type { HandoffConfig, RegistryEntry, RegistryFile } from "./types.js";

export class UserFacingError extends Error {}

function packageRootFromImportMeta(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const sourceLikeRoot = resolve(currentDir, "..");
  if (existsSync(join(sourceLikeRoot, "skills"))) {
    return sourceLikeRoot;
  }

  return resolve(currentDir, "../..");
}

export function bundledSkillsDir(): string {
  return join(packageRootFromImportMeta(), "skills");
}

export function handoffPaths(projectRoot: string) {
  const handoffRoot = join(projectRoot, HANDOFF_DIR_NAME);
  return {
    projectRoot,
    handoffRoot,
    configPath: join(handoffRoot, CONFIG_FILE_NAME),
    registryPath: join(handoffRoot, REGISTRY_FILE_NAME),
    handoffsDir: join(handoffRoot, HANDOFFS_DIR_NAME),
  };
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function initProject(projectRoot: string): Promise<string[]> {
  const paths = handoffPaths(projectRoot);
  const created: string[] = [];

  await mkdir(paths.handoffsDir, { recursive: true });

  if (!(await pathExists(paths.configPath))) {
    const config: HandoffConfig = {
      version: HANDOFF_FORMAT_VERSION,
      createdAt: new Date().toISOString(),
      language: DEFAULT_LANGUAGE,
    };
    await writeFile(paths.configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
    created.push(paths.configPath);
  }

  if (!(await pathExists(paths.registryPath))) {
    const registry: RegistryFile = {
      version: HANDOFF_FORMAT_VERSION,
      activeHandoffId: null,
      nextTaskNumber: 1,
      entries: [],
    };
    await writeFile(
      paths.registryPath,
      `${JSON.stringify(registry, null, 2)}\n`,
      "utf8",
    );
    created.push(paths.registryPath);
  }

  return created;
}

export function findProjectRootWithHandoff(startCwd: string): string | null {
  let current = resolve(startCwd);
  const { root } = parse(current);

  while (true) {
    const configPath = join(current, HANDOFF_DIR_NAME, CONFIG_FILE_NAME);
    if (existsSync(configPath)) {
      return current;
    }

    if (current === root) {
      return null;
    }

    current = dirname(current);
  }
}
export async function ensureInitializedProject(startCwd: string): Promise<string> {
  const projectRoot = findProjectRootWithHandoff(startCwd);
  if (!projectRoot) {
    throw new UserFacingError(
      "No .handoff directory found. Run `delta-torch init` in your project first.",
    );
  }

  return projectRoot;
}

export async function readRegistry(projectRoot: string): Promise<RegistryFile> {
  const { registryPath } = handoffPaths(projectRoot);
  const raw = await readFile(registryPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<RegistryFile> & {
    entries?: Array<Partial<RegistryEntry>>;
  };
  const normalizedEntries = (parsed.entries ?? []).map((entry, index) => ({
    taskNumber: entry.taskNumber ?? index + 1,
    id: entry.id ?? `legacy-${index + 1}`,
    createdAt: entry.createdAt ?? new Date(0).toISOString(),
    reason: entry.reason ?? "manual",
    agentName: entry.agentName ?? "unknown-agent",
    branch: entry.branch ?? null,
    file: entry.file ?? "",
  }));
  const nextTaskNumber =
    parsed.nextTaskNumber ??
    normalizedEntries.reduce((maxValue, entry) => Math.max(maxValue, entry.taskNumber), 0) +
      1;

  return {
    version: parsed.version ?? HANDOFF_FORMAT_VERSION,
    activeHandoffId: parsed.activeHandoffId ?? null,
    nextTaskNumber,
    entries: normalizedEntries,
  };
}

export async function writeRegistry(
  projectRoot: string,
  registry: RegistryFile,
): Promise<void> {
  const { registryPath } = handoffPaths(projectRoot);
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

export async function writeHandoffFile(
  projectRoot: string,
  filename: string,
  markdown: string,
): Promise<string> {
  const { handoffsDir } = handoffPaths(projectRoot);
  const path = join(handoffsDir, filename);
  await writeFile(path, markdown, "utf8");
  return path;
}

export function relativeToProject(projectRoot: string, absolutePath: string): string {
  return relative(projectRoot, absolutePath) || ".";
}

export async function installSkills(options: {
  cwd: string;
  target: "project" | "personal";
  force: boolean;
}): Promise<string> {
  const sourceDir = bundledSkillsDir();
  const targetDir =
    options.target === "project"
      ? join(resolve(options.cwd), ".claude", "skills")
      : join(resolve(process.env.HOME ?? "~"), ".claude", "skills");

  await mkdir(targetDir, { recursive: true });
  await cp(sourceDir, targetDir, {
    recursive: true,
    force: options.force,
    errorOnExist: !options.force,
  });

  for (const scriptPath of [
    join(targetDir, "handoff-save", "scripts", "save.sh"),
    join(targetDir, "handoff-resume", "scripts", "resume.sh"),
    join(targetDir, "handoff-status", "scripts", "status.sh"),
  ]) {
    if (await pathExists(scriptPath)) {
      await chmod(scriptPath, 0o755);
    }
  }

  return targetDir;
}
