// ABOUTME: Seeds the local development database with a baseline engagement.
// ABOUTME: Keeps the first workflow slice usable without runtime seed side effects.
import { prisma } from "@/lib/prisma";
import { synchronizeBoundary } from "@/lib/persistence";

const seedCompanyId = "company-red-canyon";
const seedEngagementId = "eng-red-canyon-001";

async function main() {
  await prisma.company.upsert({
    where: { id: seedCompanyId },
    update: {
      legalName: "Red Canyon Manufacturing",
    },
    create: {
      id: seedCompanyId,
      legalName: "Red Canyon Manufacturing",
    },
  });

  await prisma.engagement.upsert({
    where: { id: seedEngagementId },
    update: {
      companyId: seedCompanyId,
      engagementName: "Red Canyon CMMC readiness",
      targetFrameworks: ["CMMC", "NIST SP 800-171", "NIST SP 800-171A"],
      targetCmmcLevel: "Level 2",
      currentStage: "onboarding",
      currentSectionId: "engagement-setup",
    },
    create: {
      id: seedEngagementId,
      companyId: seedCompanyId,
      engagementName: "Red Canyon CMMC readiness",
      targetFrameworks: ["CMMC", "NIST SP 800-171", "NIST SP 800-171A"],
      targetCmmcLevel: "Level 2",
      currentStage: "onboarding",
      currentSectionId: "engagement-setup",
    },
  });

  await prisma.answer.upsert({
    where: {
      engagementId_questionId: {
        engagementId: seedEngagementId,
        questionId: "engagement-name",
      },
    },
    update: {
      value: "Red Canyon CMMC readiness",
    },
    create: {
      engagementId: seedEngagementId,
      questionId: "engagement-name",
      value: "Red Canyon CMMC readiness",
    },
  });

  await prisma.answer.upsert({
    where: {
      engagementId_questionId: {
        engagementId: seedEngagementId,
        questionId: "target-cmmc-level",
      },
    },
    update: {
      value: "Level 2",
    },
    create: {
      engagementId: seedEngagementId,
      questionId: "target-cmmc-level",
      value: "Level 2",
    },
  });

  await prisma.answer.upsert({
    where: {
      engagementId_questionId: {
        engagementId: seedEngagementId,
        questionId: "handles-fci",
      },
    },
    update: {
      value: "true",
    },
    create: {
      engagementId: seedEngagementId,
      questionId: "handles-fci",
      value: "true",
    },
  });

  await synchronizeBoundary(seedEngagementId);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
