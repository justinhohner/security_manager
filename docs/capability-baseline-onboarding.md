# Capability Baseline Onboarding

## Purpose

This document defines the program-first onboarding flow for v1.

The goal is to leave onboarding with a usable security program baseline, not only a boundary summary or a control assessment starter set.

## Onboarding Goal

By the end of onboarding, a consultant should have:

- company and engagement context
- important business and technical dependencies
- a first-pass security program profile
- capability-by-capability maturity signals
- evidence confidence signals
- a short list of immediate improvement priorities

## Interaction Model

The onboarding experience remains:

- section-based
- primarily structured
- augmented with guided inline follow-up questions
- supported by minimal freeform notes

This still fits experienced consultants well. The main change is what the sections are trying to produce.

## Onboarding Sections

### 1. Engagement Context

Capture:

- company name
- engagement name
- lead consultant
- primary client contacts
- engagement goals
- known deadlines or contractual drivers

This section is administrative and should not require evidence by default.

### 2. Business Context

Capture:

- industry and customer profile
- revenue and delivery model
- critical business services
- key availability or trust concerns
- regulatory, contractual, or insurance obligations

This section explains why security priorities matter to the client.

### 3. Operating Model

Capture:

- employee scale
- internal IT and security staffing
- outsourced providers
- major business units
- primary locations
- remote or distributed work patterns

This section helps determine what is realistic for the client's program.

### 4. Technology and Dependency Profile

Capture:

- identity provider
- endpoint and infrastructure footprint
- cloud providers
- core business systems
- network and connectivity patterns
- critical external dependencies
- backup and recovery dependencies

This section gives the consultant a technical operating picture without collapsing into control-level review too early.

### 5. Security Capability Baseline

Capture maturity and confidence across the core capabilities:

- governance and policy
- asset and configuration management
- identity and access management
- endpoint and infrastructure protection
- vulnerability management
- logging and monitoring
- incident response
- backup and recovery
- awareness and training
- vendor and third-party oversight

Each capability should record:

- maturity score
- confidence score
- short operating summary
- key weakness or blocker

### 6. Evidence and Validation Readiness

Capture:

- available policies and procedures
- inventories and diagrams
- scan outputs
- ticketing or operational records
- prior assessments, audits, or customer questionnaires
- known evidence gaps

The purpose is to understand how much of the current program view is evidence-backed versus interview-backed.

### 7. Framework and Obligation Overlay

Capture:

- CMMC relevance
- NIST SP 800-171 relevance
- other frameworks or customer demands
- data handling expectations
- high-consequence obligations

This section informs the overlay layer without turning the onboarding flow into a control checklist.

### 8. Initial Program Review

The system should summarize:

- strongest capabilities
- weakest capabilities
- low-confidence areas
- important dependencies
- likely short-term priorities
- recommended next initiatives

## Question Design

Questions should use the simplest shape that matches the information needed.

Recommended patterns:

- factual fields for names, providers, systems, and owners
- 1 to 5 maturity scales for capability health
- 1 to 5 confidence scales for trust in the answer
- short fill-ins for why a score was given
- inline follow-up prompts when the score implies risk or uncertainty

## Scale Guidance

### Maturity Scale

- 1: absent or unknown
- 2: ad hoc or very limited
- 3: partially defined or inconsistently operating
- 4: largely operating and supportable
- 5: well established, repeatable, and evidenced

### Confidence Scale

- 1: guesswork only
- 2: limited support
- 3: some supporting evidence or direct observation
- 4: strong supporting evidence
- 5: directly validated and current

## Inline Follow-Up Rules

Follow-up questions should appear immediately below the triggering answer.

Good triggers for v1:

- a high maturity score with low confidence
- a capability scored weak in a high-impact area
- backups are present but restore validation is unclear
- incident response exists but exercises have not occurred
- logging is present but alert ownership is unclear
- outsourced support exists but responsibility boundaries are vague

## Outputs

Onboarding should produce:

- company and engagement profile
- program baseline summary
- capability review set
- evidence readiness summary
- major dependency summary
- first-pass priority list
- recommended roadmap candidates

## What Onboarding Should Not Do

It should not try to:

- complete a full framework assessment
- generate a full POA&M
- force requirement-by-requirement review
- over-collect detailed evidence before baseline understanding exists

Those can happen later as part of deeper validation and framework-specific review.
