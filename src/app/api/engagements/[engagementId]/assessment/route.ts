// ABOUTME: Serves the starter requirement mapping view for one engagement.
// ABOUTME: Derives requirement support status from onboarding answers and evidence references.
import { NextResponse } from "next/server";
import { getAssessmentState, getEngagement } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ engagementId: string }> },
) {
  void request;
  const { engagementId } = await params;

  if (!(await getEngagement(engagementId))) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  return NextResponse.json({
    assessment: await getAssessmentState(engagementId),
  });
}
