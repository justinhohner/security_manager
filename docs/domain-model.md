# Domain Model

## Purpose

This document defines the core objects that should anchor both the backend design and the frontend interaction model.

The intent is to keep a single canonical assessment model so future onboarding modes, scans, findings, and exports can reuse the same structures.

## Model Principles

1. The system should be evidence-centered, not questionnaire-centered.
2. Questions and answers are inputs into the model, not the model itself.
3. Findings should always trace back to requirements, evidence, and reasoning.
4. Frontend forms should map cleanly onto stable domain objects.

## Core Objects

### Company

Represents the organization being assessed.

Key fields:

- company_id
- legal_name
- preferred_name
- industry
- employee_count_range
- primary_contacts
- locations
- business_units
- service_providers

### Engagement

Represents a specific consulting or assessment effort.

Key fields:

- engagement_id
- company_id
- engagement_name
- target_frameworks
- target_cmmc_level
- start_date
- end_date
- lead_assessor
- status

### Assessment Boundary

Represents the in-scope environment and its assumptions.

Key fields:

- boundary_id
- engagement_id
- boundary_name
- boundary_description
- includes_cui
- includes_fci
- assumptions
- exclusions
- confidence
- status

### System

Represents a technical or business system relevant to scope or control operation.

Key fields:

- system_id
- boundary_id
- name
- system_type
- owner
- hosting_model
- stores_cui
- processes_cui
- transmits_cui
- protects_cui_assets
- criticality

### Asset

Represents a concrete asset or asset grouping associated with a system.

Key fields:

- asset_id
- system_id
- asset_type
- name
- owner
- environment
- inventory_reference

### Requirement

Represents a framework requirement.

Key fields:

- requirement_id
- framework
- family
- control_id
- title
- description

### Assessment Objective

Represents a testable objective associated with a requirement.

Key fields:

- objective_id
- requirement_id
- objective_code
- method
- description

### Question

Represents a prompted data collection item.

Key fields:

- question_id
- section
- prompt
- response_type
- scale_definition
- applies_to
- requirement_links
- follow_up_rules

### Answer

Represents a consultant-supplied response to a question.

Key fields:

- answer_id
- question_id
- engagement_id
- related_object_type
- related_object_id
- score
- value
- rationale
- answered_by
- answered_at

### Evidence

Represents supporting material for a claim, answer, or finding.

Key fields:

- evidence_id
- engagement_id
- evidence_type
- title
- source
- collected_at
- freshness
- linked_object_type
- linked_object_id

### Scan

Represents a technical validation input.

Key fields:

- scan_id
- engagement_id
- scan_type
- target
- executed_at
- summary
- linked_systems

### Finding

Represents an assessment conclusion that requires review, prioritization, or remediation.

Key fields:

- finding_id
- engagement_id
- requirement_id
- title
- statement
- observed_condition
- evidence_used
- evidence_missing
- confidence
- impact
- priority_rationale
- recommended_remediation
- status

### Remediation Item

Represents a tracked action to address a finding.

Key fields:

- remediation_item_id
- finding_id
- owner
- action_summary
- cost_estimate
- effort_estimate
- target_date
- validation_plan
- status

### Decision

Represents a recorded judgment or assumption that affects scope or assessment interpretation.

Key fields:

- decision_id
- engagement_id
- title
- context
- decision
- rationale
- decided_by
- decided_at

## Core Relationships

- one company has many engagements
- one engagement has one or more boundaries
- one boundary has many systems
- one system has many assets
- requirements have many assessment objectives
- questions can link to requirements and objectives
- answers can link to companies, boundaries, systems, or requirements
- evidence can support answers, systems, requirements, and findings
- findings link requirements, evidence, and assessment context
- remediation items link to findings

## Frontend and Backend Contract Guidance

The frontend should not invent alternative object shapes for convenience.

The backend should expose resources that map directly to the domain model, with workflow-specific endpoints layered on top when needed.

Recommended split:

- canonical resource objects for storage and reference
- workflow endpoints for onboarding progress, follow-up generation, and findings review

Examples:

- `GET /engagements/:id/onboarding`
- `PATCH /engagements/:id/onboarding/sections/:section_id`
- `POST /engagements/:id/follow-up-questions`
- `GET /engagements/:id/findings`

## Questions Still Open

- should system records exist during onboarding before the boundary is fully accepted
- how should evidence freshness be represented for later reassessment
- should findings reference one requirement only or allow many-to-many mappings
- what parts of prioritization belong on the finding versus the remediation item
