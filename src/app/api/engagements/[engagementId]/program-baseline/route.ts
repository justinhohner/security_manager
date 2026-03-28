// ABOUTME: Serves the program-first baseline workspace API for one engagement.
// ABOUTME: Returns capability summaries and roadmap preview derived from onboarding data.
import { NextResponse } from "next/server";
import { getProgramBaselineState } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ engagementId: string }> },
) {
  void request;
  const { engagementId } = await params;
  const state = await getProgramBaselineState(engagementId);

  if (!state) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  return NextResponse.json({ state });
}
