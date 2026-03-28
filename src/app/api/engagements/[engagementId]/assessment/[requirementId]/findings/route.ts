// ABOUTME: Saves requirement-detail finding candidates for later assessor review.
// ABOUTME: Returns the refreshed requirement detail so the page stays in sync.
import { NextResponse } from "next/server";
import { createFindingCandidate, getEngagement } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ engagementId: string; requirementId: string }> },
) {
  void request;
  const { engagementId, requirementId } = await params;

  if (!(await getEngagement(engagementId))) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const detail = await createFindingCandidate(engagementId, requirementId);

  if (!detail) {
    return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
  }

  return NextResponse.json({ detail }, { status: 201 });
}
