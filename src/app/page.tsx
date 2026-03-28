// ABOUTME: Redirects the root route into the engagement workflow surface.
// ABOUTME: Keeps the initial app entry focused on the first implementation slice.
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/engagements");
}
