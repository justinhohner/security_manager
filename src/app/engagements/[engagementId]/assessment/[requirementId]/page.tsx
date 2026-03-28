// ABOUTME: Renders the starter requirement-detail page for one mapped requirement.
// ABOUTME: Shows mapped prompts, evidence, and a candidate finding narrative.
import { notFound } from "next/navigation";
import { RequirementDetailWorkspace } from "@/components/requirement-detail-workspace";
import { getRequirementDetailState } from "@/lib/store";

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ engagementId: string; requirementId: string }>;
}) {
  const { engagementId, requirementId } = await params;
  const detail = await getRequirementDetailState(engagementId, requirementId);

  if (!detail) {
    notFound();
  }

  return <RequirementDetailWorkspace detail={detail} />;
}
