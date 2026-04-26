export const HANDOFF_DIR_NAME = ".handoff";
export const HANDOFFS_DIR_NAME = "handoffs";
export const CONFIG_FILE_NAME = "config.json";
export const REGISTRY_FILE_NAME = "registry.json";
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_LIST_LIMIT = 10;
export const HANDOFF_FORMAT_VERSION = 1;

export const SECTION_TITLES = {
  originalPrompt: "Original Prompt",
  goal: "Goal",
  workCompleted: "Work Completed",
  currentState: "Current State",
  filesChanged: "Files Changed",
  commandsRun: "Commands Run",
  problemsRisks: "Problems / Risks",
  nextSteps: "Next Steps",
  resumePrompt: "Resume Prompt",
} as const;

export const SECTION_ORDER = [
  "originalPrompt",
  "goal",
  "workCompleted",
  "currentState",
  "filesChanged",
  "commandsRun",
  "problemsRisks",
  "nextSteps",
  "resumePrompt",
] as const;
