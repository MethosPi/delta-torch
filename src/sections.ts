import { SECTION_ORDER, SECTION_TITLES } from "./constants.js";
import type { HandoffSections, SectionKey } from "./types.js";
import { normalizeBlock } from "./text.js";
import { redactSensitiveText } from "./security.js";

const HEADING_TO_KEY = new Map<string, SectionKey>(
  Object.entries(SECTION_TITLES).map(([key, title]) => [
    title.toLowerCase(),
    key as SectionKey,
  ]),
);

function defaultSectionText(section: SectionKey): string {
  switch (section) {
    case "filesChanged":
      return "- No changed files detected.";
    case "commandsRun":
      return "- None recorded.";
    default:
      return "- Not recorded.";
  }
}

export function parseMarkdownSections(markdown: string): Partial<HandoffSections> {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const result: Partial<HandoffSections> = {};
  let activeKey: SectionKey | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!activeKey) {
      buffer = [];
      return;
    }

    const text = normalizeBlock(buffer.join("\n"));
    if (text) {
      result[activeKey] = text;
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) {
      flush();
      const heading = (match[1] ?? "").trim().toLowerCase();
      activeKey = HEADING_TO_KEY.get(heading) ?? null;
      continue;
    }

    if (activeKey) {
      buffer.push(line);
    }
  }

  flush();
  return result;
}

export function renderHandoffMarkdown(sections: HandoffSections): string {
  const lines = ["# Agent Handoff", ""];

  for (const section of SECTION_ORDER) {
    const title = SECTION_TITLES[section];
    const content = redactSensitiveText(
      normalizeBlock(sections[section]) || defaultSectionText(section),
    );

    lines.push(`## ${title}`);
    lines.push(content);
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function materializeSections(
  input: Partial<HandoffSections>,
): HandoffSections {
  return {
    originalPrompt: input.originalPrompt ?? defaultSectionText("originalPrompt"),
    goal: input.goal ?? defaultSectionText("goal"),
    workCompleted: input.workCompleted ?? defaultSectionText("workCompleted"),
    currentState: input.currentState ?? defaultSectionText("currentState"),
    filesChanged: input.filesChanged ?? defaultSectionText("filesChanged"),
    commandsRun: input.commandsRun ?? defaultSectionText("commandsRun"),
    problemsRisks: input.problemsRisks ?? defaultSectionText("problemsRisks"),
    nextSteps: input.nextSteps ?? defaultSectionText("nextSteps"),
    resumePrompt: input.resumePrompt ?? defaultSectionText("resumePrompt"),
  };
}
