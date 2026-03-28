// ABOUTME: Centralizes persistence helpers shared by runtime code and seed setup.
// ABOUTME: Keeps boundary derivation and answer mapping consistent across flows.
import { prisma } from "@/lib/prisma";
import { answerToRecord, buildBoundarySummary, buildSystemSnapshots } from "@/lib/onboarding";
import { type Answer } from "@/lib/types";

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
