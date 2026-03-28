// ABOUTME: Serves one derived capability detail view for the program-first workspace.
// ABOUTME: Returns the capability rationale, evidence signals, and linked roadmap context.
import { NextResponse } from "next/server";
import { getCapabilityDetailState } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ engagementId: string; capabilityId: string }> },
) {
  void request;
  const { engagementId, capabilityId } = await params;
  const state = await getCapabilityDetailState(engagementId, capabilityId);

  if (!state) {
    return NextResponse.json({ error: "Capability not found" }, { status: 404 });
  }

  return NextResponse.json({ state });
}
