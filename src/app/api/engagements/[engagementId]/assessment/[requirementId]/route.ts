// ABOUTME: Serves requirement-detail data for the starter assessment workspace.
// ABOUTME: Exposes mapped prompts, evidence references, and next-step guidance.
import { NextResponse } from "next/server";
import { getEngagement, getRequirementDetailState } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ engagementId: string; requirementId: string }> },
) {
  void request;
  const { engagementId, requirementId } = await params;

  if (!(await getEngagement(engagementId))) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const detail = await getRequirementDetailState(engagementId, requirementId);

  if (!detail) {
    return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
  }

  return NextResponse.json({ detail });
}
