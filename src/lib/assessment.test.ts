// ABOUTME: Tests the starter requirement mapping view derived from onboarding data.
// ABOUTME: Prevents the assessment status logic from drifting as the app evolves.
import { describe, expect, it } from "vitest";
import { buildAssessmentState, buildFindingInput, buildRequirementDetailState } from "@/lib/assessment";

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
      findings: [
        {
          id: "finding-1",
          engagementId: "eng-1",
          requirementId: "starter-context-01",
          controlId: "CONTEXT-01",
          title: "Saved coverage gap",
          statement: "The current context answers are incomplete.",
          impact: "Moderate concern because context remains partial.",
          status: "candidate",
          createdAt: "2026-03-27T00:00:00.000Z",
        },
      ],
    });

    expect(detail?.requirement.controlId).toBe("CONTEXT-01");
    expect(detail?.requirement.questionDetails).toHaveLength(4);
    expect(detail?.requirement.findingCandidate.title).toBe("Potential evidence or coverage gap");
    expect(detail?.requirement.findings).toHaveLength(1);
    expect(detail?.requirement.findings[0]?.title).toBe("Saved coverage gap");
  });
});

describe("buildFindingInput", () => {
  it("creates a candidate finding payload from requirement detail", () => {
    const detail = buildRequirementDetailState({
      engagement,
      requirementId: "starter-boundary-01",
      answers: {},
      evidenceByQuestionId: {},
      findings: [],
    });

    const finding = buildFindingInput(detail!.requirement);

    expect(finding).toMatchObject({
      requirementId: "starter-boundary-01",
      controlId: "SCOPING-01",
      title: "Potential unmapped or unsupported requirement area",
      status: "candidate",
    });
  });
});
