// ABOUTME: Serves the dedicated roadmap workspace for the program-first workflow.
// ABOUTME: Returns saved initiatives with status counts and next-focus guidance.
import { NextResponse } from "next/server";
import { getRoadmapWorkspaceState } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ engagementId: string }> },
) {
  void request;
  const { engagementId } = await params;
  const state = await getRoadmapWorkspaceState(engagementId);

  if (!state) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  return NextResponse.json({ state });
}
