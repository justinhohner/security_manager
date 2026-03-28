// ABOUTME: Provides a lightweight in-memory store for the first workflow slice.
// ABOUTME: Lets the app exercise real route contracts before database wiring lands.
import { BASELINE_QUESTIONS, SECTION_ORDER, answerToRecord, buildBoundarySummary, buildFollowUpQuestions, buildSectionStatuses } from "@/lib/onboarding";
import { type Answer, type AnswerInput, type Company, type Engagement, type OnboardingState, type SectionId } from "@/lib/types";

const companies: Company[] = [
  {
    id: "company-red-canyon",
    legalName: "Red Canyon Manufacturing",
  },
];

const engagements: Engagement[] = [
  {
    id: "eng-red-canyon-001",
    companyId: companies[0].id,
    companyName: companies[0].legalName,
    engagementName: "Red Canyon CMMC readiness",
    targetFrameworks: ["CMMC", "NIST SP 800-171", "NIST SP 800-171A"],
    targetCmmcLevel: "Level 2",
    currentStage: "onboarding",
    currentSectionId: "engagement-setup",
  },
];

const answersByEngagementId: Record<string, Record<string, Answer>> = {
  "eng-red-canyon-001": {
    "engagement-name": answerToRecord("eng-red-canyon-001", {
      questionId: "engagement-name",
      value: "Red Canyon CMMC readiness",
    }),
    "target-cmmc-level": answerToRecord("eng-red-canyon-001", {
      questionId: "target-cmmc-level",
      value: "Level 2",
    }),
    "handles-fci": answerToRecord("eng-red-canyon-001", {
      questionId: "handles-fci",
      value: "true",
    }),
  },
};

export function listEngagements(): Engagement[] {
  return engagements;
}

export function createEngagement(): Engagement {
  const companyId = crypto.randomUUID();
  const engagementId = crypto.randomUUID();
  const companyName = `Client ${engagements.length + 1}`;

  const company: Company = {
    id: companyId,
    legalName: companyName,
  };

  const engagement: Engagement = {
    id: engagementId,
    companyId,
    companyName,
    engagementName: `${companyName} security review`,
    targetFrameworks: ["CMMC", "NIST SP 800-171"],
    targetCmmcLevel: "Level 2",
    currentStage: "onboarding",
    currentSectionId: "engagement-setup",
  };

  companies.push(company);
  engagements.unshift(engagement);
  answersByEngagementId[engagement.id] = {};

  return engagement;
}

export function getEngagement(engagementId: string): Engagement | undefined {
  return engagements.find((engagement) => engagement.id === engagementId);
}

export function setCurrentSection(engagementId: string, sectionId: SectionId): Engagement | undefined {
  const engagement = getEngagement(engagementId);

  if (!engagement) {
    return undefined;
  }

  engagement.currentSectionId = sectionId;
  return engagement;
}

export function getOnboardingState(engagementId: string): OnboardingState | undefined {
  const engagement = getEngagement(engagementId);

  if (!engagement) {
    return undefined;
  }

  const answerMap = answersByEngagementId[engagementId] ?? {};
  return {
    engagement,
    sections: buildSectionStatuses(answerMap),
    currentSectionId: engagement.currentSectionId,
    questions: BASELINE_QUESTIONS,
    followUpQuestions: buildFollowUpQuestions(answerMap),
    answers: answerMap,
    boundaryPreview: buildBoundarySummary(answerMap),
  };
}

export function saveAnswer(engagementId: string, input: AnswerInput): OnboardingState | undefined {
  const engagement = getEngagement(engagementId);

  if (!engagement) {
    return undefined;
  }

  if (!answersByEngagementId[engagementId]) {
    answersByEngagementId[engagementId] = {};
  }

  answersByEngagementId[engagementId][input.questionId] = answerToRecord(engagementId, input);

  return getOnboardingState(engagementId);
}

export function getBoundarySummary(engagementId: string) {
  const answerMap = answersByEngagementId[engagementId] ?? {};
  return buildBoundarySummary(answerMap);
}

export function getSectionMetadata(sectionId: SectionId) {
  return SECTION_ORDER.find((section) => section.id === sectionId);
}
