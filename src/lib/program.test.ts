// ABOUTME: Tests the program-first baseline derived from onboarding answers.
// ABOUTME: Keeps capability and roadmap preview logic aligned to the new product direction.
import { describe, expect, it } from "vitest";
import { answerToRecord, buildBoundarySummary } from "@/lib/onboarding";
import { buildProgramBaselineState } from "@/lib/program";

const engagement = {
  id: "eng-1",
  companyId: "company-1",
  companyName: "Example Co",
  engagementName: "Example program review",
  targetFrameworks: ["CMMC", "NIST SP 800-171"],
  targetCmmcLevel: "Level 2",
  currentStage: "onboarding",
  currentSectionId: "engagement-setup" as const,
};

describe("buildProgramBaselineState", () => {
  it("derives capability summaries and roadmap preview from onboarding answers", () => {
    const answers = {
      "handles-cui": answerToRecord("eng-1", {
        questionId: "handles-cui",
        value: "true",
      }),
      "outsourced-it": answerToRecord("eng-1", {
        questionId: "outsourced-it",
        value: "true",
      }),
      "security-program-maturity": answerToRecord("eng-1", {
        questionId: "security-program-maturity",
        score: 2,
      }),
      "identity-provider": answerToRecord("eng-1", {
        questionId: "identity-provider",
        value: "Microsoft Entra ID",
      }),
      "core-systems": answerToRecord("eng-1", {
        questionId: "core-systems",
        value: "Microsoft 365, Jira",
      }),
      "boundary-confidence": answerToRecord("eng-1", {
        questionId: "boundary-confidence",
        score: 2,
      }),
    };

    const state = buildProgramBaselineState({
      engagement,
      answers,
      evidenceByQuestionId: {},
      boundaryPreview: buildBoundarySummary(answers),
    });

    expect(state.capabilities).toHaveLength(5);
    expect(["Governance and policy", "Boundary and data handling"]).toContain(state.summary.weakestArea);
    expect(state.roadmapPreview[0]).toMatchObject({
      priority: "do-now",
      title: "Stabilize governance and policy baseline",
    });
    expect(state.roadmapPreview.some((item) => item.title.includes("Clarify outsourced support"))).toBe(true);
  });
});
