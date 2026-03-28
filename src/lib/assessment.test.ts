// ABOUTME: Tests the starter requirement mapping view derived from onboarding data.
// ABOUTME: Prevents the assessment status logic from drifting as the app evolves.
import { describe, expect, it } from "vitest";
import { buildAssessmentState } from "@/lib/assessment";

const engagement = {
  id: "eng-1",
  companyId: "company-1",
  companyName: "Example Co",
  engagementName: "Example assessment",
  targetFrameworks: ["CMMC"],
  targetCmmcLevel: "Level 2",
  currentStage: "onboarding",
  currentSectionId: "engagement-setup" as const,
};

describe("buildAssessmentState", () => {
  it("marks requirements as supported only when mapped answers and evidence are both present", () => {
    const state = buildAssessmentState({
      engagement,
      answerIds: ["target-cmmc-level", "handles-fci", "handles-cui", "cui-storage-location"],
      evidenceByQuestionId: {
        "handles-cui": [{ id: "evidence-1" }],
      },
    });

    const contextRequirement = state.requirements.find((item) => item.controlId === "CONTEXT-01");
    expect(contextRequirement?.status).toBe("supported");

    const boundaryRequirement = state.requirements.find((item) => item.controlId === "SCOPING-01");
    expect(boundaryRequirement?.status).toBe("partial");
  });
});
