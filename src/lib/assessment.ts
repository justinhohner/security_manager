// ABOUTME: Defines starter requirement mappings derived from onboarding answers and evidence.
// ABOUTME: Produces lightweight assessment and requirement-detail views without overstating compliance.
import { BASELINE_QUESTIONS, getQuestionById } from "@/lib/onboarding";
import type {
  Answer,
  AssessmentState,
  Engagement,
  EvidenceReference,
  Finding,
  FindingInput,
  RequirementAssessment,
  RequirementAssessmentStatus,
  RequirementDetail,
  RequirementDetailState,
} from "@/lib/types";

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

export function buildRequirementDetailState(input: {
  engagement: Engagement;
  requirementId: string;
  answers: Record<string, Answer>;
  evidenceByQuestionId: Record<string, EvidenceReference[]>;
  findings: Finding[];
}): RequirementDetailState | undefined {
  const definition = STARTER_REQUIREMENTS.find((requirement) => requirement.id === input.requirementId);

  if (!definition) {
    return undefined;
  }

  const requirement = buildRequirementAssessment(
    definition,
    Object.keys(input.answers),
    input.evidenceByQuestionId,
  );
  const questionDetails = definition.mappedQuestionIds.map((questionId) => {
    const question = getQuestionById(questionId) ?? BASELINE_QUESTIONS.find((item) => item.id === questionId);
    const answer = input.answers[questionId];

    return {
      questionId,
      prompt: question?.prompt ?? questionId,
      answered: Boolean(answer),
      answerValue: answer?.value,
      answerScore: answer?.score,
      evidenceReferences: input.evidenceByQuestionId[questionId] ?? [],
    };
  });

  return {
    engagement: input.engagement,
    requirement: {
      ...requirement,
      questionDetails,
      nextAction: buildNextAction(requirement),
      findingCandidate: buildFindingCandidate(requirement),
      findings: input.findings.filter((finding) => finding.requirementId === definition.id),
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

function buildNextAction(requirement: RequirementAssessment) {
  if (requirement.status === "supported") {
    return "Review the current support set for consistency and decide whether a requirement-level assessment note is ready.";
  }

  if (requirement.status === "partial") {
    return "Close missing prompts and attach at least one evidence reference before treating this requirement area as supportable.";
  }

  return "Start by answering the mapped prompts in onboarding before evaluating this requirement area.";
}

function buildFindingCandidate(requirement: RequirementAssessment) {
  if (requirement.status === "supported") {
    return {
      title: "Potentially supportable requirement area",
      statement:
        "This mapped requirement area has complete prompt coverage and at least one evidence reference, but still needs assessor review before a formal finding is recorded.",
      impact: "Low immediate concern, but assessor validation is still required.",
    };
  }

  if (requirement.status === "partial") {
    return {
      title: "Potential evidence or coverage gap",
      statement:
        "This mapped requirement area has some onboarding support, but the current prompt coverage or evidence set is incomplete.",
      impact: "Moderate concern because incomplete support may delay requirement review or create a future finding.",
    };
  }

  return {
    title: "Potential unmapped or unsupported requirement area",
    statement:
      "This mapped requirement area does not yet have onboarding support and is likely to require more discovery before assessment work can proceed.",
    impact: "High uncertainty because the requirement area has not been supported with onboarding data.",
  };
}

export function buildFindingInput(requirement: RequirementDetail): FindingInput {
  const evidenceUsed = requirement.questionDetails.flatMap((question) =>
    question.evidenceReferences.map((reference) => `${reference.title} (${reference.source})`),
  );
  const missingSupport = requirement.questionDetails
    .filter((question) => !question.answered)
    .map((question) => question.prompt);

  return {
    requirementId: requirement.id,
    controlId: requirement.controlId,
    title: requirement.findingCandidate.title,
    statement: requirement.findingCandidate.statement,
    impact: requirement.findingCandidate.impact,
    evidenceUsed,
    missingSupport,
    confidence: buildFindingConfidence(requirement.status),
    priorityRationale: buildPriorityRationale(requirement.status),
    status: "candidate",
  };
}

function buildFindingConfidence(status: RequirementAssessmentStatus) {
  if (status === "supported") {
    return "high";
  }

  if (status === "partial") {
    return "medium";
  }

  return "low";
}

function buildPriorityRationale(status: RequirementAssessmentStatus) {
  if (status === "supported") {
    return "This requirement area has enough mapped support to review soon, but assessor validation is still needed.";
  }

  if (status === "partial") {
    return "This requirement area is only partially supported, so follow-up work is likely before review can finish.";
  }

  return "This requirement area has no mapped support yet, so additional discovery is needed before reliable review can begin.";
}
