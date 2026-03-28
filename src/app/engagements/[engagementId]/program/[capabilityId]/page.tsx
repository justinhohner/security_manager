// ABOUTME: Renders one derived capability detail view for the program-first workflow.
// ABOUTME: Keeps capability drill-down separate from the existing assessment-first routes.
import { notFound } from "next/navigation";
import { CapabilityDetailWorkspace } from "@/components/capability-detail-workspace";
import { getCapabilityDetailState } from "@/lib/store";

export default async function CapabilityPage({
  params,
}: {
  params: Promise<{ engagementId: string; capabilityId: string }>;
}) {
  const { engagementId, capabilityId } = await params;
  const state = await getCapabilityDetailState(engagementId, capabilityId);

  if (!state) {
    notFound();
  }

  return <CapabilityDetailWorkspace state={state} />;
}
