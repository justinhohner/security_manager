# Vertical Slice 001

## Purpose

This document defines the first implementation slice for the program-first version of the application.

The slice should prove that onboarding, capability baseline, and roadmap preview can move through one aligned frontend and backend flow.

## Slice Goal

Allow a consultant to:

1. create an engagement
2. complete the first program-baseline onboarding sections
3. answer inline follow-up questions
4. generate an initial capability baseline and roadmap preview

This is the smallest useful flow because it produces a program view and recommended improvement direction rather than only a partial assessment artifact.

## User Outcome

By the end of the slice, the consultant should be able to leave the session with:

- a saved engagement
- a saved company and operating baseline
- visible follow-up logic
- a first-pass capability summary
- a short roadmap preview with recommended next actions

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
- show capability baseline summary
- show roadmap preview summary
- link into the program workspace

### 3. Program Baseline Workspace

Required sections in this slice:

1. engagement context
2. business context
3. operating model
4. technology and dependency profile
5. security capability baseline

Required capabilities:

- render baseline questions
- save structured answers
- render inline follow-up questions
- save follow-up answers
- show section completion state

### 4. Capability Summary View

Required capabilities:

- show capability scores
- show confidence signals
- show weakest and strongest areas
- show low-confidence areas that need more validation

This can be a lightweight read-first panel in the first slice rather than a full detailed workspace.

### 5. Roadmap Preview View

Required capabilities:

- show initial initiative candidates
- show short priority rationale
- show immediate next actions

This can be a lightweight preview rather than a full initiative management workspace.

## Excluded From This Slice

- detailed framework assessment views
- requirement-level findings workflow
- full remediation tracking
- evidence file upload
- exports
- scans
- recurring maintenance scheduling

## Required Backend Objects

The slice needs only these persisted objects:

- company
- engagement
- security program
- question
- answer
- capability review
- initiative candidate
- decision

Evidence objects can remain lightweight references for now. Do not force full evidence management into the first slice.

## Required Endpoint Set

### Engagements

- `POST /engagements`
- `GET /engagements`
- `GET /engagements/:engagement_id`

### Program Baseline

- `GET /engagements/:engagement_id/program-baseline`
- `GET /engagements/:engagement_id/program-baseline/sections`
- `PATCH /engagements/:engagement_id/program-baseline/sections/:section_id`
- `POST /engagements/:engagement_id/program-baseline/answers`

### Capability Review

- `GET /engagements/:engagement_id/capabilities`

### Roadmap Preview

- `GET /engagements/:engagement_id/roadmap-preview`

## Suggested Program Baseline Payload Shape

`GET /engagements/:engagement_id/program-baseline`

Should return:

- engagement summary
- program summary
- sections
- current section
- baseline questions
- inline follow-up questions grouped by triggering answer
- answer values
- completion summary
- low-confidence areas

## Suggested Answer Payload Shape

`POST /engagements/:engagement_id/program-baseline/answers`

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
- updated capability summary preview if affected
- updated roadmap preview if affected

That last point matters. If the answer changes capability posture, the frontend should not guess whether the downstream summaries changed.

## Suggested Capability Summary Payload Shape

`GET /engagements/:engagement_id/capabilities`

Should return:

- capability summary list
- strongest capabilities
- weakest capabilities
- low-confidence capabilities
- evidence readiness summary

## Suggested Roadmap Preview Payload Shape

`GET /engagements/:engagement_id/roadmap-preview`

Should return:

- initiative candidate list
- immediate next actions
- priority rationale summary
- confidence caveats

## Follow-Up Logic Expectations

The first slice should prove inline follow-up behavior with a limited rule set.

Good first triggers:

- a high maturity score with low confidence
- outsourced support is present but ownership is vague
- backups are claimed but restore validation is unclear
- incident response is claimed but exercises are missing
- logging exists but alert ownership is undefined

Do not try to build generalized agentic follow-up logic in the first slice. Use a small deterministic rule set first.

## Frontend Implementation Notes

The frontend should treat onboarding as a program workflow, not as an assessment checklist.

Recommended state needs:

- active engagement
- active section
- question list
- answers by question id
- inline follow-ups by parent answer id
- section completion summary
- capability preview summary
- roadmap preview summary

## Backend Implementation Notes

The backend should favor a small, stable contract over premature generality.

Recommended first behaviors:

- seeded onboarding question set for the included sections
- deterministic follow-up generation rules
- simple capability summary derivation from onboarding answers
- simple initiative candidate generation from weak or low-confidence capability areas
- optimistic updates only where the response payload confirms the new state

## Acceptance Criteria

The slice is complete when:

- a consultant can create an engagement
- the included onboarding sections can be completed and revisited
- inline follow-up questions appear immediately when triggered
- answers persist correctly
- a capability baseline summary is derived from the saved answers
- a roadmap preview is derived from the saved answers
- the same saved state can be reloaded without loss or frontend-only reconstruction

## Next Slice After This

The next logical slice would add:

- capability detail workspace
- initiative detail and prioritization inputs
- evidence references tied to capability reviews

That would keep the system moving from onboarding into practical program planning rather than into assessment-first detail work.
