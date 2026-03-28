// ABOUTME: Displays the starter requirement mapping view for an engagement.
// ABOUTME: Surfaces mapped onboarding coverage before full findings generation exists.
import Link from "next/link";
import type { AssessmentState } from "@/lib/types";
import styles from "./assessment-workspace.module.css";

export function AssessmentWorkspace({ assessment }: { assessment: AssessmentState }) {
  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.kicker}>Assessment</p>
          <h1>{assessment.engagement.engagementName}</h1>
          <p className={styles.subtle}>
            {assessment.engagement.companyName} · starter requirement mapping from onboarding data
          </p>
        </div>
        <Link className={styles.secondaryButton} href={`/engagements/${assessment.engagement.id}`}>
          Back to onboarding
        </Link>
      </section>

      <section className={styles.summaryGrid}>
        <SummaryCard label="Supported" value={assessment.counts.supported} tone="supported" />
        <SummaryCard label="Partial" value={assessment.counts.partial} tone="partial" />
        <SummaryCard label="Not started" value={assessment.counts.notStarted} tone="idle" />
      </section>

      <section className={styles.requirementList}>
        {assessment.requirements.map((requirement) => (
          <article className={styles.requirementCard} key={requirement.id}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.meta}>
                  {requirement.framework} · {requirement.family}
                </p>
                <h2>
                  {requirement.controlId} · {requirement.title}
                </h2>
              </div>
              <span className={statusClassName(requirement.status, styles)}>
                {requirement.status.replace("-", " ")}
              </span>
            </div>
            <p className={styles.description}>{requirement.description}</p>
            <p className={styles.rationale}>{requirement.rationale}</p>
            <div className={styles.grid}>
              <div>
                <h3>Mapped prompts</h3>
                <ul>
                  {requirement.mappedQuestionIds.map((questionId) => (
                    <li key={questionId}>{questionId}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Answered prompts</h3>
                <ul>
                  {requirement.answeredQuestionIds.length > 0 ? (
                    requirement.answeredQuestionIds.map((questionId) => <li key={questionId}>{questionId}</li>)
                  ) : (
                    <li>No mapped prompts answered yet.</li>
                  )}
                </ul>
              </div>
              <div>
                <h3>Missing prompts</h3>
                <ul>
                  {requirement.missingQuestionIds.length > 0 ? (
                    requirement.missingQuestionIds.map((questionId) => <li key={questionId}>{questionId}</li>)
                  ) : (
                    <li>No missing prompts in this starter mapping.</li>
                  )}
                </ul>
              </div>
              <div>
                <h3>Evidence references</h3>
                <p>{requirement.evidenceCount} linked references</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "supported" | "partial" | "idle";
}) {
  return (
    <div className={tone === "supported" ? styles.supportedCard : tone === "partial" ? styles.partialCard : styles.idleCard}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function statusClassName(status: string, stylesMap: Record<string, string>) {
  if (status === "supported") {
    return stylesMap.statusSupported;
  }

  if (status === "partial") {
    return stylesMap.statusPartial;
  }

  return stylesMap.statusIdle;
}
