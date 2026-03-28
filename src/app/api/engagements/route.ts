// ABOUTME: Serves the engagement collection API for the first workflow slice.
// ABOUTME: Supports listing engagements and creating a new engagement shell.
import { NextResponse } from "next/server";
import { createEngagement, listEngagements } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    engagements: listEngagements(),
  });
}

export async function POST() {
  const engagement = createEngagement();

  return NextResponse.json(
    {
      engagement,
    },
    { status: 201 },
  );
}
