import { describe, expect, it } from "vitest";
import { materializeSections, parseMarkdownSections, renderHandoffMarkdown } from "../src/sections.js";

describe("markdown rendering", () => {
  it("renders the canonical handoff format", () => {
    const markdown = renderHandoffMarkdown(
      materializeSections({
        originalPrompt: "Build the package.",
        goal: "Ship v1.",
        workCompleted: "- Added CLI.",
        currentState: "- Tests are passing.",
        filesChanged: "- src/cli.ts",
        commandsRun: "- pnpm test",
        problemsRisks: "- npm name conflict.",
        nextSteps: "- Push the repo.",
        resumePrompt: "Continue from the saved state.",
      }),
    );

    expect(markdown).toContain("# Agent Handoff");
    expect(markdown).toContain("## Original Prompt");
    expect(markdown).toContain("## Resume Prompt");
    expect(markdown.endsWith("\n")).toBe(true);
  });

  it("parses known sections from markdown", () => {
    const sections = parseMarkdownSections(`# Agent Handoff

## Goal
Ship it.

## Next Steps
Push to GitHub.
`);

    expect(sections.goal).toBe("Ship it.");
    expect(sections.nextSteps).toBe("Push to GitHub.");
  });
});
