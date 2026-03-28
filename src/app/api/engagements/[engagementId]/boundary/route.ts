// ABOUTME: Serves the derived boundary summary for the first slice.
// ABOUTME: Exposes the current scope view without requiring frontend reconstruction.
import { NextResponse } from "next/server";
import { getBoundarySummary, getEngagement, updateBoundary } from "@/lib/store";
import type { BoundaryUpdateInput } from "@/lib/types";

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
    boundary: await getBoundarySummary(engagementId),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ engagementId: string }> },
) {
  const { engagementId } = await params;

  if (!(await getEngagement(engagementId))) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const body = (await request.json()) as BoundaryUpdateInput;
  const state = await updateBoundary(engagementId, body);

  return NextResponse.json({ state });
}
