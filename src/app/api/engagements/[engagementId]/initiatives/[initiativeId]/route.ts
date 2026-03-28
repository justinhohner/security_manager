// ABOUTME: Serves and updates one saved initiative inside the program-first workflow.
// ABOUTME: Keeps initiative detail and status transitions available without a separate planning system.
import { NextResponse } from "next/server";
import { getInitiativeDetailState, updateInitiativePlan, updateInitiativeStatus } from "@/lib/store";
import type { Initiative } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ engagementId: string; initiativeId: string }> },
) {
  void request;
  const { engagementId, initiativeId } = await params;
  const state = await getInitiativeDetailState(engagementId, initiativeId);

  if (!state) {
    return NextResponse.json({ error: "Initiative not found" }, { status: 404 });
  }

  return NextResponse.json({ state });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ engagementId: string; initiativeId: string }> },
) {
  const { engagementId, initiativeId } = await params;
  const body = (await request.json()) as {
    status?: Initiative["status"];
    owner?: string;
    targetDate?: string;
    notes?: string;
    blockers?: string;
  };
  const state =
    body.status && Object.keys(body).length === 1
      ? await updateInitiativeStatus(engagementId, initiativeId, body.status)
      : await updateInitiativePlan(engagementId, initiativeId, body);

  if (!state) {
    return NextResponse.json({ error: "Initiative not found" }, { status: 404 });
  }

  return NextResponse.json({ state });
}
