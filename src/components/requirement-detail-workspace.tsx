// ABOUTME: Displays one starter requirement in detail for assessor review.
// ABOUTME: Bridges onboarding-derived support into future findings work.
import Link from "next/link";
import type { RequirementDetailState } from "@/lib/types";
import styles from "./requirement-detail-workspace.module.css";

export function RequirementDetailWorkspace({ detail }: { detail: RequirementDetailState }) {
  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.kicker}>Requirement detail</p>
          <h1>
            {detail.requirement.controlId} · {detail.requirement.title}
          </h1>
          <p className={styles.subtle}>
            {detail.engagement.companyName} · {detail.requirement.framework} · {detail.requirement.family}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href={`/engagements/${detail.engagement.id}/assessment`}>
            Back to assessment
          </Link>
          <Link className={styles.secondaryButton} href={`/engagements/${detail.engagement.id}`}>
            Back to onboarding
          </Link>
        </div>
      </section>

      <section className={styles.summaryCard}>
        <span className={statusClassName(detail.requirement.status, styles)}>
          {detail.requirement.status.replace("-", " ")}
        </span>
        <p className={styles.description}>{detail.requirement.description}</p>
        <p className={styles.rationale}>{detail.requirement.rationale}</p>
        <p className={styles.nextAction}>
          <strong>Next action:</strong> {detail.requirement.nextAction}
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Mapped prompts</h2>
          <div className={styles.questionStack}>
            {detail.requirement.questionDetails.map((question) => (
              <div className={styles.questionCard} key={question.questionId}>
                <div className={styles.questionHeader}>
                  <h3>{question.prompt}</h3>
                  <span className={question.answered ? styles.answerBadge : styles.missingBadge}>
                    {question.answered ? "answered" : "missing"}
                  </span>
                </div>
                {question.answerValue ? <p className={styles.answerValue}>{question.answerValue}</p> : null}
                {typeof question.answerScore === "number" ? (
                  <p className={styles.answerValue}>Score: {question.answerScore}/5</p>
                ) : null}
                <div>
                  <p className={styles.mutedLabel}>Evidence references</p>
                  {question.evidenceReferences.length > 0 ? (
                    <ul>
                      {question.evidenceReferences.map((reference) => (
                        <li key={reference.id}>
                          <strong>{reference.title}</strong>
                          <span>{reference.source}</span>
                          {reference.note ? <small>{reference.note}</small> : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.mutedText}>No evidence references linked yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <h2>Finding candidate</h2>
          <div className={styles.findingCard}>
            <h3>{detail.requirement.findingCandidate.title}</h3>
            <p>{detail.requirement.findingCandidate.statement}</p>
            <p className={styles.impact}>
              <strong>Impact:</strong> {detail.requirement.findingCandidate.impact}
            </p>
          </div>

          <div className={styles.checklistCard}>
            <h3>Requirement review checklist</h3>
            <ul>
              <li>Confirm the mapped prompts are sufficient for this starter requirement area.</li>
              <li>Decide whether missing prompts need more onboarding follow-up.</li>
              <li>Decide whether current evidence references are strong enough for review.</li>
              <li>Use this detail page as the input surface for future findings generation.</li>
            </ul>
          </div>
        </article>
      </section>
    </main>
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
