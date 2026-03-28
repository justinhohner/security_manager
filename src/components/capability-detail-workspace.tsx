// ABOUTME: Displays one capability detail view inside the program-first workflow.
// ABOUTME: Explains why the capability matters, what signals exist, and what should happen next.
import Link from "next/link";
import type { CapabilityDetailState } from "@/lib/types";
import styles from "./capability-detail-workspace.module.css";

export function CapabilityDetailWorkspace({ state }: { state: CapabilityDetailState }) {
  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.kicker}>Capability detail</p>
          <h1>{state.capability.name}</h1>
          <p className={styles.subtle}>{state.engagement.companyName}</p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href={`/engagements/${state.engagement.id}/program`}>
            Back to program workspace
          </Link>
          <Link className={styles.secondaryButton} href={`/engagements/${state.engagement.id}`}>
            Back to onboarding
          </Link>
        </div>
      </section>

      <section className={styles.summaryCard}>
        <span className={styles.badge}>
          Maturity {state.capability.maturityScore}/5 · Confidence {state.capability.confidenceScore}/5
        </span>
        <p className={styles.copy}>{state.capability.summary}</p>
        <p className={styles.copy}>
          <strong>Why it matters:</strong> {state.capability.whyItMatters}
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Evidence signals</h2>
          <ul className={styles.list}>
            {state.capability.evidenceSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Next actions</h2>
          <ul className={styles.list}>
            {state.capability.nextActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={styles.copy}>
            <strong>Linked initiatives:</strong>{" "}
            {state.capability.linkedInitiativeIds.length > 0
              ? state.capability.linkedInitiativeIds.join(", ")
              : "No linked initiatives yet."}
          </p>
        </article>
      </section>
    </main>
  );
}
