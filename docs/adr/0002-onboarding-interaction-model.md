# ADR 0002: Use a structured questionnaire with guided inline follow-up for v1 onboarding

## Status

Accepted

## Context

The product needs an onboarding workflow that works for experienced consultants and assessors while keeping the resulting data consistent enough to drive assessment, findings, prioritization, and exports.

Several onboarding models were considered:

- dedicated live interview mode
- structured questionnaire
- non-linear case file workspace
- import-first workflow

The product also needs to preserve the ability to add other interaction models later without rebuilding the core assessment model.

## Decision

Use a hybrid onboarding model in v1 that combines:

- section-based structured questionnaires
- guided inline follow-up questions
- 1 to 5 scale responses with fill-in fields where needed
- minimal freeform note-taking

The product will ship as a single application with role-based views. Client-facing access will be handled through exports rather than an interactive client session in v1.

## Consequences

Positive:

- produces more consistent data for downstream analysis
- fits consultant and assessor workflows better than a chat-first approach
- supports adaptive questioning without losing structure
- keeps the domain model reusable for future onboarding modes

Negative:

- less flexible than a non-linear case file approach
- some consulting nuance will need to wait for future interaction models
- import-heavy workflows will require later work
