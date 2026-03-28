// ABOUTME: Serves the onboarding workspace API for one engagement.
// ABOUTME: Returns the frontend-ready state needed to render the workflow screen.
import { NextResponse } from "next/server";
import { getOnboardingState } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ engagementId: string }> },
) {
  void request;
  const { engagementId } = await params;
  const state = await getOnboardingState(engagementId);

  if (!state) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  return NextResponse.json({ state });
}
