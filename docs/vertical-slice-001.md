# Vertical Slice 001

## Purpose

This document defines the first implementation slice for the application.

The slice is intentionally narrow and should prove that the frontend workflow, backend data model, and workflow endpoints can stay aligned.

## Slice Goal

Allow a consultant to:

1. create an engagement
2. complete the first onboarding sections
3. answer inline follow-up questions
4. generate an initial boundary summary

This is the smallest useful flow because it produces a concrete work product instead of a partial form with no downstream value.

## User Outcome

By the end of the slice, the consultant should be able to leave the session with:

- a saved engagement
- a saved onboarding baseline
- visible follow-up logic
- a first-pass boundary summary that can be reviewed and refined later

## Included Screens

### 1. Engagement List

Required capabilities:

- list engagements
- create a new engagement
- open an engagement

### 2. Engagement Overview

Required capabilities:

- show engagement metadata
- show onboarding progress
- link into onboarding
- show boundary summary state

### 3. Onboarding Workspace

Required sections in this slice:

1. engagement setup
2. business and contract context
3. organization profile
4. environment overview
5. boundary baseline

Required capabilities:

- render baseline questions
- save structured answers
- render inline follow-up questions
- save follow-up answers
- show section completion state

### 4. Boundary Summary View

Required capabilities:

- show initial in-scope systems
- show stated CUI and FCI assumptions
- show unresolved scope gaps
- show boundary confidence

This can be a lightweight read-first view in the first slice rather than a full editing workspace.

## Excluded From This Slice

- findings generation
- remediation workflow
- evidence file upload
- requirement-level assessment views
- exports
- scans

## Required Backend Objects

The slice needs only these persisted objects:

- company
- engagement
- question
- answer
- assessment boundary
- system
- decision

Evidence objects can be stubbed out later. Do not force them into the first slice unless needed for the UI to function.

## Required Endpoint Set

### Engagements

- `POST /engagements`
- `GET /engagements`
- `GET /engagements/:engagement_id`

### Onboarding

- `GET /engagements/:engagement_id/onboarding`
- `PATCH /engagements/:engagement_id/onboarding/sections/:section_id`
- `POST /engagements/:engagement_id/onboarding/answers`
- `PATCH /engagements/:engagement_id/onboarding/answers/:answer_id`

### Boundary

- `GET /engagements/:engagement_id/boundary`

## Suggested Section Payload Shape

`GET /engagements/:engagement_id/onboarding`

Should return:

- engagement summary
- sections
- current section
- baseline questions
- inline follow-up questions grouped by triggering answer
- answer values
- section completion state

## Suggested Answer Payload Shape

`POST /engagements/:engagement_id/onboarding/answers`

Request:

- question_id
- related_object_type
- related_object_id
- score
- value
- rationale

Response:

- saved answer
- triggered follow-up questions
- updated section completion state
- updated boundary summary preview if affected

That last point matters. If the answer changes scope, the frontend should not have to make blind guesses about whether the boundary preview changed.

## Suggested Boundary Payload Shape

`GET /engagements/:engagement_id/boundary`

Should return:

- boundary summary
- in-scope systems
- protected systems
- exclusions
- assumptions
- unresolved scope questions
- confidence

## Follow-Up Logic Expectations

The first slice should prove inline follow-up behavior with a limited rule set.

Good first triggers:

- CUI present without identified storage or processing location
- outsourced IT present without named provider or responsibility detail
- high maturity score without supporting explanation
- stated boundary exclusion without rationale

Do not try to build generalized agentic follow-up logic in the first slice. Use a small deterministic rule set first.

## Frontend Implementation Notes

The frontend should treat onboarding as a workflow screen, not a collection of unrelated forms.

Recommended state needs:

- active engagement
- active section
- question list
- answers by question id
- inline follow-ups by parent answer id
- section completion summary
- boundary preview summary

## Backend Implementation Notes

The backend should favor a small, stable contract over premature generality.

Recommended first behaviors:

- seeded onboarding question set for the included sections
- deterministic follow-up generation rules
- simple boundary summary derivation from onboarding answers
- optimistic updates only where the response payload confirms the new state

## Acceptance Criteria

The slice is complete when:

- a consultant can create an engagement
- the included onboarding sections can be completed and revisited
- inline follow-up questions appear immediately when triggered
- answers persist correctly
- a boundary summary is derived from the saved answers
- the same saved state can be reloaded without loss or frontend-only reconstruction

## Next Slice After This

The next logical slice would add:

- editable boundary workspace
- evidence references
- requirement mapping starter view

That would keep the system moving from onboarding into actual assessment work.
