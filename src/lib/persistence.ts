// ABOUTME: Centralizes persistence helpers shared by runtime code and seed setup.
// ABOUTME: Keeps boundary derivation and answer mapping consistent across flows.
import { prisma } from "@/lib/prisma";
import { answerToRecord, buildBoundarySummary, buildSystemSnapshots } from "@/lib/onboarding";
import { type Answer, type BoundarySummary, type EvidenceReference } from "@/lib/types";

export function mapAnswers(records: Array<{
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

export async function synchronizeBoundary(engagementId: string) {
  const answerRecords = await prisma.answer.findMany({
    where: { engagementId },
  });

  const answerMap = mapAnswers(answerRecords);
  const derivedBoundary = buildBoundarySummary(answerMap);
  const derivedSystems = buildSystemSnapshots(answerMap);
  const existingBoundary = await prisma.assessmentBoundary.findUnique({
    where: { engagementId },
  });
  const existingSystems = existingBoundary?.systemsManual
    ? await prisma.system.findMany({
        where: { engagementId },
      })
    : [];
  const boundary = resolveBoundarySummary(derivedBoundary, existingBoundary);
  const systems = existingBoundary?.systemsManual
    ? existingSystems.map((system) => ({
        name: system.name,
        storesCui: system.storesCui,
        processesCui: system.processesCui,
        transmitsCui: system.transmitsCui,
        protectsCui: system.protectsCui,
      }))
    : derivedSystems;

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
        summaryManual: existingBoundary?.summaryManual ?? false,
        assumptionsManual: existingBoundary?.assumptionsManual ?? false,
        exclusionsManual: existingBoundary?.exclusionsManual ?? false,
        confidenceManual: existingBoundary?.confidenceManual ?? false,
        systemsManual: existingBoundary?.systemsManual ?? false,
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

export function mapEvidenceReferences(
  records: Array<{
    id: string;
    engagementId: string;
    answerId: string | null;
    title: string;
    source: string;
    note: string | null;
    answer?: {
      questionId: string;
    } | null;
  }>,
): Record<string, EvidenceReference[]> {
  const mapped = records.map((record) => ({
    id: record.id,
    engagementId: record.engagementId,
    answerId: record.answerId ?? undefined,
    questionId: record.answer?.questionId,
    title: record.title,
    source: record.source,
    note: record.note ?? undefined,
  }));

  return mapped.reduce<Record<string, EvidenceReference[]>>((accumulator, reference) => {
    if (!reference.questionId) {
      return accumulator;
    }

    const current = accumulator[reference.questionId] ?? [];
    accumulator[reference.questionId] = [...current, reference];
    return accumulator;
  }, {});
}

export function buildManualSystems(inScopeSystems: string[], protectedSystems: string[]) {
  const inScopeNames = normalizeStringList(inScopeSystems);
  const protectedNames = new Set(normalizeStringList(protectedSystems));

  return inScopeNames.map((name) => ({
    name,
    storesCui: false,
    processesCui: false,
    transmitsCui: false,
    protectsCui: protectedNames.has(name),
  }));
}

export function resolveBoundarySummary(
  derived: BoundarySummary,
  existing?: {
    summary: string;
    assumptions: string[];
    exclusions: string[];
    confidence: number;
    summaryManual: boolean;
    assumptionsManual: boolean;
    exclusionsManual: boolean;
    confidenceManual: boolean;
  } | null,
): BoundarySummary {
  if (!existing) {
    return derived;
  }

  return {
    ...derived,
    summary: existing.summaryManual ? existing.summary : derived.summary,
    assumptions: existing.assumptionsManual ? existing.assumptions : derived.assumptions,
    exclusions: existing.exclusionsManual ? existing.exclusions : derived.exclusions,
    confidence: existing.confidenceManual ? existing.confidence : derived.confidence,
  };
}

function normalizeStringList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}
