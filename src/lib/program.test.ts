// ABOUTME: Tests the program-first baseline derived from onboarding answers.
// ABOUTME: Keeps capability and roadmap preview logic aligned to the new product direction.
import { describe, expect, it } from "vitest";
import { answerToRecord, buildBoundarySummary } from "@/lib/onboarding";
import { buildCapabilityDetailState, buildInitiativeDetailState, buildInitiativeInput, buildProgramBaselineState, buildRoadmapWorkspaceState } from "@/lib/program";

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
      initiatives: [],
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

describe("buildCapabilityDetailState", () => {
  it("builds a capability detail view from the derived program baseline", () => {
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
      "boundary-confidence": answerToRecord("eng-1", {
        questionId: "boundary-confidence",
        score: 2,
      }),
    };

    const detail = buildCapabilityDetailState({
      engagement,
      capabilityId: "governance-policy",
      answers,
      evidenceByQuestionId: {},
      boundaryPreview: buildBoundarySummary(answers),
      initiatives: [],
    });

    expect(detail?.capability.name).toBe("Governance and policy");
    expect(detail?.capability.nextActions[0]).toBe("Establish a more repeatable governance and policy baseline.");
    expect(detail?.capability.linkedInitiativeIds).toContain("initiative-governance-baseline");
  });
});

describe("buildInitiativeInput", () => {
  it("creates a saved initiative payload from a roadmap preview item", () => {
    const initiative = buildInitiativeInput({
      id: "initiative-governance-baseline",
      title: "Stabilize governance and policy baseline",
      priority: "do-now",
      rationale: "Program maturity is low, so the consultant needs a stronger governance baseline before larger improvements will stick.",
      targetCapabilityIds: ["governance-policy"],
    });

    expect(initiative).toMatchObject({
      title: "Stabilize governance and policy baseline",
      summary: "Program maturity is low, so the consultant needs a stronger governance baseline before larger improvements will stick.",
      priority: "do-now",
      targetCapabilityIds: ["governance-policy"],
      status: "candidate",
    });
  });
});

describe("buildInitiativeDetailState", () => {
  it("builds initiative detail with next status options", () => {
    const detail = buildInitiativeDetailState({
      engagement,
      initiative: {
        id: "initiative-1",
        engagementId: "eng-1",
        title: "Stabilize governance and policy baseline",
        summary:
          "Program maturity is low, so the consultant needs a stronger governance baseline before larger improvements will stick.",
        priority: "do-now",
        targetCapabilityIds: ["governance-policy"],
        status: "candidate",
        owner: "Justin",
        targetDate: "2026-04-15",
        createdAt: "2026-03-28T00:00:00.000Z",
      },
    });

    expect(detail.initiative.whyNow).toContain("do now");
    expect(detail.initiative.nextStatusOptions).toEqual(["planned", "in-progress"]);
    expect(detail.initiative.owner).toBe("Justin");
    expect(detail.initiative.targetDate).toBe("2026-04-15");
  });
});

describe("buildRoadmapWorkspaceState", () => {
  it("groups initiatives by status for the roadmap workspace", () => {
    const state = buildRoadmapWorkspaceState({
      engagement,
      initiatives: [
        {
          id: "initiative-1",
          engagementId: "eng-1",
          title: "Stabilize governance and policy baseline",
          summary: "Summary",
          priority: "do-now",
          targetCapabilityIds: ["governance-policy"],
          status: "candidate",
          createdAt: "2026-03-28T00:00:00.000Z",
        },
        {
          id: "initiative-2",
          engagementId: "eng-1",
          title: "Validate core identity control coverage",
          summary: "Summary",
          priority: "plan-this-quarter",
          targetCapabilityIds: ["identity-access"],
          status: "planned",
          createdAt: "2026-03-28T00:00:00.000Z",
        },
      ],
    });

    expect(state.counts).toEqual({
      candidate: 1,
      planned: 1,
      inProgress: 0,
    });
    expect(state.nextFocus).toContain("1 candidate");
  });
});
