// ABOUTME: Displays the parallel program-first workspace for one engagement.
// ABOUTME: Surfaces the derived capability baseline and roadmap preview from onboarding data.
import Link from "next/link";
import type { ProgramBaselineState } from "@/lib/types";
import styles from "./program-workspace.module.css";

export function ProgramWorkspace({ state }: { state: ProgramBaselineState }) {
  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.kicker}>Program workspace</p>
          <h1>{state.engagement.engagementName}</h1>
          <p className={styles.subtle}>{state.engagement.companyName}</p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href={`/engagements/${state.engagement.id}`}>
            Back to onboarding
          </Link>
          <Link className={styles.secondaryButton} href={`/engagements/${state.engagement.id}/assessment`}>
            Existing assessment view
          </Link>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <article className={styles.card}>
          <p className={styles.kicker}>Operating profile</p>
          <p className={styles.copy}>{state.summary.operatingProfile}</p>
        </article>
        <article className={styles.card}>
          <p className={styles.kicker}>Current signal</p>
          <p className={styles.copy}>
            <strong>Strongest area:</strong> {state.summary.strongestArea}
          </p>
          <p className={styles.copy}>
            <strong>Weakest area:</strong> {state.summary.weakestArea}
          </p>
          <p className={styles.copy}>{state.summary.confidenceNote}</p>
        </article>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Capability baseline</h2>
          <div className={styles.stack}>
            {state.capabilities.map((capability) => (
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
                  href={`/engagements/${state.engagement.id}/program/${capability.id}`}
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
            {state.roadmapPreview.map((initiative) => (
              <div className={styles.initiativeCard} key={initiative.id}>
                <div className={styles.cardHeader}>
                  <h3>{initiative.title}</h3>
                  <span className={styles.badge}>{initiative.priority.replaceAll("-", " ")}</span>
                </div>
                <p className={styles.copy}>{initiative.rationale}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
