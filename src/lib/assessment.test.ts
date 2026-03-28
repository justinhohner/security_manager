// ABOUTME: Tests the starter requirement mapping view derived from onboarding data.
// ABOUTME: Prevents the assessment status logic from drifting as the app evolves.
import { describe, expect, it } from "vitest";
import { buildAssessmentState, buildRequirementDetailState } from "@/lib/assessment";

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

describe("buildRequirementDetailState", () => {
  it("builds a requirement detail view with mapped questions and a finding candidate", () => {
    const detail = buildRequirementDetailState({
      engagement,
      requirementId: "starter-context-01",
      answers: {
        "target-cmmc-level": {
          id: "answer-1",
          engagementId: "eng-1",
          questionId: "target-cmmc-level",
          value: "Level 2",
        },
        "handles-cui": {
          id: "answer-2",
          engagementId: "eng-1",
          questionId: "handles-cui",
          value: "true",
        },
      },
      evidenceByQuestionId: {
        "handles-cui": [
          {
            id: "evidence-1",
            engagementId: "eng-1",
            questionId: "handles-cui",
            title: "CUI handling notes",
            source: "SharePoint",
          },
        ],
      },
    });

    expect(detail?.requirement.controlId).toBe("CONTEXT-01");
    expect(detail?.requirement.questionDetails).toHaveLength(4);
    expect(detail?.requirement.findingCandidate.title).toBe("Potential evidence or coverage gap");
  });
});
