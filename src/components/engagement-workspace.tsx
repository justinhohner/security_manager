// ABOUTME: Renders the section-based onboarding workflow and boundary summary.
// ABOUTME: Coordinates the first end-to-end consultant interaction loop.
"use client";

import Link from "next/link";
import { useState } from "react";
import { usesExplicitSave } from "@/lib/question-behavior";
import type { Answer, OnboardingState, Question, SectionId } from "@/lib/types";
import styles from "./engagement-workspace.module.css";

type SaveAnswerResponse = {
  state: OnboardingState;
};

export function EngagementWorkspace({ initialState }: { initialState: OnboardingState }) {
  const [state, setState] = useState(initialState);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isBoundaryEditing, setIsBoundaryEditing] = useState(false);
  const [evidenceDrafts, setEvidenceDrafts] = useState<Record<string, { title: string; source: string; note: string }>>(
    {},
  );
  const [boundaryDraft, setBoundaryDraft] = useState({
    summary: initialState.boundaryPreview.summary,
    assumptions: initialState.boundaryPreview.assumptions.join("\n"),
    exclusions: initialState.boundaryPreview.exclusions.join("\n"),
    inScopeSystems: initialState.boundaryPreview.inScopeSystems.join("\n"),
    protectedSystems: initialState.boundaryPreview.protectedSystems.join("\n"),
    confidence: String(initialState.boundaryPreview.confidence),
  });

  const currentQuestions = state.questions.filter((question) => question.sectionId === state.currentSectionId);
  const activeSection = state.sections.find((section) => section.id === state.currentSectionId);

  async function handleSectionChange(sectionId: SectionId) {
    const response = await fetch(`/api/engagements/${state.engagement.id}/onboarding/sections/${sectionId}`, {
      method: "PATCH",
    });
    const data = (await response.json()) as SaveAnswerResponse;
    setState(data.state);
  }

  async function handleAnswerSave(question: Question, answer: Partial<Answer>) {
    setIsSaving(question.id);

    const response = await fetch(`/api/engagements/${state.engagement.id}/onboarding/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: question.id,
        value: answer.value,
        score: answer.score,
        rationale: answer.rationale,
      }),
    });

    const data = (await response.json()) as SaveAnswerResponse;
    setState(data.state);
    syncBoundaryDraft(data.state);
    setIsSaving(null);
  }

  async function handleBoundarySave() {
    setIsSaving("boundary");

    const response = await fetch(`/api/engagements/${state.engagement.id}/boundary`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: boundaryDraft.summary,
        assumptions: splitLines(boundaryDraft.assumptions),
        exclusions: splitLines(boundaryDraft.exclusions),
        inScopeSystems: splitLines(boundaryDraft.inScopeSystems),
        protectedSystems: splitLines(boundaryDraft.protectedSystems),
        confidence: Number(boundaryDraft.confidence),
      }),
    });

    const data = (await response.json()) as SaveAnswerResponse;
    setState(data.state);
    syncBoundaryDraft(data.state);
    setIsBoundaryEditing(false);
    setIsSaving(null);
  }

  async function handleEvidenceSave(questionId: string) {
    const draft = evidenceDrafts[questionId];

    if (!draft?.title.trim() || !draft.source.trim()) {
      return;
    }

    setIsSaving(`evidence-${questionId}`);

    const response = await fetch(`/api/engagements/${state.engagement.id}/evidence-references`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId,
        title: draft.title,
        source: draft.source,
        note: draft.note,
      }),
    });

    const data = (await response.json()) as SaveAnswerResponse;
    setState(data.state);
    setEvidenceDrafts((current) => ({
      ...current,
      [questionId]: { title: "", source: "", note: "" },
    }));
    syncBoundaryDraft(data.state);
    setIsSaving(null);
  }

  function syncBoundaryDraft(nextState: OnboardingState) {
    setBoundaryDraft({
      summary: nextState.boundaryPreview.summary,
      assumptions: nextState.boundaryPreview.assumptions.join("\n"),
      exclusions: nextState.boundaryPreview.exclusions.join("\n"),
      inScopeSystems: nextState.boundaryPreview.inScopeSystems.join("\n"),
      protectedSystems: nextState.boundaryPreview.protectedSystems.join("\n"),
      confidence: String(nextState.boundaryPreview.confidence),
    });
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.kicker}>Engagement</p>
          <h1>{state.engagement.engagementName}</h1>
          <p className={styles.subtle}>
            {state.engagement.companyName} · {state.engagement.targetFrameworks.join(" / ")}
          </p>
        </div>
        <div className={styles.boundaryBadge}>
          <span>Boundary confidence</span>
          <strong>{state.boundaryPreview.confidence}/5</strong>
          <Link className={styles.assessmentLink} href={`/engagements/${state.engagement.id}/program`}>
            Open program workspace
          </Link>
          <Link className={styles.assessmentLink} href={`/engagements/${state.engagement.id}/assessment`}>
            Open assessment view
          </Link>
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.sectionNav}>
          {state.sections.map((section) => (
            <button
              className={section.id === state.currentSectionId ? styles.sectionButtonActive : styles.sectionButton}
              key={section.id}
              onClick={() => void handleSectionChange(section.id)}
              type="button"
            >
              <span>{section.title}</span>
              <small>
                {section.answeredQuestions}/{section.totalQuestions}
              </small>
            </button>
          ))}
        </aside>

        <div className={styles.formPanel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>Onboarding</p>
              <h2>{activeSection?.title}</h2>
              <p className={styles.subtle}>{activeSection?.description}</p>
            </div>
          </div>

          <div className={styles.questionStack}>
            {currentQuestions.map((question) => (
              <div className={styles.questionCard} key={question.id}>
                <QuestionField
                  answer={state.answers[question.id]}
                  key={`${question.id}:${state.answers[question.id]?.value ?? ""}:${state.answers[question.id]?.score ?? ""}`}
                  evidenceDraft={evidenceDrafts[question.id] ?? { title: "", source: "", note: "" }}
                  evidenceReferences={state.evidenceReferences[question.id] ?? []}
                  isEvidenceSaving={isSaving === `evidence-${question.id}`}
                  onEvidenceDraftChange={(nextDraft) =>
                    setEvidenceDrafts((current) => ({
                      ...current,
                      [question.id]: nextDraft,
                    }))
                  }
                  onEvidenceSave={handleEvidenceSave}
                  isSaving={isSaving === question.id}
                  onSave={handleAnswerSave}
                  question={question}
                />
                {state.followUpQuestions[question.id]?.map((followUp) => (
                  <div className={styles.followUp} key={followUp.id}>
                    <QuestionField
                      answer={state.answers[followUp.id]}
                      key={`${followUp.id}:${state.answers[followUp.id]?.value ?? ""}:${state.answers[followUp.id]?.score ?? ""}`}
                      evidenceDraft={evidenceDrafts[followUp.id] ?? { title: "", source: "", note: "" }}
                      evidenceReferences={state.evidenceReferences[followUp.id] ?? []}
                      isEvidenceSaving={isSaving === `evidence-${followUp.id}`}
                      onEvidenceDraftChange={(nextDraft) =>
                        setEvidenceDrafts((current) => ({
                          ...current,
                          [followUp.id]: nextDraft,
                        }))
                      }
                      onEvidenceSave={handleEvidenceSave}
                      isSaving={isSaving === followUp.id}
                      onSave={handleAnswerSave}
                      question={followUp}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <aside className={styles.summaryPanel}>
          <div className={styles.summaryCard}>
            <p className={styles.kicker}>Boundary preview</p>
            <h3>Current scope signal</h3>
            {isBoundaryEditing ? (
              <textarea
                className={styles.textarea}
                onChange={(event) =>
                  setBoundaryDraft((draft) => ({ ...draft, summary: event.currentTarget.value }))
                }
                rows={4}
                value={boundaryDraft.summary}
              />
            ) : (
              <p className={styles.subtle}>{state.boundaryPreview.summary}</p>
            )}
          </div>

          <div className={styles.summaryCard}>
            <h3>Assumptions</h3>
            {isBoundaryEditing ? (
              <textarea
                className={styles.textarea}
                onChange={(event) =>
                  setBoundaryDraft((draft) => ({ ...draft, assumptions: event.currentTarget.value }))
                }
                rows={4}
                value={boundaryDraft.assumptions}
              />
            ) : (
              <ul>
                {state.boundaryPreview.assumptions.length > 0 ? (
                  state.boundaryPreview.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)
                ) : (
                  <li>No explicit assumptions recorded yet.</li>
                )}
              </ul>
            )}
          </div>

          <div className={styles.summaryCard}>
            <h3>In-scope systems</h3>
            {isBoundaryEditing ? (
              <textarea
                className={styles.textarea}
                onChange={(event) =>
                  setBoundaryDraft((draft) => ({ ...draft, inScopeSystems: event.currentTarget.value }))
                }
                rows={4}
                value={boundaryDraft.inScopeSystems}
              />
            ) : (
              <ul>
                {state.boundaryPreview.inScopeSystems.length > 0 ? (
                  state.boundaryPreview.inScopeSystems.map((system) => <li key={system}>{system}</li>)
                ) : (
                  <li>No systems named yet.</li>
                )}
              </ul>
            )}
          </div>

          <div className={styles.summaryCard}>
            <h3>Protected systems</h3>
            {isBoundaryEditing ? (
              <textarea
                className={styles.textarea}
                onChange={(event) =>
                  setBoundaryDraft((draft) => ({ ...draft, protectedSystems: event.currentTarget.value }))
                }
                rows={3}
                value={boundaryDraft.protectedSystems}
              />
            ) : (
              <ul>
                {state.boundaryPreview.protectedSystems.length > 0 ? (
                  state.boundaryPreview.protectedSystems.map((system) => <li key={system}>{system}</li>)
                ) : (
                  <li>No protected systems identified yet.</li>
                )}
              </ul>
            )}
          </div>

          <div className={styles.summaryCard}>
            <h3>Exclusions and confidence</h3>
            {isBoundaryEditing ? (
              <>
                <textarea
                  className={styles.textarea}
                  onChange={(event) =>
                    setBoundaryDraft((draft) => ({ ...draft, exclusions: event.currentTarget.value }))
                  }
                  rows={3}
                  value={boundaryDraft.exclusions}
                />
                <select
                  className={styles.select}
                  onChange={(event) =>
                    setBoundaryDraft((draft) => ({ ...draft, confidence: event.currentTarget.value }))
                  }
                  value={boundaryDraft.confidence}
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      Confidence {score}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <ul>
                  {state.boundaryPreview.exclusions.length > 0 ? (
                    state.boundaryPreview.exclusions.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>No exclusions recorded yet.</li>
                  )}
                </ul>
                <p className={styles.subtle}>Current confidence: {state.boundaryPreview.confidence}/5</p>
              </>
            )}
          </div>

          <div className={styles.summaryCard}>
            <h3>Unresolved scope gaps</h3>
            <ul>
              {state.boundaryPreview.unresolvedScopeQuestions.length > 0 ? (
                state.boundaryPreview.unresolvedScopeQuestions.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>No unresolved scope gaps detected from current answers.</li>
              )}
            </ul>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.boundaryActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => {
                  syncBoundaryDraft(state);
                  setIsBoundaryEditing((value) => !value);
                }}
                type="button"
              >
                {isBoundaryEditing ? "Cancel boundary edits" : "Edit boundary"}
              </button>
              {isBoundaryEditing ? (
                <button
                  className={styles.primaryButton}
                  onClick={() => void handleBoundarySave()}
                  type="button"
                >
                  {isSaving === "boundary" ? "Saving boundary..." : "Save boundary"}
                </button>
              ) : null}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function QuestionField({
  question,
  answer,
  evidenceReferences,
  evidenceDraft,
  onEvidenceDraftChange,
  onEvidenceSave,
  isEvidenceSaving,
  onSave,
  isSaving,
}: {
  question: Question;
  answer?: Answer;
  evidenceReferences: Array<{
    id: string;
    title: string;
    source: string;
    note?: string;
  }>;
  evidenceDraft: { title: string; source: string; note: string };
  onEvidenceDraftChange: (draft: { title: string; source: string; note: string }) => void;
  onEvidenceSave: (questionId: string) => Promise<void>;
  isEvidenceSaving: boolean;
  onSave: (question: Question, answer: Partial<Answer>) => Promise<void>;
  isSaving: boolean;
}) {
  const requiresEvidence = question.evidencePolicy !== "none";
  const hasSavedAnswer = Boolean(answer?.value?.trim()) || typeof answer?.score === "number";
  const [draftValue, setDraftValue] = useState(answer?.value ?? "");
  const showExplicitSave = usesExplicitSave(question);

  return (
    <div>
      <label className={styles.fieldLabel}>
        <span>{question.prompt}</span>
        {question.helperText ? <small>{question.helperText}</small> : null}
      </label>
      {question.responseType === "text" ? (
        <input
          className={styles.input}
          onBlur={(event) => {
            if (!showExplicitSave) {
              void onSave(question, { value: event.currentTarget.value });
            }
          }}
          onChange={(event) => setDraftValue(event.currentTarget.value)}
          placeholder="Enter response"
          value={draftValue}
        />
      ) : null}
      {question.responseType === "textarea" ? (
        <textarea
          className={styles.textarea}
          onBlur={(event) => {
            if (!showExplicitSave) {
              void onSave(question, { value: event.currentTarget.value });
            }
          }}
          onChange={(event) => setDraftValue(event.currentTarget.value)}
          placeholder="Enter response"
          rows={4}
          value={draftValue}
        />
      ) : null}
      {question.responseType === "boolean" ? (
        <select
          className={styles.select}
          defaultValue={answer?.value ?? ""}
          onChange={(event) => void onSave(question, { value: event.currentTarget.value })}
        >
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      ) : null}
      {question.responseType === "select" ? (
        <select
          className={styles.select}
          defaultValue={answer?.value ?? ""}
          onChange={(event) => void onSave(question, { value: event.currentTarget.value })}
        >
          <option value="">Select</option>
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
      {question.responseType === "scale" ? (
        <div className={styles.scaleRow}>
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              className={answer?.score === score ? styles.scaleButtonActive : styles.scaleButton}
              key={score}
              onClick={() => void onSave(question, { score })}
              type="button"
            >
              {score}
            </button>
          ))}
        </div>
      ) : null}
      <p className={styles.saveState}>
        {isSaving
          ? "Saving..."
          : hasSavedAnswer
            ? "Response saved."
            : showExplicitSave
              ? "Response saves when you click Save response."
              : "Response saves when you answer the field."}
      </p>

      {showExplicitSave ? (
        <button
          className={styles.secondaryButton}
          onClick={() => void onSave(question, { value: draftValue })}
          type="button"
        >
          Save response
        </button>
      ) : null}

      {requiresEvidence ? (
        <div className={styles.evidencePanel}>
          <p className={styles.evidenceHeading}>
            {question.evidencePolicy === "expected" ? "Evidence references expected" : "Evidence references optional"}
          </p>
          {evidenceReferences.length > 0 ? (
            <ul className={styles.evidenceList}>
              {evidenceReferences.map((reference) => (
                <li key={reference.id}>
                  <strong>{reference.title}</strong>
                  <span>{reference.source}</span>
                  {reference.note ? <small>{reference.note}</small> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.saveState}>No evidence references linked yet.</p>
          )}

          <div className={styles.evidenceDraft}>
            <input
              className={styles.input}
              onChange={(event) =>
                onEvidenceDraftChange({ ...evidenceDraft, title: event.currentTarget.value })
              }
              placeholder="Evidence title"
              value={evidenceDraft.title}
            />
            <input
              className={styles.input}
              onChange={(event) =>
                onEvidenceDraftChange({ ...evidenceDraft, source: event.currentTarget.value })
              }
              placeholder="Source or location"
              value={evidenceDraft.source}
            />
            <textarea
              className={styles.textarea}
              onChange={(event) =>
                onEvidenceDraftChange({ ...evidenceDraft, note: event.currentTarget.value })
              }
              placeholder="Short note"
              rows={2}
              value={evidenceDraft.note}
            />
            <button
              className={styles.secondaryButton}
              onClick={() => void onEvidenceSave(question.id)}
              type="button"
            >
              {isEvidenceSaving ? "Saving evidence..." : "Add evidence reference"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
