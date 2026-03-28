// ABOUTME: Tests deterministic onboarding follow-up and boundary summary rules.
// ABOUTME: Protects the core slice logic from silent behavior drift.
import { describe, expect, it } from "vitest";
import { answerToRecord, buildBoundarySummary, buildFollowUpQuestions, buildSystemSnapshots } from "@/lib/onboarding";
import { buildManualSystems, resolveBoundarySummary } from "@/lib/persistence";
import type { Answer } from "@/lib/types";

describe("buildFollowUpQuestions", () => {
  it("adds CUI and outsourced IT follow-ups when the triggering answers are present", () => {
    const answers: Record<string, Answer> = {
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
        score: 4,
      }),
    };

    const followUps = buildFollowUpQuestions(answers);

    expect(followUps["handles-cui"][0]?.id).toBe("cui-storage-location");
    expect(followUps["outsourced-it"][0]?.id).toBe("outsourced-it-provider");
    expect(followUps["security-program-maturity"][0]?.id).toBe("security-program-evidence");
  });
});

describe("buildBoundarySummary", () => {
  it("flags unresolved scope questions when CUI exists without handling detail", () => {
    const answers: Record<string, Answer> = {
      "handles-cui": answerToRecord("eng-1", {
        questionId: "handles-cui",
        value: "true",
      }),
      "handles-fci": answerToRecord("eng-1", {
        questionId: "handles-fci",
        value: "true",
      }),
      "core-systems": answerToRecord("eng-1", {
        questionId: "core-systems",
        value: "Microsoft 365, Jira",
      }),
      "boundary-confidence": answerToRecord("eng-1", {
        questionId: "boundary-confidence",
        score: 4,
      }),
    };

    const summary = buildBoundarySummary(answers);

    expect(summary.includesCui).toBe(true);
    expect(summary.includesFci).toBe(true);
    expect(summary.inScopeSystems).toEqual(["Microsoft 365", "Jira"]);
    expect(summary.unresolvedScopeQuestions).toContain(
      "CUI is present, but the storage or processing location is still undefined.",
    );
    expect(summary.confidence).toBe(3);
  });
});

describe("buildSystemSnapshots", () => {
  it("derives in-scope and protected systems from saved onboarding answers", () => {
    const answers: Record<string, Answer> = {
      "handles-cui": answerToRecord("eng-1", {
        questionId: "handles-cui",
        value: "true",
      }),
      "core-systems": answerToRecord("eng-1", {
        questionId: "core-systems",
        value: "Microsoft 365, Jira",
      }),
      "cui-storage-location": answerToRecord("eng-1", {
        questionId: "cui-storage-location",
        value: "Microsoft 365",
      }),
    };

    const systems = buildSystemSnapshots(answers);

    expect(systems).toEqual([
      {
        name: "Microsoft 365",
        storesCui: true,
        processesCui: true,
        transmitsCui: true,
        protectsCui: true,
      },
      {
        name: "Jira",
        storesCui: false,
        processesCui: false,
        transmitsCui: false,
        protectsCui: false,
      },
    ]);
  });
});

describe("buildManualSystems", () => {
  it("marks protected systems inside the manually supplied in-scope list", () => {
    expect(buildManualSystems(["Microsoft 365", "Jira"], ["Jira"])).toEqual([
      {
        name: "Microsoft 365",
        storesCui: false,
        processesCui: false,
        transmitsCui: false,
        protectsCui: false,
      },
      {
        name: "Jira",
        storesCui: false,
        processesCui: false,
        transmitsCui: false,
        protectsCui: true,
      },
    ]);
  });
});

describe("resolveBoundarySummary", () => {
  it("preserves manually edited fields while keeping derived scope signals", () => {
    const resolved = resolveBoundarySummary(
      {
        summary: "Derived summary",
        includesCui: true,
        includesFci: false,
        assumptions: ["Derived assumption"],
        exclusions: ["Derived exclusion"],
        unresolvedScopeQuestions: ["Derived gap"],
        inScopeSystems: ["Microsoft 365"],
        protectedSystems: ["Microsoft 365"],
        confidence: 2,
      },
      {
        summary: "Manual summary",
        assumptions: ["Manual assumption"],
        exclusions: ["Manual exclusion"],
        confidence: 4,
        summaryManual: true,
        assumptionsManual: true,
        exclusionsManual: false,
        confidenceManual: true,
      },
    );

    expect(resolved.summary).toBe("Manual summary");
    expect(resolved.assumptions).toEqual(["Manual assumption"]);
    expect(resolved.exclusions).toEqual(["Derived exclusion"]);
    expect(resolved.confidence).toBe(4);
    expect(resolved.unresolvedScopeQuestions).toEqual(["Derived gap"]);
  });
});
