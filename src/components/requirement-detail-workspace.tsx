// ABOUTME: Displays one starter requirement in detail for assessor review.
// ABOUTME: Bridges onboarding-derived support into future findings work.
"use client";

import Link from "next/link";
import { useState } from "react";
import type { RequirementDetailState } from "@/lib/types";
import styles from "./requirement-detail-workspace.module.css";

export function RequirementDetailWorkspace({ detail }: { detail: RequirementDetailState }) {
  const [state, setState] = useState(detail);
  const [isSavingFinding, setIsSavingFinding] = useState(false);

  async function handleFindingSave() {
    setIsSavingFinding(true);

    const response = await fetch(
      `/api/engagements/${state.engagement.id}/assessment/${state.requirement.id}/findings`,
      {
        method: "POST",
      },
    );
    const data = (await response.json()) as { detail: RequirementDetailState };

    setState(data.detail);
    setIsSavingFinding(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.kicker}>Requirement detail</p>
          <h1>
            {state.requirement.controlId} · {state.requirement.title}
          </h1>
          <p className={styles.subtle}>
            {state.engagement.companyName} · {state.requirement.framework} · {state.requirement.family}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href={`/engagements/${state.engagement.id}/assessment`}>
            Back to assessment
          </Link>
          <Link className={styles.secondaryButton} href={`/engagements/${state.engagement.id}`}>
            Back to onboarding
          </Link>
        </div>
      </section>

      <section className={styles.summaryCard}>
        <span className={statusClassName(state.requirement.status, styles)}>
          {state.requirement.status.replace("-", " ")}
        </span>
        <p className={styles.description}>{state.requirement.description}</p>
        <p className={styles.rationale}>{state.requirement.rationale}</p>
        <p className={styles.nextAction}>
          <strong>Next action:</strong> {state.requirement.nextAction}
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Mapped prompts</h2>
          <div className={styles.questionStack}>
            {state.requirement.questionDetails.map((question) => (
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
            <h3>{state.requirement.findingCandidate.title}</h3>
            <p>{state.requirement.findingCandidate.statement}</p>
            <p className={styles.impact}>
              <strong>Impact:</strong> {state.requirement.findingCandidate.impact}
            </p>
            <button
              className={styles.primaryButton}
              disabled={isSavingFinding}
              onClick={() => void handleFindingSave()}
              type="button"
            >
              {isSavingFinding ? "Saving..." : "Save finding candidate"}
            </button>
          </div>

          <div className={styles.savedFindingsCard}>
            <h3>Saved findings</h3>
            {state.requirement.findings.length > 0 ? (
              <ul className={styles.savedFindingsList}>
                {state.requirement.findings.map((finding) => (
                  <li key={finding.id}>
                    <strong>{finding.title}</strong>
                    <span>{finding.statement}</span>
                    <span>
                      <strong>Confidence:</strong> {finding.confidence}
                    </span>
                    <span>
                      <strong>Priority rationale:</strong> {finding.priorityRationale}
                    </span>
                    <span>
                      <strong>Evidence used:</strong>{" "}
                      {finding.evidenceUsed.length > 0 ? finding.evidenceUsed.join(", ") : "No saved evidence support."}
                    </span>
                    <span>
                      <strong>Missing support:</strong>{" "}
                      {finding.missingSupport.length > 0 ? finding.missingSupport.join(", ") : "No missing support recorded."}
                    </span>
                    <small>
                      {finding.status} · {formatCreatedAt(finding.createdAt)}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.mutedText}>No saved findings yet for this requirement.</p>
            )}
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

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
