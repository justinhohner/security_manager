// ABOUTME: Renders the engagement list and create action for the first slice.
// ABOUTME: Acts as the main landing surface for consultants entering the app.
import { EngagementList } from "@/components/engagement-list";
import { listEngagements } from "@/lib/store";

export default async function EngagementsPage() {
  return <EngagementList initialEngagements={await listEngagements()} />;
}
