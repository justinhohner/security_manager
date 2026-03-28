# API Contract Draft

## Purpose

This document defines a first-pass API shape for the program-first version of the v1 application.

It is intended to keep the frontend and backend aligned around stable program resources and workflow endpoints.

## API Principles

1. Resource shapes should follow the program-first domain model.
2. Workflow endpoints are allowed when they simplify frontend development.
3. The frontend should not need to infer important workflow state from scattered resources.
4. Framework mapping should remain an overlay on top of the program model.

## Resource Families

The first API surface should cover:

- companies
- engagements
- security-programs
- capability-reviews
- system-profiles
- questions
- answers
- evidence
- initiative-candidates
- initiatives
- maintenance-tasks
- framework-overlays
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

### Program Baseline Workflow

- `GET /engagements/:engagement_id/program-baseline`
- `GET /engagements/:engagement_id/program-baseline/sections`
- `PATCH /engagements/:engagement_id/program-baseline/sections/:section_id`
- `POST /engagements/:engagement_id/program-baseline/answers`
- `PATCH /engagements/:engagement_id/program-baseline/answers/:answer_id`
- `GET /engagements/:engagement_id/program-baseline/follow-ups`

### Capability Review Workflow

- `GET /engagements/:engagement_id/capabilities`
- `GET /engagements/:engagement_id/capabilities/:capability_review_id`
- `PATCH /engagements/:engagement_id/capabilities/:capability_review_id`
- `POST /engagements/:engagement_id/evidence`
- `PATCH /engagements/:engagement_id/evidence/:evidence_id`

### Roadmap Workflow

- `GET /engagements/:engagement_id/roadmap-preview`
- `GET /engagements/:engagement_id/initiatives`
- `POST /engagements/:engagement_id/initiatives`
- `PATCH /engagements/:engagement_id/initiatives/:initiative_id`

### Maintenance Workflow

- `GET /engagements/:engagement_id/maintenance-tasks`
- `POST /engagements/:engagement_id/maintenance-tasks`
- `PATCH /engagements/:engagement_id/maintenance-tasks/:maintenance_task_id`

### Framework Overlay Workflow

- `GET /engagements/:engagement_id/framework-overlays`
- `GET /engagements/:engagement_id/framework-overlays/:framework_overlay_id`
- `POST /engagements/:engagement_id/framework-overlays`

### Exports

- `POST /engagements/:engagement_id/exports`
- `GET /engagements/:engagement_id/exports`
- `GET /engagements/:engagement_id/exports/:export_id`

## Workflow Response Shapes

The workflow endpoints should return frontend-ready summaries instead of forcing many round trips.

### Example: Get Program Baseline Workspace

`GET /engagements/:engagement_id/program-baseline`

Response shape:

- engagement summary
- program summary
- section list with status
- current section
- baseline questions
- inline follow-up questions
- answer state
- completion summary
- low-confidence areas

### Example: Get Capability Workspace

`GET /engagements/:engagement_id/capabilities`

Response shape:

- capability list
- counts by maturity band
- counts by confidence band
- weakest capabilities
- strongest capabilities
- evidence readiness summary

### Example: Get Roadmap Workspace

`GET /engagements/:engagement_id/roadmap-preview`

Response shape:

- initiative candidate list
- counts by priority horizon
- immediate next actions
- confidence caveats
- rationale summary

## Object Expectations

### Capability Review Object

Should support both evaluative scoring and practical operating notes:

- capability_review_id
- capability_id
- maturity_score
- confidence_score
- operating_summary
- strengths
- weaknesses
- evidence_readiness
- resilience_impact
- status

### Initiative Object

Must expose the rationale for why the work matters:

- initiative_id
- title
- summary
- target_capabilities
- related_risks
- expected_outcomes
- suggested_first_steps
- evidence_expectations
- effort_estimate
- cost_estimate
- resilience_value
- priority
- priority_rationale
- status

### Maintenance Task Object

Should preserve recurring validation context:

- maintenance_task_id
- title
- linked_capability
- cadence
- trigger_condition
- owner
- evidence_expectation
- status

### Framework Overlay Object

Should keep framework views secondary to the program model:

- framework_overlay_id
- framework_name
- framework_version
- scope_notes
- mapped_capabilities
- supported_requirement_areas
- unsupported_requirement_areas
- export_readiness

## Contract Decisions Still Open

- whether capability reviews should be generated dynamically or persisted immediately in v1
- whether initiative generation is fully automatic, fully manual, or hybrid in v1
- how evidence file storage should be represented in the API
- how maintenance task cadence and triggers should be stored
- how much framework overlay detail belongs in the initial API

## Recommended Implementation Strategy

Build the API in thin vertical slices that match the main program screens:

1. engagement list and overview
2. program baseline workspace
3. capability workspace
4. roadmap preview and initiative workspace
5. maintenance workspace

This reduces the chance that the backend drifts away from the UI or that framework overlays take over the core design too early.
