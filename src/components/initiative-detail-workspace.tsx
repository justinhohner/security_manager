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
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [owner, setOwner] = useState(initialState.initiative.owner ?? "");
  const [targetDate, setTargetDate] = useState(initialState.initiative.targetDate ?? "");
  const [notes, setNotes] = useState(initialState.initiative.notes ?? "");
  const [blockers, setBlockers] = useState(initialState.initiative.blockers ?? "");
  const [outcome, setOutcome] = useState(initialState.initiative.outcome ?? "");

  async function handleStatusChange(status: "planned" | "in-progress" | "completed") {
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

  async function handlePlanSave() {
    setIsSavingPlan(true);

    const response = await fetch(
      `/api/engagements/${state.engagement.id}/initiatives/${state.initiative.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ owner, targetDate, notes, blockers, outcome }),
      },
    );
    const data = (await response.json()) as { state: InitiativeDetailState };

    setState(data.state);
    setOwner(data.state.initiative.owner ?? "");
    setTargetDate(data.state.initiative.targetDate ?? "");
    setNotes(data.state.initiative.notes ?? "");
    setBlockers(data.state.initiative.blockers ?? "");
    setOutcome(data.state.initiative.outcome ?? "");
    setIsSavingPlan(false);
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
          <Link className={styles.secondaryButton} href={`/engagements/${state.engagement.id}/program/roadmap`}>
            Open roadmap workspace
          </Link>
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
          <strong>Last status change:</strong> {formatTimestamp(state.initiative.statusChangedAt)}
        </p>
        <p className={styles.copy}>
          <strong>Owner:</strong> {state.initiative.owner ?? "Not assigned"}
        </p>
        <p className={styles.copy}>
          <strong>Target date:</strong> {state.initiative.targetDate ?? "Not set"}
        </p>
        <p className={styles.copy}>
          <strong>Notes:</strong> {state.initiative.notes ?? "No notes recorded"}
        </p>
        <p className={styles.copy}>
          <strong>Blockers:</strong> {state.initiative.blockers ?? "No blockers recorded"}
        </p>
        {state.initiative.outcome ? (
          <p className={styles.copy}>
            <strong>Outcome:</strong> {state.initiative.outcome}
          </p>
        ) : null}
        <p className={styles.copy}>
          <strong>Why now:</strong> {state.initiative.whyNow}
        </p>
      </section>

      <section className={styles.card}>
        <h2>Planning details</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Owner</span>
            <input
              className={styles.input}
              onChange={(event) => setOwner(event.currentTarget.value)}
              placeholder="Assign owner"
              value={owner}
            />
          </label>
          <label className={styles.field}>
            <span>Target date</span>
            <input
              className={styles.input}
              onChange={(event) => setTargetDate(event.currentTarget.value)}
              type="date"
              value={targetDate}
            />
          </label>
          <label className={styles.field}>
            <span>Notes</span>
            <textarea
              className={styles.textarea}
              onChange={(event) => setNotes(event.currentTarget.value)}
              placeholder="Capture plan notes, assumptions, or follow-up context"
              rows={4}
              value={notes}
            />
          </label>
          <label className={styles.field}>
            <span>Blockers</span>
            <textarea
              className={styles.textarea}
              onChange={(event) => setBlockers(event.currentTarget.value)}
              placeholder="Capture current blockers or dependencies"
              rows={4}
              value={blockers}
            />
          </label>
          <label className={styles.field}>
            <span>Outcome</span>
            <textarea
              className={styles.textarea}
              onChange={(event) => setOutcome(event.currentTarget.value)}
              placeholder="Capture what changed, what was validated, or what was delivered"
              rows={4}
              value={outcome}
            />
          </label>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} disabled={isSavingPlan} onClick={() => void handlePlanSave()} type="button">
            {isSavingPlan ? "Saving..." : "Save planning details"}
          </button>
        </div>
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

function formatTimestamp(value?: string) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
