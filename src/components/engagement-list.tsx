// ABOUTME: Displays the engagement index and lets the user create new work.
// ABOUTME: Drives the first screen in the onboarding workflow sequence.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Engagement } from "@/lib/types";
import styles from "./engagement-list.module.css";

export function EngagementList({ initialEngagements }: { initialEngagements: Engagement[] }) {
  const router = useRouter();
  const [engagements] = useState<Engagement[]>(initialEngagements);
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateEngagement() {
    setIsCreating(true);

    const response = await fetch("/api/engagements", {
      method: "POST",
    });

    const data = (await response.json()) as { engagement: Engagement };
    router.push(`/engagements/${data.engagement.id}`);
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Security Manager</p>
        <h1>Consultant-led onboarding for compliance and resilience work.</h1>
        <p className={styles.lead}>
          Start with engagements, capture structured onboarding answers, and keep the emerging
          boundary visible from the beginning.
        </p>
        <button className={styles.primaryAction} onClick={handleCreateEngagement} disabled={isCreating}>
          {isCreating ? "Creating engagement..." : "Create engagement"}
        </button>
      </section>

      <section className={styles.listCard}>
        <div className={styles.listHeader}>
          <div>
            <p className={styles.sectionLabel}>Active engagements</p>
            <h2>Current workflow queue</h2>
          </div>
          <p className={styles.count}>{engagements.length} tracked engagements</p>
        </div>
        <div className={styles.table}>
          {engagements.map((engagement) => (
            <Link className={styles.row} key={engagement.id} href={`/engagements/${engagement.id}`}>
              <div>
                <h3>{engagement.companyName}</h3>
                <p>{engagement.engagementName}</p>
              </div>
              <div>
                <span className={styles.badge}>{engagement.targetCmmcLevel}</span>
                <p>{engagement.targetFrameworks.join(" / ")}</p>
              </div>
              <div>
                <p className={styles.stage}>{engagement.currentStage}</p>
                <p>{engagement.currentSectionId}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
