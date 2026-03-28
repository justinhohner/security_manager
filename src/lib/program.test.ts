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
        notes: "Confirm scope with the client lead before kickoff.",
        blockers: "Waiting on the latest system inventory export.",
        createdAt: "2026-03-28T00:00:00.000Z",
      },
    });

    expect(detail.initiative.whyNow).toContain("do now");
    expect(detail.initiative.nextStatusOptions).toEqual(["planned", "in-progress"]);
    expect(detail.initiative.owner).toBe("Justin");
    expect(detail.initiative.targetDate).toBe("2026-04-15");
    expect(detail.initiative.notes).toBe("Confirm scope with the client lead before kickoff.");
    expect(detail.initiative.blockers).toBe("Waiting on the latest system inventory export.");
  });

  it("allows in-progress initiatives to move to completed", () => {
    const detail = buildInitiativeDetailState({
      engagement,
      initiative: {
        id: "initiative-2",
        engagementId: "eng-1",
        title: "Close out identity validation",
        summary: "Summary",
        priority: "do-next",
        targetCapabilityIds: ["identity-access"],
        status: "in-progress",
        statusChangedAt: "2026-03-30T12:00:00.000Z",
        createdAt: "2026-03-28T00:00:00.000Z",
      },
    });

    expect(detail.initiative.nextStatusOptions).toEqual(["completed"]);
    expect(detail.initiative.statusChangedAt).toBe("2026-03-30T12:00:00.000Z");
  });

  it("carries outcome detail for completed initiatives", () => {
    const detail = buildInitiativeDetailState({
      engagement,
      initiative: {
        id: "initiative-3",
        engagementId: "eng-1",
        title: "Close out inventory cleanup",
        summary: "Summary",
        priority: "plan-this-quarter",
        targetCapabilityIds: ["asset-configuration"],
        status: "completed",
        outcome: "Confirmed system ownership list and reconciled missing endpoint records.",
        createdAt: "2026-03-28T00:00:00.000Z",
      },
    });

    expect(detail.initiative.outcome).toBe("Confirmed system ownership list and reconciled missing endpoint records.");
    expect(detail.initiative.nextStatusOptions).toEqual([]);
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
      completed: 0,
      blocked: 0,
    });
    expect(state.nextFocus).toContain("1 candidate");
  });

  it("sorts initiatives into a workable action-plan order", () => {
    const state = buildRoadmapWorkspaceState({
      engagement,
      initiatives: [
        {
          id: "initiative-1",
          engagementId: "eng-1",
          title: "Late governance cleanup",
          summary: "Summary",
          priority: "plan-this-quarter",
          targetCapabilityIds: ["governance-policy"],
          status: "planned",
          owner: "Justin",
          targetDate: "2026-05-30",
          createdAt: "2026-03-28T00:00:00.000Z",
        },
        {
          id: "initiative-2",
          engagementId: "eng-1",
          title: "Immediate identity review",
          summary: "Summary",
          priority: "do-now",
          targetCapabilityIds: ["identity-access"],
          status: "candidate",
          owner: "Alex",
          targetDate: "2026-04-15",
          createdAt: "2026-03-28T01:00:00.000Z",
        },
        {
          id: "initiative-3",
          engagementId: "eng-1",
          title: "Future inventory expansion",
          summary: "Summary",
          priority: "plan-this-quarter",
          targetCapabilityIds: ["asset-configuration"],
          status: "candidate",
          createdAt: "2026-03-28T02:00:00.000Z",
        },
      ],
    });

    expect(state.initiatives.map((initiative) => initiative.id)).toEqual([
      "initiative-2",
      "initiative-1",
      "initiative-3",
    ]);
    expect(state.initiatives[0]?.owner).toBe("Alex");
    expect(state.initiatives[0]?.targetDate).toBe("2026-04-15");
  });

  it("surfaces blocked work in the roadmap summary", () => {
    const state = buildRoadmapWorkspaceState({
      engagement,
      initiatives: [
        {
          id: "initiative-1",
          engagementId: "eng-1",
          title: "Identity validation",
          summary: "Summary",
          priority: "do-now",
          targetCapabilityIds: ["identity-access"],
          status: "planned",
          blockers: "Waiting on admin access approval.",
          createdAt: "2026-03-28T00:00:00.000Z",
        },
        {
          id: "initiative-2",
          engagementId: "eng-1",
          title: "Inventory cleanup",
          summary: "Summary",
          priority: "do-next",
          targetCapabilityIds: ["asset-configuration"],
          status: "in-progress",
          createdAt: "2026-03-28T01:00:00.000Z",
        },
      ],
    });

    expect(state.counts.blocked).toBe(1);
    expect(state.nextFocus).toContain("1 initiative");
    expect(state.nextFocus).toContain("blocked");
  });
});
