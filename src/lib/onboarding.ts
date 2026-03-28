// ABOUTME: Stores the seeded onboarding questions and deterministic follow-up rules.
// ABOUTME: Derives section progress and boundary summaries from saved answers.
import {
  type Answer,
  type AnswerInput,
  type BoundarySummary,
  type Question,
  type SectionId,
  type SectionStatus,
} from "@/lib/types";

const SCALE_HELPER = "1 = absent or unknown, 5 = well established and evidenced";

export const SECTION_ORDER: Array<{ id: SectionId; title: string; description: string }> = [
  {
    id: "engagement-setup",
    title: "Engagement Setup",
    description: "Capture the operating context for the engagement.",
  },
  {
    id: "business-contract-context",
    title: "Business and Contract Context",
    description: "Understand the contractual and data handling drivers.",
  },
  {
    id: "organization-profile",
    title: "Organization Profile",
    description: "Capture the shape of the company and operating model.",
  },
  {
    id: "environment-overview",
    title: "Environment Overview",
    description: "Build the first technical picture of the environment.",
  },
  {
    id: "boundary-baseline",
    title: "Boundary Baseline",
    description: "Identify systems, assumptions, and boundary questions.",
  },
];

export const BASELINE_QUESTIONS: Question[] = [
  {
    id: "engagement-name",
    sectionId: "engagement-setup",
    prompt: "What is the name of this engagement?",
    responseType: "text",
    isFollowUp: false,
  },
  {
    id: "lead-assessor",
    sectionId: "engagement-setup",
    prompt: "Who is the lead consultant or assessor?",
    responseType: "text",
    isFollowUp: false,
  },
  {
    id: "target-cmmc-level",
    sectionId: "business-contract-context",
    prompt: "What CMMC level is the client targeting?",
    responseType: "select",
    options: [
      { label: "Level 1", value: "Level 1" },
      { label: "Level 2", value: "Level 2" },
      { label: "Level 3", value: "Level 3" },
    ],
    isFollowUp: false,
  },
  {
    id: "handles-fci",
    sectionId: "business-contract-context",
    prompt: "Does the client handle FCI in scope for this engagement?",
    responseType: "boolean",
    isFollowUp: false,
  },
  {
    id: "handles-cui",
    sectionId: "business-contract-context",
    prompt: "Does the client store, process, or transmit CUI?",
    responseType: "boolean",
    isFollowUp: false,
  },
  {
    id: "outsourced-it",
    sectionId: "organization-profile",
    prompt: "Is any IT or security function outsourced?",
    responseType: "boolean",
    isFollowUp: false,
  },
  {
    id: "security-program-maturity",
    sectionId: "organization-profile",
    prompt: "How established is the client's security program today?",
    helperText: SCALE_HELPER,
    responseType: "scale",
    isFollowUp: false,
  },
  {
    id: "identity-provider",
    sectionId: "environment-overview",
    prompt: "What identity provider is in use?",
    responseType: "text",
    isFollowUp: false,
  },
  {
    id: "core-systems",
    sectionId: "environment-overview",
    prompt: "List the primary business or technical systems in scope.",
    helperText: "Separate system names with commas.",
    responseType: "textarea",
    isFollowUp: false,
  },
  {
    id: "boundary-confidence",
    sectionId: "boundary-baseline",
    prompt: "How confident is the team in the current assessment boundary?",
    helperText: SCALE_HELPER,
    responseType: "scale",
    isFollowUp: false,
  },
  {
    id: "boundary-exclusions",
    sectionId: "boundary-baseline",
    prompt: "What exclusions are currently assumed to be out of scope?",
    helperText: "Leave blank if there are no exclusions yet.",
    responseType: "textarea",
    isFollowUp: false,
  },
];

const FOLLOW_UP_QUESTIONS: Question[] = [
  {
    id: "cui-storage-location",
    sectionId: "business-contract-context",
    prompt: "Where is CUI stored, processed, or transmitted today?",
    helperText: "Name the systems or environments involved.",
    responseType: "textarea",
    parentQuestionId: "handles-cui",
    isFollowUp: true,
  },
  {
    id: "outsourced-it-provider",
    sectionId: "organization-profile",
    prompt: "Which provider owns the outsourced IT or security work?",
    responseType: "text",
    parentQuestionId: "outsourced-it",
    isFollowUp: true,
  },
  {
    id: "security-program-evidence",
    sectionId: "organization-profile",
    prompt: "What evidence supports the stated security program maturity?",
    responseType: "textarea",
    parentQuestionId: "security-program-maturity",
    isFollowUp: true,
  },
  {
    id: "boundary-confidence-rationale",
    sectionId: "boundary-baseline",
    prompt: "Why is the team confident in the current boundary?",
    responseType: "textarea",
    parentQuestionId: "boundary-confidence",
    isFollowUp: true,
  },
  {
    id: "boundary-exclusion-rationale",
    sectionId: "boundary-baseline",
    prompt: "Why are those exclusions considered out of scope?",
    responseType: "textarea",
    parentQuestionId: "boundary-exclusions",
    isFollowUp: true,
  },
];

export function buildFollowUpQuestions(answerMap: Record<string, Answer>): Record<string, Question[]> {
  const followUps: Record<string, Question[]> = {};

  const handlesCui = answerMap["handles-cui"]?.value === "true";
  if (handlesCui) {
    followUps["handles-cui"] = [getFollowUpQuestion("cui-storage-location")];
  }

  const outsourcedIt = answerMap["outsourced-it"]?.value === "true";
  if (outsourcedIt) {
    followUps["outsourced-it"] = [getFollowUpQuestion("outsourced-it-provider")];
  }

  const maturityScore = answerMap["security-program-maturity"]?.score ?? 0;
  if (maturityScore >= 4) {
    followUps["security-program-maturity"] = [getFollowUpQuestion("security-program-evidence")];
  }

  const boundaryConfidence = answerMap["boundary-confidence"]?.score ?? 0;
  if (boundaryConfidence >= 4) {
    followUps["boundary-confidence"] = [getFollowUpQuestion("boundary-confidence-rationale")];
  }

  const exclusions = answerMap["boundary-exclusions"]?.value?.trim();
  if (exclusions) {
    followUps["boundary-exclusions"] = [getFollowUpQuestion("boundary-exclusion-rationale")];
  }

  return followUps;
}

export function buildSectionStatuses(answerMap: Record<string, Answer>): SectionStatus[] {
  return SECTION_ORDER.map((section) => {
    const sectionQuestions = BASELINE_QUESTIONS.filter((question) => question.sectionId === section.id);
    const answeredQuestions = sectionQuestions.filter((question) => hasAnswer(answerMap[question.id])).length;

    return {
      id: section.id,
      title: section.title,
      description: section.description,
      totalQuestions: sectionQuestions.length,
      answeredQuestions,
      isComplete: answeredQuestions === sectionQuestions.length,
    };
  });
}

export function buildBoundarySummary(answerMap: Record<string, Answer>): BoundarySummary {
  const includesCui = answerMap["handles-cui"]?.value === "true";
  const includesFci = answerMap["handles-fci"]?.value === "true";
  const systemNames = splitCommaList(answerMap["core-systems"]?.value);
  const cuiLocations = splitCommaList(answerMap["cui-storage-location"]?.value);
  const exclusions = splitCommaList(answerMap["boundary-exclusions"]?.value);
  const protectedSystems = includesCui && systemNames.length > 0 ? [systemNames[0]] : [];
  const unresolvedScopeQuestions: string[] = [];
  const assumptions: string[] = [];

  if (includesCui && cuiLocations.length === 0) {
    unresolvedScopeQuestions.push("CUI is present, but the storage or processing location is still undefined.");
  }

  if (answerMap["outsourced-it"]?.value === "true" && !answerMap["outsourced-it-provider"]?.value?.trim()) {
    unresolvedScopeQuestions.push("Outsourced IT is in use, but the responsible provider is still unnamed.");
  }

  if (exclusions.length > 0 && !answerMap["boundary-exclusion-rationale"]?.value?.trim()) {
    unresolvedScopeQuestions.push("Boundary exclusions are listed without a rationale.");
  }

  if (includesFci) {
    assumptions.push("FCI is in scope for the engagement.");
  }

  if (includesCui) {
    assumptions.push("CUI handling affects the initial assessment boundary.");
  }

  const confidence = Math.max(
    1,
    Math.min(5, (answerMap["boundary-confidence"]?.score ?? 1) - unresolvedScopeQuestions.length),
  );

  return {
    summary: includesCui
      ? "The current boundary includes systems with CUI impact and needs review against identified handling paths."
      : "The current boundary is based on the known system set and stated contractual drivers.",
    includesCui,
    includesFci,
    assumptions,
    exclusions,
    unresolvedScopeQuestions,
    inScopeSystems: systemNames.length > 0 ? systemNames : cuiLocations,
    protectedSystems,
    confidence,
  };
}

export function answerToRecord(engagementId: string, input: AnswerInput): Answer {
  return {
    id: `${input.questionId}-${engagementId}`,
    engagementId,
    questionId: input.questionId,
    score: input.score,
    value: input.value,
    rationale: input.rationale,
  };
}

function getFollowUpQuestion(questionId: string): Question {
  const question = FOLLOW_UP_QUESTIONS.find((candidate) => candidate.id === questionId);

  if (!question) {
    throw new Error(`Unknown follow-up question: ${questionId}`);
  }

  return question;
}

function hasAnswer(answer: Answer | undefined): boolean {
  if (!answer) {
    return false;
  }

  return Boolean(answer.value?.trim()) || typeof answer.score === "number";
}

function splitCommaList(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
