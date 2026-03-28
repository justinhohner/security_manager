// ABOUTME: Displays the dedicated roadmap workspace for saved program initiatives.
// ABOUTME: Gives consultants a stable list/detail handoff point for planning work.
import Link from "next/link";
import type { RoadmapWorkspaceState } from "@/lib/types";
import styles from "./roadmap-workspace.module.css";

export function RoadmapWorkspace({ state }: { state: RoadmapWorkspaceState }) {
  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.kicker}>Roadmap workspace</p>
          <h1>{state.engagement.engagementName}</h1>
          <p className={styles.subtle}>{state.engagement.companyName}</p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href={`/engagements/${state.engagement.id}/program`}>
            Back to program workspace
          </Link>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <article className={styles.card}>
          <p className={styles.kicker}>Current focus</p>
          <p className={styles.copy}>{state.nextFocus}</p>
        </article>
        <article className={styles.card}>
          <p className={styles.kicker}>Status counts</p>
          <p className={styles.copy}>
            <strong>Candidate:</strong> {state.counts.candidate}
          </p>
          <p className={styles.copy}>
            <strong>Planned:</strong> {state.counts.planned}
          </p>
          <p className={styles.copy}>
            <strong>In progress:</strong> {state.counts.inProgress}
          </p>
          <p className={styles.copy}>
            <strong>Blocked:</strong> {state.counts.blocked}
          </p>
        </article>
      </section>

      <section className={styles.card}>
        <h2>Saved initiatives</h2>
        <div className={styles.stack}>
          {state.initiatives.map((initiative) => (
            <div className={styles.initiativeCard} key={initiative.id}>
              <div className={styles.cardHeader}>
                <h3>{initiative.title}</h3>
                <span className={styles.badge}>{initiative.priority.replaceAll("-", " ")}</span>
              </div>
              <p className={styles.copy}>{initiative.summary}</p>
              <p className={styles.copy}>
                <strong>Status:</strong> {initiative.status}
              </p>
              <p className={styles.copy}>
                <strong>Owner:</strong> {initiative.owner?.trim() ? initiative.owner : "Unassigned"}
              </p>
              <p className={styles.copy}>
                <strong>Target date:</strong> {initiative.targetDate ?? "Not scheduled"}
              </p>
              {initiative.blockers?.trim() ? (
                <p className={styles.blocker}>
                  <strong>Blocked:</strong> {initiative.blockers}
                </p>
              ) : null}
              <Link
                className={styles.detailLink}
                href={`/engagements/${state.engagement.id}/program/initiatives/${initiative.id}`}
              >
                Open initiative detail
              </Link>
            </div>
          ))}
          {state.initiatives.length === 0 ? <p className={styles.copy}>No saved initiatives yet.</p> : null}
        </div>
      </section>
    </main>
  );
}
