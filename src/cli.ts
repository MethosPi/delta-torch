#!/usr/bin/env node

import { stdin as input, stdout as output, stderr as errorOutput } from "node:process";
import { resolve } from "node:path";
import { DEFAULT_LIST_LIMIT } from "./constants.js";
import { listHandoffs, resumeHandoff, saveHandoff } from "./handoff.js";
import { initProject, installSkills, UserFacingError } from "./store.js";
import type { HandoffSections, SectionKey } from "./types.js";
import { splitCsvLike } from "./text.js";

type Primitive = boolean | string | string[];
type ParsedArgs = {
  command: string | undefined;
  positionals: string[];
  flags: Record<string, Primitive>;
};

const SECTION_FLAG_MAP: Record<string, SectionKey> = {
  "original-prompt": "originalPrompt",
  goal: "goal",
  "work-completed": "workCompleted",
  "current-state": "currentState",
  "files-changed": "filesChanged",
  "commands-run": "commandsRun",
  "problems-risks": "problemsRisks",
  "next-steps": "nextSteps",
  "resume-prompt": "resumePrompt",
};

function printHelp(): void {
  output.write(
    [
      "delta-torch",
      "",
      "Commands:",
      "  init",
      "  install-skills --target project|personal [--force]",
      "  save --reason <reason> [--agent <name>] [--stdin-section <section>]",
      "  resume [latest|id]",
      "  list [--limit <n>]",
      "",
      "Save flags:",
      "  --original-prompt <text>",
      "  --goal <text>",
      "  --work-completed <text>",
      "  --current-state <text>",
      "  --files-changed <text>",
      "  --commands-run <text>",
      "  --problems-risks <text>",
      "  --next-steps <text>",
      "  --resume-prompt <text>",
      "  --files <a,b,c>",
      "  --commands <cmd1,cmd2>",
      "",
    ].join("\n"),
  );
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const positionals: string[] = [];
  const flags: Record<string, Primitive> = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token) {
      continue;
    }

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    const nextToken = rest[index + 1];
    const hasNextValue = nextToken !== undefined && !nextToken.startsWith("--");
    const value = inlineValue ?? (hasNextValue ? nextToken : undefined);
    const normalizedKey = (rawKey ?? "").trim();

    if (value === undefined) {
      flags[normalizedKey] = true;
      continue;
    }

    if (flags[normalizedKey] === undefined) {
      flags[normalizedKey] = value;
    } else if (Array.isArray(flags[normalizedKey])) {
      (flags[normalizedKey] as string[]).push(value);
    } else {
      flags[normalizedKey] = [String(flags[normalizedKey]), value];
    }

    if (!inlineValue && hasNextValue) {
      index += 1;
    }
  }

  return {
    command,
    positionals,
    flags,
  };
}

function getStringFlag(
  flags: Record<string, Primitive>,
  key: string,
): string | undefined {
  const value = flags[key];
  if (Array.isArray(value)) {
    return value.at(-1);
  }

  return typeof value === "string" ? value : undefined;
}

function getBooleanFlag(flags: Record<string, Primitive>, key: string): boolean {
  return flags[key] === true;
}

function getRepeatedStringFlags(
  flags: Record<string, Primitive>,
  key: string,
): string[] {
  const value = flags[key];
  if (value === undefined || value === true) {
    return [];
  }

  return Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
}

function collectSectionFlags(flags: Record<string, Primitive>): Partial<HandoffSections> {
  return Object.entries(SECTION_FLAG_MAP).reduce<Partial<HandoffSections>>(
    (sections, [flag, key]) => {
      const value = getStringFlag(flags, flag);
      if (value) {
        sections[key] = value;
      }
      return sections;
    },
    {},
  );
}

async function readStdin(): Promise<string> {
  if (input.isTTY) {
    return "";
  }

  const chunks: Buffer[] = [];
  for await (const chunk of input) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sectionKeyFromFlag(value: string | undefined): SectionKey | undefined {
  if (!value) {
    return undefined;
  }

  const entry = Object.entries(SECTION_FLAG_MAP).find(([flag]) => flag === value.trim());
  return entry?.[1];
}

function renderListOutput(payload: {
  projectRoot: string;
  activeHandoffId: string | null;
  entries: Array<{
    id: string;
    createdAt: string;
    reason: string;
    agentName: string;
    branch: string | null;
    file: string;
  }>;
}): string {
  const lines = [
    `Project root: ${payload.projectRoot}`,
    `Active handoff: ${payload.activeHandoffId ?? "none"}`,
    "",
    "Recent checkpoints:",
  ];

  if (payload.entries.length === 0) {
    lines.push("- No checkpoints saved yet.");
  } else {
    for (const entry of payload.entries) {
      lines.push(
        `- ${entry.id} | ${entry.reason} | ${entry.agentName} | ${entry.createdAt} | ${entry.branch ?? "not-a-git-repo"}`,
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  const cwd = resolve(getStringFlag(parsed.flags, "cwd") ?? process.cwd());

  if (!parsed.command || parsed.command === "--help" || parsed.command === "help") {
    printHelp();
    return;
  }

  switch (parsed.command) {
    case "init": {
      const created = await initProject(cwd);
      output.write(
        created.length > 0
          ? `Initialized handoff state in ${cwd}\n`
          : `Handoff state already present in ${cwd}\n`,
      );
      return;
    }

    case "install-skills": {
      const target = getStringFlag(parsed.flags, "target");
      if (target !== "project" && target !== "personal") {
        throw new UserFacingError(
          "install-skills requires `--target project` or `--target personal`.",
        );
      }

      const installedPath = await installSkills({
        cwd,
        target,
        force: getBooleanFlag(parsed.flags, "force"),
      });
      output.write(`Installed skills to ${installedPath}\n`);
      return;
    }

    case "save": {
      const reason = getStringFlag(parsed.flags, "reason");
      if (!reason) {
        throw new UserFacingError("save requires `--reason <reason>`.");
      }

      const stdinText = await readStdin();
      const agentName = getStringFlag(parsed.flags, "agent");
      const stdinSection = sectionKeyFromFlag(
        getStringFlag(parsed.flags, "stdin-section"),
      );
      const result = await saveHandoff({
        cwd,
        reason,
        stdinText,
        sections: collectSectionFlags(parsed.flags),
        fileHints: splitCsvLike(getRepeatedStringFlags(parsed.flags, "files")),
        commandHints: splitCsvLike(getRepeatedStringFlags(parsed.flags, "commands")),
        ...(agentName ? { agentName } : {}),
        ...(stdinSection ? { stdinSection } : {}),
      });

      output.write(`Saved handoff ${result.id}\n${result.path}\n`);
      return;
    }

    case "resume": {
      const target = parsed.positionals[0] ?? "latest";
      const result = await resumeHandoff({
        cwd,
        target,
      });

      output.write(
        [
          `Checkpoint: ${result.entry.id}`,
          `File: ${result.entry.file}`,
          "",
          result.markdown.trimEnd(),
          "",
        ].join("\n"),
      );
      return;
    }

    case "list": {
      const limitFlag = getStringFlag(parsed.flags, "limit");
      const limit = limitFlag ? Number.parseInt(limitFlag, 10) : DEFAULT_LIST_LIMIT;
      const result = await listHandoffs({
        cwd,
        limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIST_LIMIT,
      });
      output.write(renderListOutput(result));
      return;
    }

    default:
        throw new UserFacingError(`Unknown command: ${parsed.command}`);
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof UserFacingError || error instanceof Error
      ? error.message
      : "Unknown error.";
  errorOutput.write(`${message}\n`);
  process.exitCode = 1;
});
