# API Contract Draft

## Purpose

This document defines a first-pass API shape for the v1 application.

It is intended to keep the frontend and backend aligned around stable domain objects and workflow endpoints.

## API Principles

1. Resource shapes should follow the canonical domain model.
2. Workflow endpoints are allowed when they simplify frontend development.
3. The frontend should not need to infer critical workflow state from scattered resources.
4. Findings and exports should remain traceable to source answers and evidence.

## Resource Families

The first API surface should cover:

- companies
- engagements
- boundaries
- systems
- questions
- answers
- evidence
- findings
- remediation-items
- exports

## Suggested Endpoint Groups

### Companies

- `POST /companies`
- `GET /companies/:company_id`
- `PATCH /companies/:company_id`

### Engagements

- `POST /engagements`
- `GET /engagements`
- `GET /engagements/:engagement_id`
- `PATCH /engagements/:engagement_id`

### Onboarding Workflow

- `GET /engagements/:engagement_id/onboarding`
- `GET /engagements/:engagement_id/onboarding/sections`
- `PATCH /engagements/:engagement_id/onboarding/sections/:section_id`
- `POST /engagements/:engagement_id/onboarding/answers`
- `PATCH /engagements/:engagement_id/onboarding/answers/:answer_id`
- `GET /engagements/:engagement_id/onboarding/follow-ups`

### Boundary Workflow

- `GET /engagements/:engagement_id/boundary`
- `PATCH /engagements/:engagement_id/boundary`
- `POST /engagements/:engagement_id/systems`
- `PATCH /engagements/:engagement_id/systems/:system_id`
- `POST /engagements/:engagement_id/decisions`

### Assessment Workflow

- `GET /engagements/:engagement_id/assessment`
- `GET /engagements/:engagement_id/requirements`
- `GET /engagements/:engagement_id/requirements/:requirement_id`
- `POST /engagements/:engagement_id/evidence`
- `PATCH /engagements/:engagement_id/evidence/:evidence_id`

### Findings Workflow

- `GET /engagements/:engagement_id/findings`
- `POST /engagements/:engagement_id/findings`
- `GET /engagements/:engagement_id/findings/:finding_id`
- `PATCH /engagements/:engagement_id/findings/:finding_id`

### Remediation Workflow

- `GET /engagements/:engagement_id/remediation-items`
- `POST /engagements/:engagement_id/remediation-items`
- `PATCH /engagements/:engagement_id/remediation-items/:remediation_item_id`

### Exports

- `POST /engagements/:engagement_id/exports`
- `GET /engagements/:engagement_id/exports`
- `GET /engagements/:engagement_id/exports/:export_id`

## Workflow Response Shapes

The workflow endpoints should return frontend-ready summaries instead of forcing many round trips.

### Example: Get Onboarding Workspace

`GET /engagements/:engagement_id/onboarding`

Response shape:

- engagement summary
- section list with status
- current section
- baseline questions
- inline follow-up questions
- answer state
- completion summary
- unresolved blockers

### Example: Get Findings Workspace

`GET /engagements/:engagement_id/findings`

Response shape:

- findings list
- counts by status
- counts by priority
- unresolved evidence gaps
- prioritization inputs summary

## Object Expectations

### Answer Object

Should support both structured and evaluative responses:

- answer_id
- question_id
- related_object_type
- related_object_id
- score
- value
- rationale
- created_at
- updated_at

### Finding Object

Must expose the minimum trust schema directly:

- finding_id
- requirement_id
- title
- statement
- observed_condition
- evidence_used
- evidence_missing
- confidence
- impact
- recommended_remediation
- priority_rationale
- status

### Remediation Item Object

Should preserve prioritization and execution context:

- remediation_item_id
- finding_id
- action_summary
- owner
- cost_estimate
- effort_estimate
- target_date
- validation_plan
- status

## Contract Decisions Still Open

- whether workflow endpoints should embed full resource objects or summaries plus references
- whether finding creation is fully manual, fully generated, or hybrid in v1
- how evidence file storage should be represented in the API
- how export generation status should be tracked

## Recommended Implementation Strategy

Build the API in thin vertical slices that match the main screens:

1. engagement list and overview
2. onboarding workspace
3. boundary workspace
4. findings workspace
5. remediation workspace

This reduces the chance that the backend drifts away from the UI or vice versa.
