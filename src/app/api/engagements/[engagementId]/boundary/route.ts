// ABOUTME: Serves the derived boundary summary for the first slice.
// ABOUTME: Exposes the current scope view without requiring frontend reconstruction.
import { NextResponse } from "next/server";
import { getBoundarySummary, getEngagement } from "@/lib/store";

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
