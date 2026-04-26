import { join } from "node:path";
import {
  compactJoin,
  formatTimestampForId,
  sanitizeReason,
  asBulletList,
} from "./text.js";
import { collectGitContext } from "./git.js";
import {
  ensureInitializedProject,
  handoffPaths,
  readRegistry,
  relativeToProject,
  writeHandoffFile,
  writeRegistry,
} from "./store.js";
import type {
  HandoffSections,
  RegistryEntry,
  SaveCommandInput,
  SaveCommandResult,
  SectionKey,
} from "./types.js";
import {
  materializeSections,
  parseMarkdownSections,
  renderHandoffMarkdown,
} from "./sections.js";

function detectAgentName(input?: string): string {
  if (input?.trim()) {
    return input.trim();
  }

  if (process.env.AGENT_HANDOFF_AGENT?.trim()) {
    return process.env.AGENT_HANDOFF_AGENT.trim();
  }

  if (process.env.CLAUDE_SESSION_ID) {
    return "claude-code";
  }

  if (process.env.CODEX_HOME || process.env.CODEX_SANDBOX) {
    return "codex";
  }

  return process.env.USER ?? "unknown-agent";
}

function appendGitState(
  currentState: string | undefined,
  cwd: string,
  branch: string | null,
  statusLines: string[],
): string {
  const autoState = branch
    ? [
        `- Working directory: ${cwd}`,
        `- Current branch: ${branch}`,
        statusLines.length > 0
          ? `- Git status snapshot:\n\`\`\`text\n${statusLines.join("\n")}\n\`\`\``
          : "- Git working tree snapshot: clean.",
      ].join("\n")
    : "- Git context: this project is not inside a git repository.";

  return compactJoin([currentState, autoState]) ?? autoState;
}

function buildFilesSection(
  provided: string | undefined,
  fileHints: string[],
  gitFiles: string[],
): string {
  const autoFiles =
    fileHints.length > 0 || gitFiles.length > 0
      ? compactJoin([
          fileHints.length > 0 ? asBulletList(fileHints) : undefined,
          gitFiles.length > 0 ? asBulletList(gitFiles) : undefined,
        ])
      : "- No changed files detected.";

  return compactJoin([provided, autoFiles]) ?? "- No changed files detected.";
}

function buildCommandsSection(
  provided: string | undefined,
  commandHints: string[],
): string {
  const autoCommands =
    commandHints.length > 0 ? asBulletList(commandHints) : "- None recorded.";
  return compactJoin([provided, autoCommands]) ?? "- None recorded.";
}

function generateResumePrompt(options: {
  taskNumber: number;
  id: string;
  reason: string;
  agentName: string;
  branch: string | null;
  sections: Omit<HandoffSections, "resumePrompt">;
}): string {
  const lines = [
    "Continue this task from the saved Agent Handoff checkpoint.",
    "",
    `Task Number: #${options.taskNumber}`,
    `Checkpoint ID: ${options.id}`,
    `Reason: ${options.reason}`,
    `Previous agent: ${options.agentName}`,
    `Branch: ${options.branch ?? "not-a-git-repo"}`,
    "",
    "Read the checkpoint summary below and continue from the current state instead of restarting the task.",
    "",
    "Goal:",
    options.sections.goal,
    "",
    "Current State:",
    options.sections.currentState,
    "",
    "Files Changed:",
    options.sections.filesChanged,
    "",
    "Problems / Risks:",
    options.sections.problemsRisks,
    "",
    "Next Steps:",
    options.sections.nextSteps,
    "",
    "Rules:",
    "- Preserve existing changes unless the task requires otherwise.",
    "- Avoid repeating already completed work.",
    "- Save a new handoff checkpoint before stopping again if continuity would help.",
  ];

  return lines.join("\n").trim();
}

function applyStdinToSection(
  parsed: Partial<HandoffSections>,
  rawStdin: string,
  stdinSection?: SectionKey,
): Partial<HandoffSections> {
  const trimmed = rawStdin.trim();
  if (!trimmed) {
    return parsed;
  }

  if (Object.keys(parsed).length > 0) {
    return parsed;
  }

  if (stdinSection) {
    return {
      [stdinSection]: trimmed,
    } as Partial<HandoffSections>;
  }

  return {
    currentState: trimmed,
  };
}

export async function saveHandoff(
  input: SaveCommandInput,
): Promise<SaveCommandResult> {
  const projectRoot = await ensureInitializedProject(input.cwd);
  const registry = await readRegistry(projectRoot);
  const gitContext = collectGitContext(projectRoot);
  const stdinText = input.stdinText ?? "";
  const parsedStdin = applyStdinToSection(
    parseMarkdownSections(stdinText),
    stdinText,
    input.stdinSection,
  );
  const reason = sanitizeReason(input.reason);
  const now = input.now ?? new Date();
  const id = `${formatTimestampForId(now)}-${reason}`;
  const agentName = detectAgentName(input.agentName);
  const relativeCwd = relativeToProject(projectRoot, input.cwd);
  const gitFileHints = gitContext.changedFiles.map(
    (entry) => `${entry.status} ${entry.path}`,
  );
  const manualSections = input.sections ?? {};
  const taskNumber = registry.nextTaskNumber;

  const sectionsWithoutResume = {
    originalPrompt: compactJoin([
      parsedStdin.originalPrompt,
      manualSections.originalPrompt,
    ]),
    goal: compactJoin([parsedStdin.goal, manualSections.goal]),
    workCompleted: compactJoin([
      parsedStdin.workCompleted,
      manualSections.workCompleted,
    ]),
    currentState: appendGitState(
      compactJoin([parsedStdin.currentState, manualSections.currentState]),
      relativeCwd,
      gitContext.branch,
      gitContext.statusLines,
    ),
    filesChanged: buildFilesSection(
      compactJoin([parsedStdin.filesChanged, manualSections.filesChanged]),
      input.fileHints ?? [],
      gitFileHints,
    ),
    commandsRun: buildCommandsSection(
      compactJoin([parsedStdin.commandsRun, manualSections.commandsRun]),
      input.commandHints ?? [],
    ),
    problemsRisks: compactJoin([
      parsedStdin.problemsRisks,
      manualSections.problemsRisks,
    ]),
    nextSteps: compactJoin([parsedStdin.nextSteps, manualSections.nextSteps]),
  } as Omit<HandoffSections, "resumePrompt">;

  const resumePrompt =
    compactJoin([parsedStdin.resumePrompt, manualSections.resumePrompt]) ??
    generateResumePrompt({
      taskNumber,
      id,
      reason,
      agentName,
      branch: gitContext.branch,
      sections: sectionsWithoutResume,
    });
  const sections = materializeSections({
    ...sectionsWithoutResume,
    resumePrompt,
  });
  const markdown = renderHandoffMarkdown(sections);
  const filename = `${id}.md`;
  const absoluteFilePath = await writeHandoffFile(projectRoot, filename, markdown);
  const relativeFile = join(".handoff", "handoffs", filename);
  const entry: RegistryEntry = {
    taskNumber,
    id,
    createdAt: now.toISOString(),
    reason,
    agentName,
    branch: gitContext.branch,
    file: relativeFile,
  };

  registry.activeHandoffId = id;
  registry.nextTaskNumber = taskNumber + 1;
  registry.entries = [entry, ...registry.entries.filter((item) => item.id !== id)];
  await writeRegistry(projectRoot, registry);

  return {
    taskNumber,
    id,
    path: absoluteFilePath,
    markdown,
    registryEntry: entry,
  };
}

export async function listHandoffs(options: {
  cwd: string;
  limit: number;
}): Promise<{
  projectRoot: string;
  activeHandoffId: string | null;
  entries: RegistryEntry[];
}> {
  const projectRoot = await ensureInitializedProject(options.cwd);
  const registry = await readRegistry(projectRoot);
  return {
    projectRoot,
    activeHandoffId: registry.activeHandoffId,
    entries: registry.entries.slice(0, options.limit),
  };
}

export async function resumeHandoff(options: {
  cwd: string;
  target?: string;
}): Promise<{
  projectRoot: string;
  entry: RegistryEntry;
  markdown: string;
}> {
  const projectRoot = await ensureInitializedProject(options.cwd);
  const registry = await readRegistry(projectRoot);
  const target = options.target?.trim();
  const normalizedTarget =
    target && target !== "latest" ? sanitizeReason(target.replace(/^#/, "")) : null;
  const numericTarget =
    normalizedTarget && /^\d+$/.test(normalizedTarget)
      ? Number.parseInt(normalizedTarget, 10)
      : null;
  const entry =
    (normalizedTarget
      ? registry.entries.find((item) => item.id === target) ??
        registry.entries.find((item) => item.file.endsWith(`${target}.md`)) ??
        (numericTarget !== null
          ? registry.entries.find((item) => item.taskNumber === numericTarget)
          : undefined) ??
        registry.entries.find((item) => item.reason === normalizedTarget) ??
        registry.entries.find((item) => item.id.includes(normalizedTarget)) ??
        registry.entries.find((item) => item.reason.includes(normalizedTarget))
      : registry.entries[0]) ?? null;

  if (!entry) {
    throw new Error("No saved handoff checkpoint found for the requested id.");
  }

  const markdown = await import("node:fs/promises").then(({ readFile }) =>
    readFile(join(projectRoot, entry.file), "utf8"),
  );

  return {
    projectRoot,
    entry,
    markdown,
  };
}
