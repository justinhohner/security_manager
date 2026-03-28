// ABOUTME: Defines starter requirement mappings derived from onboarding answers and evidence.
// ABOUTME: Produces a lightweight assessment view without overstating control compliance.
import type { AssessmentState, Engagement, RequirementAssessment, RequirementAssessmentStatus } from "@/lib/types";

type RequirementDefinition = {
  id: string;
  framework: string;
  family: string;
  controlId: string;
  title: string;
  description: string;
  mappedQuestionIds: string[];
};

const STARTER_REQUIREMENTS: RequirementDefinition[] = [
  {
    id: "starter-boundary-01",
    framework: "CMMC / NIST SP 800-171",
    family: "Scoping",
    controlId: "SCOPING-01",
    title: "Assessment boundary definition",
    description: "Establish the systems, exclusions, and assumptions that shape the assessment boundary.",
    mappedQuestionIds: ["handles-cui", "core-systems", "boundary-confidence", "boundary-exclusions"],
  },
  {
    id: "starter-context-01",
    framework: "CMMC / NIST SP 800-171",
    family: "Program Context",
    controlId: "CONTEXT-01",
    title: "Contract and data handling context",
    description: "Capture the contractual drivers, FCI/CUI handling context, and likely assessment level.",
    mappedQuestionIds: ["target-cmmc-level", "handles-fci", "handles-cui", "cui-storage-location"],
  },
  {
    id: "starter-third-party-01",
    framework: "CMMC / NIST SP 800-171",
    family: "External Dependencies",
    controlId: "DEPENDENCY-01",
    title: "Third-party and outsourced responsibility clarity",
    description: "Understand which providers or outsourced parties influence scope and control operation.",
    mappedQuestionIds: ["outsourced-it", "outsourced-it-provider"],
  },
  {
    id: "starter-evidence-01",
    framework: "CMMC / NIST SP 800-171A",
    family: "Evidence Readiness",
    controlId: "EVIDENCE-01",
    title: "Support claims with evidence references",
    description: "Link onboarding claims to evidence so later requirement-level review has traceable support.",
    mappedQuestionIds: ["handles-cui", "security-program-maturity", "boundary-confidence"],
  },
];

export function buildAssessmentState(input: {
  engagement: Engagement;
  answerIds: string[];
  evidenceByQuestionId: Record<string, { id: string }[]>;
}): AssessmentState {
  const requirements = STARTER_REQUIREMENTS.map((requirement) =>
    buildRequirementAssessment(requirement, input.answerIds, input.evidenceByQuestionId),
  );

  return {
    engagement: input.engagement,
    requirements,
    counts: {
      notStarted: requirements.filter((item) => item.status === "not-started").length,
      partial: requirements.filter((item) => item.status === "partial").length,
      supported: requirements.filter((item) => item.status === "supported").length,
    },
  };
}

function buildRequirementAssessment(
  requirement: RequirementDefinition,
  answerIds: string[],
  evidenceByQuestionId: Record<string, { id: string }[]>,
): RequirementAssessment {
  const answeredQuestionIds = requirement.mappedQuestionIds.filter((questionId) => answerIds.includes(questionId));
  const missingQuestionIds = requirement.mappedQuestionIds.filter((questionId) => !answeredQuestionIds.includes(questionId));
  const evidenceCount = answeredQuestionIds.reduce(
    (count, questionId) => count + (evidenceByQuestionId[questionId]?.length ?? 0),
    0,
  );
  const status = deriveStatus(answeredQuestionIds.length, requirement.mappedQuestionIds.length, evidenceCount);

  return {
    id: requirement.id,
    framework: requirement.framework,
    family: requirement.family,
    controlId: requirement.controlId,
    title: requirement.title,
    description: requirement.description,
    status,
    evidenceCount,
    answeredQuestionIds,
    missingQuestionIds,
    mappedQuestionIds: requirement.mappedQuestionIds,
    rationale: buildRationale(status, answeredQuestionIds.length, requirement.mappedQuestionIds.length, evidenceCount),
  };
}

function deriveStatus(
  answeredCount: number,
  mappedCount: number,
  evidenceCount: number,
): RequirementAssessmentStatus {
  if (answeredCount === 0) {
    return "not-started";
  }

  if (answeredCount === mappedCount && evidenceCount > 0) {
    return "supported";
  }

  return "partial";
}

function buildRationale(
  status: RequirementAssessmentStatus,
  answeredCount: number,
  mappedCount: number,
  evidenceCount: number,
) {
  if (status === "not-started") {
    return "No mapped onboarding answers are available yet.";
  }

  if (status === "supported") {
    return `${answeredCount}/${mappedCount} mapped prompts are answered and at least one evidence reference is attached.`;
  }

  return `${answeredCount}/${mappedCount} mapped prompts are answered with ${evidenceCount} evidence references attached so far.`;
}
