// ABOUTME: Persists engagement workflow state through Prisma for the first slice.
// ABOUTME: Keeps onboarding, boundary state, and seeded sample data aligned.
import { prisma } from "@/lib/prisma";
import { BASELINE_QUESTIONS, SECTION_ORDER, buildBoundarySummary, buildFollowUpQuestions, buildSectionStatuses } from "@/lib/onboarding";
import { buildManualSystems, mapAnswers, resolveBoundarySummary, synchronizeBoundary } from "@/lib/persistence";
import { type AnswerInput, type BoundarySummary, type BoundaryUpdateInput, type Engagement, type OnboardingState, type SectionId } from "@/lib/types";

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
        ...resolveBoundarySummary(derivedBoundary, engagement.boundary),
        includesCui: engagement.boundary.includesCui,
        includesFci: engagement.boundary.includesFci,
        unresolvedScopeQuestions: engagement.boundary.unresolvedScope,
        inScopeSystems: engagement.systems.map((system) => system.name),
        protectedSystems: engagement.systems.filter((system) => system.protectsCui).map((system) => system.name),
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

export async function updateBoundary(
  engagementId: string,
  input: BoundaryUpdateInput,
): Promise<OnboardingState | undefined> {
  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: {
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
  const existingBoundary = engagement.boundary;
  const nextBoundary = {
    summary: input.summary?.trim() || derivedBoundary.summary,
    assumptions: input.assumptions ?? existingBoundary?.assumptions ?? derivedBoundary.assumptions,
    exclusions: input.exclusions ?? existingBoundary?.exclusions ?? derivedBoundary.exclusions,
    confidence: input.confidence ?? existingBoundary?.confidence ?? derivedBoundary.confidence,
    inScopeSystems:
      input.inScopeSystems ??
      (engagement.systems.length > 0 ? engagement.systems.map((system) => system.name) : derivedBoundary.inScopeSystems),
    protectedSystems:
      input.protectedSystems ??
      (engagement.systems.length > 0
        ? engagement.systems.filter((system) => system.protectsCui).map((system) => system.name)
        : derivedBoundary.protectedSystems),
  };

  const systems = buildManualSystems(nextBoundary.inScopeSystems, nextBoundary.protectedSystems);

  await prisma.$transaction([
    prisma.assessmentBoundary.upsert({
      where: { engagementId },
      create: {
        engagementId,
        summary: nextBoundary.summary,
        includesCui: derivedBoundary.includesCui,
        includesFci: derivedBoundary.includesFci,
        assumptions: nextBoundary.assumptions,
        exclusions: nextBoundary.exclusions,
        unresolvedScope: derivedBoundary.unresolvedScopeQuestions,
        confidence: nextBoundary.confidence,
        summaryManual: "summary" in input,
        assumptionsManual: "assumptions" in input,
        exclusionsManual: "exclusions" in input,
        confidenceManual: "confidence" in input,
        systemsManual: "inScopeSystems" in input || "protectedSystems" in input,
      },
      update: {
        summary: nextBoundary.summary,
        includesCui: derivedBoundary.includesCui,
        includesFci: derivedBoundary.includesFci,
        assumptions: nextBoundary.assumptions,
        exclusions: nextBoundary.exclusions,
        unresolvedScope: derivedBoundary.unresolvedScopeQuestions,
        confidence: nextBoundary.confidence,
        summaryManual: "summary" in input ? true : existingBoundary?.summaryManual ?? false,
        assumptionsManual: "assumptions" in input ? true : existingBoundary?.assumptionsManual ?? false,
        exclusionsManual: "exclusions" in input ? true : existingBoundary?.exclusionsManual ?? false,
        confidenceManual: "confidence" in input ? true : existingBoundary?.confidenceManual ?? false,
        systemsManual:
          "inScopeSystems" in input || "protectedSystems" in input
            ? true
            : existingBoundary?.systemsManual ?? false,
      },
    }),
    prisma.system.deleteMany({
      where: { engagementId },
    }),
    prisma.system.createMany({
      data: systems.map((system) => ({
        engagementId,
        name: system.name,
        storesCui: system.storesCui,
        processesCui: system.processesCui,
        transmitsCui: system.transmitsCui,
        protectsCui: system.protectsCui,
      })),
      skipDuplicates: true,
    }),
  ]);

  return getOnboardingState(engagementId);
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
