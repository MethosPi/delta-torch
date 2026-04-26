import type { SECTION_ORDER } from "./constants.js";

export type SectionKey = (typeof SECTION_ORDER)[number];

export interface HandoffSections {
  originalPrompt: string;
  goal: string;
  workCompleted: string;
  currentState: string;
  filesChanged: string;
  commandsRun: string;
  problemsRisks: string;
  nextSteps: string;
  resumePrompt: string;
}

export interface HandoffConfig {
  version: number;
  createdAt: string;
  language: string;
}

export interface RegistryEntry {
  id: string;
  createdAt: string;
  reason: string;
  agentName: string;
  branch: string | null;
  file: string;
}

export interface RegistryFile {
  version: number;
  activeHandoffId: string | null;
  entries: RegistryEntry[];
}

export interface GitChangedFile {
  status: string;
  path: string;
}

export interface GitContext {
  isRepo: boolean;
  root: string | null;
  branch: string | null;
  statusLines: string[];
  changedFiles: GitChangedFile[];
}

export interface SaveCommandInput {
  cwd: string;
  reason: string;
  agentName?: string;
  now?: Date;
  stdinText?: string;
  stdinSection?: SectionKey;
  sections?: Partial<HandoffSections>;
  fileHints?: string[];
  commandHints?: string[];
}

export interface SaveCommandResult {
  id: string;
  path: string;
  markdown: string;
  registryEntry: RegistryEntry;
}
