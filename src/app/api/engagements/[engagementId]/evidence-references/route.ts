// ABOUTME: Creates lightweight evidence references tied to onboarding answers.
// ABOUTME: Returns the updated onboarding state so the workspace stays in sync.
import { NextResponse } from "next/server";
import { createEvidenceReference, getEngagement } from "@/lib/store";
import type { EvidenceReferenceInput } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ engagementId: string }> },
) {
  const { engagementId } = await params;

  if (!(await getEngagement(engagementId))) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const body = (await request.json()) as EvidenceReferenceInput;
  const state = await createEvidenceReference(engagementId, body);

  if (!state) {
    return NextResponse.json({ error: "Evidence must be attached to an answered question" }, { status: 400 });
  }

  return NextResponse.json({ state }, { status: 201 });
}
