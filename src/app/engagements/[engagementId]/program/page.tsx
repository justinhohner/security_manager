// ABOUTME: Renders the parallel program-first workspace for one engagement.
// ABOUTME: Shows the derived capability baseline and roadmap preview from saved onboarding state.
import { notFound } from "next/navigation";
import { ProgramWorkspace } from "@/components/program-workspace";
import { getProgramBaselineState } from "@/lib/store";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const state = await getProgramBaselineState(engagementId);

  if (!state) {
    notFound();
  }

  return <ProgramWorkspace state={state} />;
}
