// ABOUTME: Renders the onboarding and boundary workspace for one engagement.
// ABOUTME: Hosts the first end-to-end consultant flow for slice 001.
import { notFound } from "next/navigation";
import { EngagementWorkspace } from "@/components/engagement-workspace";
import { getOnboardingState } from "@/lib/store";

export default async function EngagementPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const state = await getOnboardingState(engagementId);

  if (!state) {
    notFound();
  }

  return <EngagementWorkspace initialState={state} />;
}
