// ABOUTME: Renders the starter requirement mapping workspace for one engagement.
// ABOUTME: Gives consultants a first assessment view derived from onboarding and evidence.
import { notFound } from "next/navigation";
import { AssessmentWorkspace } from "@/components/assessment-workspace";
import { getAssessmentState } from "@/lib/store";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const assessment = await getAssessmentState(engagementId);

  if (!assessment) {
    notFound();
  }

  return <AssessmentWorkspace assessment={assessment} />;
}
