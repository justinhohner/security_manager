// ABOUTME: Renders one saved initiative detail page for the program-first workflow.
// ABOUTME: Lets consultants move initiative candidates into the next planning states.
import { notFound } from "next/navigation";
import { InitiativeDetailWorkspace } from "@/components/initiative-detail-workspace";
import { getInitiativeDetailState } from "@/lib/store";

export default async function InitiativePage({
  params,
}: {
  params: Promise<{ engagementId: string; initiativeId: string }>;
}) {
  const { engagementId, initiativeId } = await params;
  const state = await getInitiativeDetailState(engagementId, initiativeId);

  if (!state) {
    notFound();
  }

  return <InitiativeDetailWorkspace initialState={state} />;
}
