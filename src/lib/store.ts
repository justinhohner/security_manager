// ABOUTME: Persists engagement workflow state through Prisma for the first slice.
// ABOUTME: Keeps onboarding, boundary state, and seeded sample data aligned.
import { prisma } from "@/lib/prisma";
import { BASELINE_QUESTIONS, SECTION_ORDER, answerToRecord, buildBoundarySummary, buildFollowUpQuestions, buildSectionStatuses, buildSystemSnapshots } from "@/lib/onboarding";
import { type Answer, type AnswerInput, type BoundarySummary, type Engagement, type OnboardingState, type SectionId } from "@/lib/types";

const SEED_COMPANY_ID = "company-red-canyon";
const SEED_ENGAGEMENT_ID = "eng-red-canyon-001";

export async function listEngagements(): Promise<Engagement[]> {
  await ensureSeedData();

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
  await ensureSeedData();

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
  await ensureSeedData();

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

async function ensureSeedData() {
  const existingCompany = await prisma.company.findUnique({
    where: { id: SEED_COMPANY_ID },
  });

  if (existingCompany) {
    return;
  }

  await prisma.company.create({
    data: {
      id: SEED_COMPANY_ID,
      legalName: "Red Canyon Manufacturing",
      engagements: {
        create: {
          id: SEED_ENGAGEMENT_ID,
          engagementName: "Red Canyon CMMC readiness",
          targetFrameworks: ["CMMC", "NIST SP 800-171", "NIST SP 800-171A"],
          targetCmmcLevel: "Level 2",
          currentStage: "onboarding",
          currentSectionId: SECTION_ORDER[0].id,
          answers: {
            create: [
              {
                questionId: "engagement-name",
                value: "Red Canyon CMMC readiness",
              },
              {
                questionId: "target-cmmc-level",
                value: "Level 2",
              },
              {
                questionId: "handles-fci",
                value: "true",
              },
            ],
          },
        },
      },
    },
  });

  await synchronizeBoundary(SEED_ENGAGEMENT_ID);
}

function mapAnswers(records: Array<{
  id: string;
  engagementId: string;
  questionId: string;
  score: number | null;
  value: string | null;
  rationale: string | null;
}>): Record<string, Answer> {
  return Object.fromEntries(
    records.map((record) => [
      record.questionId,
      answerToRecord(record.engagementId, {
        questionId: record.questionId,
        score: record.score ?? undefined,
        value: record.value ?? undefined,
        rationale: record.rationale ?? undefined,
      }),
    ]),
  );
}

async function synchronizeBoundary(engagementId: string) {
  const answerRecords = await prisma.answer.findMany({
    where: { engagementId },
  });

  const answerMap = mapAnswers(answerRecords);
  const boundary = buildBoundarySummary(answerMap);
  const systems = buildSystemSnapshots(answerMap);

  await prisma.$transaction([
    prisma.assessmentBoundary.upsert({
      where: { engagementId },
      create: {
        engagementId,
        summary: boundary.summary,
        includesCui: boundary.includesCui,
        includesFci: boundary.includesFci,
        assumptions: boundary.assumptions,
        exclusions: boundary.exclusions,
        unresolvedScope: boundary.unresolvedScopeQuestions,
        confidence: boundary.confidence,
      },
      update: {
        summary: boundary.summary,
        includesCui: boundary.includesCui,
        includesFci: boundary.includesFci,
        assumptions: boundary.assumptions,
        exclusions: boundary.exclusions,
        unresolvedScope: boundary.unresolvedScopeQuestions,
        confidence: boundary.confidence,
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
