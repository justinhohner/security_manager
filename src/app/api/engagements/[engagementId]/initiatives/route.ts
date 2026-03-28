// ABOUTME: Saves initiative candidates from the program-first roadmap preview.
// ABOUTME: Returns the refreshed program baseline so the workspace stays in sync.
import { NextResponse } from "next/server";
import { createInitiativeCandidate, getEngagement } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ engagementId: string }> },
) {
  const { engagementId } = await params;

  if (!(await getEngagement(engagementId))) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const body = (await request.json()) as { previewId?: string };
  const state = body.previewId ? await createInitiativeCandidate(engagementId, body.previewId) : undefined;

  if (!state) {
    return NextResponse.json({ error: "Initiative preview not found" }, { status: 404 });
  }

  return NextResponse.json({ state }, { status: 201 });
}
