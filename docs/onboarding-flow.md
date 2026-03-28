# Onboarding Flow

## Purpose

This document defines the v1 onboarding workflow for experienced consultants and assessors.

The goal of onboarding is to build a reliable company profile and boundary baseline that can support assessment, evidence collection, findings, and remediation planning.

## Interaction Model

The onboarding workflow is:

- section-based
- primarily structured
- augmented with guided inline follow-up questions
- supported by minimal freeform notes

The workflow is not chat-first. It should behave like a guided consulting workbook with adaptive follow-up.

## Flow Stages

### 1. Engagement Setup

Capture the operating context for the assessment:

- company name
- engagement name
- target frameworks
- assessment date range
- lead consultant or assessor
- client points of contact

### 2. Business and Contract Context

Establish why the organization is being assessed:

- defense or regulated customer relationships
- expected CMMC target level
- presence of FCI
- presence of CUI
- contractual assessment drivers
- business units involved

### 3. Organization Profile

Capture the shape of the company:

- legal entities
- locations and sites
- workforce size
- internal IT versus outsourced IT
- managed service providers and security providers

### 4. Environment Overview

Build the first technical picture:

- identity provider
- endpoint fleet
- cloud providers
- on-premises footprint
- network structure
- email platform
- line-of-business systems

### 5. Boundary Baseline

Build the first-pass assessment boundary:

- systems that store, process, or transmit CUI
- systems that protect those systems
- enclaves, segments, and trust zones
- external dependencies
- known out-of-scope assumptions

### 6. Security Program Baseline

Capture early maturity signals across policy, operations, and resilience:

- policy coverage
- access control practices
- asset management
- vulnerability management
- logging and monitoring
- incident response
- backup and recovery
- training and awareness

### 7. Evidence Readiness

Capture whether the organization can support assessment claims:

- available policies and procedures
- system inventories
- diagrams
- scan outputs
- prior SSP, POA&M, or related documents

### 8. Initial Review

The system should summarize:

- completed sections
- unanswered critical questions
- boundary assumptions
- high-risk uncertainty areas
- recommended next follow-up items

## Question Pattern

Questions should generally use a 1 to 5 scale when the goal is to assess confidence, maturity, completeness, or readiness.

Suggested interpretation:

- 1: absent or unknown
- 2: ad hoc or very limited
- 3: partially defined or inconsistently implemented
- 4: largely implemented and supportable
- 5: well established and evidenced

Fill-in fields should appear when:

- the score needs a short explanation
- the answer implies a boundary decision
- a named system, provider, owner, or artifact is required
- the answer creates a likely follow-up question

Not every field should use a 1 to 5 scale. Pure factual capture should use structured fields instead.

## Inline Follow-Up Rules

Follow-up questions should appear immediately below the triggering answer.

Typical triggers:

- CUI is present but the storage location is unclear
- a high maturity score is given without named evidence
- outsourced IT is used but responsibilities are undefined
- incident response is rated as present but exercises have not occurred
- backups exist but restore validation is missing

The purpose of inline follow-up is to resolve ambiguity early rather than defer it to a separate queue.

## Consultant Experience Requirements

The onboarding screen should let the consultant:

- move section by section
- see completion status
- understand which answers triggered more questions
- capture minimal notes where needed
- attach supporting artifacts as evidence references

## Outputs

Onboarding should produce a structured baseline that includes:

- company profile
- engagement profile
- initial assessment boundary
- system inventory starter set
- evidence readiness summary
- flagged gaps and unknowns
- recommended next assessment steps

## Design Constraints

- avoid forcing consultants through unnecessary prose entry
- keep the workflow auditable and exportable
- preserve traceability from answers to later findings
- make follow-up generation visible rather than opaque
