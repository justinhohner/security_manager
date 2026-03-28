// ABOUTME: Displays the parallel program-first workspace for one engagement.
// ABOUTME: Surfaces the derived capability baseline and roadmap preview from onboarding data.
"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProgramBaselineState } from "@/lib/types";
import styles from "./program-workspace.module.css";

export function ProgramWorkspace({ state }: { state: ProgramBaselineState }) {
  const [currentState, setCurrentState] = useState(state);
  const [savingPreviewId, setSavingPreviewId] = useState<string | null>(null);

  async function handleInitiativeSave(previewId: string) {
    setSavingPreviewId(previewId);

    const response = await fetch(`/api/engagements/${currentState.engagement.id}/initiatives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ previewId }),
    });
    const data = (await response.json()) as { state: ProgramBaselineState };

    setCurrentState(data.state);
    setSavingPreviewId(null);
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.kicker}>Program workspace</p>
          <h1>{currentState.engagement.engagementName}</h1>
          <p className={styles.subtle}>{currentState.engagement.companyName}</p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href={`/engagements/${currentState.engagement.id}`}>
            Back to onboarding
          </Link>
          <Link className={styles.secondaryButton} href={`/engagements/${currentState.engagement.id}/assessment`}>
            Existing assessment view
          </Link>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <article className={styles.card}>
          <p className={styles.kicker}>Operating profile</p>
          <p className={styles.copy}>{currentState.summary.operatingProfile}</p>
        </article>
        <article className={styles.card}>
          <p className={styles.kicker}>Current signal</p>
          <p className={styles.copy}>
            <strong>Strongest area:</strong> {currentState.summary.strongestArea}
          </p>
          <p className={styles.copy}>
            <strong>Weakest area:</strong> {currentState.summary.weakestArea}
          </p>
          <p className={styles.copy}>{currentState.summary.confidenceNote}</p>
        </article>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Capability baseline</h2>
          <div className={styles.stack}>
            {currentState.capabilities.map((capability) => (
              <div className={styles.capabilityCard} key={capability.id}>
                <div className={styles.cardHeader}>
                  <h3>{capability.name}</h3>
                  <span className={styles.badge}>
                    Maturity {capability.maturityScore}/5 · Confidence {capability.confidenceScore}/5
                  </span>
                </div>
                <p className={styles.copy}>{capability.summary}</p>
                <p className={styles.copy}>
                  <strong>Top gap:</strong> {capability.topGap}
                </p>
                <Link
                  className={styles.detailLink}
                  href={`/engagements/${currentState.engagement.id}/program/${capability.id}`}
                >
                  Open capability detail
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <h2>Roadmap preview</h2>
          <div className={styles.stack}>
            {currentState.roadmapPreview.map((initiative) => (
              <div className={styles.initiativeCard} key={initiative.id}>
                <div className={styles.cardHeader}>
                  <h3>{initiative.title}</h3>
                  <span className={styles.badge}>{initiative.priority.replaceAll("-", " ")}</span>
                </div>
                <p className={styles.copy}>{initiative.rationale}</p>
                <button
                  className={styles.detailLink}
                  disabled={savingPreviewId === initiative.id}
                  onClick={() => void handleInitiativeSave(initiative.id)}
                  type="button"
                >
                  {savingPreviewId === initiative.id ? "Saving..." : "Save initiative candidate"}
                </button>
              </div>
            ))}
          </div>

          <div className={styles.savedSection}>
            <h3>Saved initiatives</h3>
            {currentState.initiatives.length > 0 ? (
              <div className={styles.stack}>
                {currentState.initiatives.map((initiative) => (
                  <div className={styles.initiativeCard} key={initiative.id}>
                    <div className={styles.cardHeader}>
                      <h3>{initiative.title}</h3>
                      <span className={styles.badge}>{initiative.priority.replaceAll("-", " ")}</span>
                    </div>
                    <p className={styles.copy}>{initiative.summary}</p>
                    <p className={styles.copy}>
                      <strong>Status:</strong> {initiative.status}
                    </p>
                    <Link
                      className={styles.detailLink}
                      href={`/engagements/${currentState.engagement.id}/program/initiatives/${initiative.id}`}
                    >
                      Open initiative detail
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.copy}>No saved initiatives yet.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
