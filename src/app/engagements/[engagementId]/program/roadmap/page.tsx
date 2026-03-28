// ABOUTME: Renders the dedicated roadmap workspace for saved initiatives.
// ABOUTME: Gives the program-first flow a stable list view for planning work.
import { notFound } from "next/navigation";
import { RoadmapWorkspace } from "@/components/roadmap-workspace";
import { getRoadmapWorkspaceState } from "@/lib/store";

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const state = await getRoadmapWorkspaceState(engagementId);

  if (!state) {
    notFound();
  }

  return <RoadmapWorkspace state={state} />;
}
