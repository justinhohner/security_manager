// ABOUTME: Displays one saved initiative and allows simple status progression.
// ABOUTME: Keeps early roadmap planning lightweight while giving consultants a concrete next-step view.
"use client";

import Link from "next/link";
import { useState } from "react";
import type { InitiativeDetailState } from "@/lib/types";
import styles from "./initiative-detail-workspace.module.css";

export function InitiativeDetailWorkspace({ initialState }: { initialState: InitiativeDetailState }) {
  const [state, setState] = useState(initialState);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  async function handleStatusChange(status: "planned" | "in-progress") {
    setSavingStatus(status);

    const response = await fetch(
      `/api/engagements/${state.engagement.id}/initiatives/${state.initiative.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );
    const data = (await response.json()) as { state: InitiativeDetailState };

    setState(data.state);
    setSavingStatus(null);
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.kicker}>Initiative detail</p>
          <h1>{state.initiative.title}</h1>
          <p className={styles.subtle}>{state.engagement.companyName}</p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href={`/engagements/${state.engagement.id}/program`}>
            Back to program workspace
          </Link>
        </div>
      </section>

      <section className={styles.summaryCard}>
        <span className={styles.badge}>{state.initiative.priority.replaceAll("-", " ")}</span>
        <p className={styles.copy}>{state.initiative.summary}</p>
        <p className={styles.copy}>
          <strong>Status:</strong> {state.initiative.status}
        </p>
        <p className={styles.copy}>
          <strong>Why now:</strong> {state.initiative.whyNow}
        </p>
      </section>

      <section className={styles.card}>
        <h2>Next status options</h2>
        {state.initiative.nextStatusOptions.length > 0 ? (
          <div className={styles.actions}>
            {state.initiative.nextStatusOptions.map((option) => (
              <button
                className={styles.primaryButton}
                disabled={savingStatus === option}
                key={option}
                onClick={() => void handleStatusChange(option)}
                type="button"
              >
                {savingStatus === option ? "Saving..." : `Mark as ${option.replaceAll("-", " ")}`}
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.copy}>No further status transitions are available from the current state.</p>
        )}
      </section>
    </main>
  );
}
