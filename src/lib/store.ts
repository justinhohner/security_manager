// ABOUTME: Persists engagement workflow state through Prisma for the first slice.
// ABOUTME: Keeps onboarding, boundary state, and seeded sample data aligned.
import { prisma } from "@/lib/prisma";
import { BASELINE_QUESTIONS, SECTION_ORDER, buildBoundarySummary, buildFollowUpQuestions, buildSectionStatuses } from "@/lib/onboarding";
import { mapAnswers, synchronizeBoundary } from "@/lib/persistence";
import { type AnswerInput, type BoundarySummary, type Engagement, type OnboardingState, type SectionId } from "@/lib/types";

export async function listEngagements(): Promise<Engagement[]> {
  const engagements = await prisma.engagement.findMany({
    include: {
      company: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return engagements.map(mapEngagementRecord);
}

export async function createEngagement(): Promise<Engagement> {
  const created = await prisma.company.create({
    data: {
      legalName: `Client ${Date.now()}`,
      engagements: {
        create: {
          engagementName: "New security review",
          targetFrameworks: ["CMMC", "NIST SP 800-171"],
          targetCmmcLevel: "Level 2",
          currentStage: "onboarding",
          currentSectionId: SECTION_ORDER[0].id,
        },
      },
    },
    include: {
      engagements: true,
    },
  });

  return {
    id: created.engagements[0].id,
    companyId: created.id,
    companyName: created.legalName,
    engagementName: created.engagements[0].engagementName,
    targetFrameworks: created.engagements[0].targetFrameworks,
    targetCmmcLevel: created.engagements[0].targetCmmcLevel,
    currentStage: created.engagements[0].currentStage,
    currentSectionId: created.engagements[0].currentSectionId as SectionId,
  };
}

export async function getEngagement(engagementId: string): Promise<Engagement | undefined> {
  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: { company: true },
  });

  return engagement ? mapEngagementRecord(engagement) : undefined;
}

export async function setCurrentSection(
  engagementId: string,
  sectionId: SectionId,
): Promise<Engagement | undefined> {
  const engagement = await prisma.engagement.update({
    where: { id: engagementId },
    data: { currentSectionId: sectionId },
    include: { company: true },
  }).catch(() => undefined);

  return engagement ? mapEngagementRecord(engagement) : undefined;
}

export async function getOnboardingState(engagementId: string): Promise<OnboardingState | undefined> {
  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: {
      company: true,
      answers: true,
      boundary: true,
      systems: true,
    },
  });

  if (!engagement) {
    return undefined;
  }

  const answerMap = mapAnswers(engagement.answers);
  const derivedBoundary = buildBoundarySummary(answerMap);
  const boundaryPreview = engagement.boundary
    ? {
        ...derivedBoundary,
        summary: engagement.boundary.summary,
        includesCui: engagement.boundary.includesCui,
        includesFci: engagement.boundary.includesFci,
        assumptions: engagement.boundary.assumptions,
        exclusions: engagement.boundary.exclusions,
        unresolvedScopeQuestions: engagement.boundary.unresolvedScope,
        inScopeSystems: engagement.systems.map((system) => system.name),
        protectedSystems: engagement.systems.filter((system) => system.protectsCui).map((system) => system.name),
        confidence: engagement.boundary.confidence,
      }
    : derivedBoundary;

  return {
    engagement: mapEngagementRecord(engagement),
    sections: buildSectionStatuses(answerMap),
    currentSectionId: engagement.currentSectionId as SectionId,
    questions: BASELINE_QUESTIONS,
    followUpQuestions: buildFollowUpQuestions(answerMap),
    answers: answerMap,
    boundaryPreview,
  };
}

export async function saveAnswer(
  engagementId: string,
  input: AnswerInput,
): Promise<OnboardingState | undefined> {
  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: { answers: true },
  });

  if (!engagement) {
    return undefined;
  }

  await prisma.answer.upsert({
    where: {
      engagementId_questionId: {
        engagementId,
        questionId: input.questionId,
      },
    },
    create: {
      engagementId,
      questionId: input.questionId,
      score: input.score,
      value: input.value,
      rationale: input.rationale,
    },
    update: {
      score: input.score,
      value: input.value,
      rationale: input.rationale,
    },
  });

  await synchronizeEngagementFields(engagementId, input);
  await synchronizeBoundary(engagementId);

  return getOnboardingState(engagementId);
}

export async function getBoundarySummary(engagementId: string): Promise<BoundarySummary | undefined> {
  const state = await getOnboardingState(engagementId);
  return state?.boundaryPreview;
}

async function synchronizeEngagementFields(engagementId: string, input: AnswerInput) {
  const data: {
    engagementName?: string;
    leadAssessor?: string;
    targetCmmcLevel?: string;
  } = {};

  if (input.questionId === "engagement-name" && input.value?.trim()) {
    data.engagementName = input.value.trim();
  }

  if (input.questionId === "lead-assessor" && input.value?.trim()) {
    data.leadAssessor = input.value.trim();
  }

  if (input.questionId === "target-cmmc-level" && input.value?.trim()) {
    data.targetCmmcLevel = input.value.trim();
  }

  if (Object.keys(data).length === 0) {
    return;
  }

  await prisma.engagement.update({
    where: { id: engagementId },
    data,
  });
}

function mapEngagementRecord(record: {
  id: string;
  companyId: string;
  engagementName: string;
  targetFrameworks: string[];
  targetCmmcLevel: string;
  currentStage: string;
  currentSectionId: string;
  company: { legalName: string };
}): Engagement {
  return {
    id: record.id,
    companyId: record.companyId,
    companyName: record.company.legalName,
    engagementName: record.engagementName,
    targetFrameworks: record.targetFrameworks,
    targetCmmcLevel: record.targetCmmcLevel,
    currentStage: record.currentStage,
    currentSectionId: record.currentSectionId as SectionId,
  };
}
