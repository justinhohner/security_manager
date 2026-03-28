// ABOUTME: Renders the section-based onboarding workflow and boundary summary.
// ABOUTME: Coordinates the first end-to-end consultant interaction loop.
"use client";

import { useState } from "react";
import type { Answer, OnboardingState, Question, SectionId } from "@/lib/types";
import styles from "./engagement-workspace.module.css";

type SaveAnswerResponse = {
  state: OnboardingState;
};

export function EngagementWorkspace({ initialState }: { initialState: OnboardingState }) {
  const [state, setState] = useState(initialState);
  const [isSaving, setIsSaving] = useState<string | null>(null);

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
    setIsSaving(null);
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
                  isSaving={isSaving === question.id}
                  onSave={handleAnswerSave}
                  question={question}
                />
                {state.followUpQuestions[question.id]?.map((followUp) => (
                  <div className={styles.followUp} key={followUp.id}>
                    <QuestionField
                      answer={state.answers[followUp.id]}
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
            <p className={styles.subtle}>{state.boundaryPreview.summary}</p>
          </div>

          <div className={styles.summaryCard}>
            <h3>Assumptions</h3>
            <ul>
              {state.boundaryPreview.assumptions.length > 0 ? (
                state.boundaryPreview.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)
              ) : (
                <li>No explicit assumptions recorded yet.</li>
              )}
            </ul>
          </div>

          <div className={styles.summaryCard}>
            <h3>In-scope systems</h3>
            <ul>
              {state.boundaryPreview.inScopeSystems.length > 0 ? (
                state.boundaryPreview.inScopeSystems.map((system) => <li key={system}>{system}</li>)
              ) : (
                <li>No systems named yet.</li>
              )}
            </ul>
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
        </aside>
      </section>
    </main>
  );
}

function QuestionField({
  question,
  answer,
  onSave,
  isSaving,
}: {
  question: Question;
  answer?: Answer;
  onSave: (question: Question, answer: Partial<Answer>) => Promise<void>;
  isSaving: boolean;
}) {
  return (
    <div>
      <label className={styles.fieldLabel}>
        <span>{question.prompt}</span>
        {question.helperText ? <small>{question.helperText}</small> : null}
      </label>
      {question.responseType === "text" ? (
        <input
          className={styles.input}
          defaultValue={answer?.value ?? ""}
          onBlur={(event) => void onSave(question, { value: event.currentTarget.value })}
          placeholder="Enter response"
        />
      ) : null}
      {question.responseType === "textarea" ? (
        <textarea
          className={styles.textarea}
          defaultValue={answer?.value ?? ""}
          onBlur={(event) => void onSave(question, { value: event.currentTarget.value })}
          placeholder="Enter response"
          rows={4}
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
      <p className={styles.saveState}>{isSaving ? "Saving..." : "Saved through the workflow API."}</p>
    </div>
  );
}
