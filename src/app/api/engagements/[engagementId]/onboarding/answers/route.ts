// ABOUTME: Persists onboarding answers through the first workflow API contract.
// ABOUTME: Returns the updated onboarding state after each answer write.
import { NextResponse } from "next/server";
import { saveAnswer } from "@/lib/store";
import type { AnswerInput } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ engagementId: string }> },
) {
  const { engagementId } = await params;
  const body = (await request.json()) as AnswerInput;
  const state = await saveAnswer(engagementId, body);

  if (!state) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  return NextResponse.json({ state });
}
