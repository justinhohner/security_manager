// ABOUTME: Updates the active onboarding section for one engagement.
// ABOUTME: Keeps navigation state and workspace data synchronized through the API.
import { NextResponse } from "next/server";
import { getOnboardingState, setCurrentSection } from "@/lib/store";
import type { SectionId } from "@/lib/types";

const validSections = new Set<SectionId>([
  "engagement-setup",
  "business-contract-context",
  "organization-profile",
  "environment-overview",
  "boundary-baseline",
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ engagementId: string; sectionId: string }> },
) {
  void request;
  const { engagementId, sectionId } = await params;

  if (!validSections.has(sectionId as SectionId)) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const engagement = setCurrentSection(engagementId, sectionId as SectionId);

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const state = getOnboardingState(engagementId);
  return NextResponse.json({ state });
}
