# Project Architecture

## Product Goal

Build an agentic AI security manager that helps companies design, assess, improve, and maintain security programs with an emphasis on both compliance and resilience.

The system should not treat "secure" as a fixed end state. It should support a continuous cycle of:

- understanding the environment
- evaluating controls and evidence
- identifying gaps and weaknesses
- prioritizing remediation
- validating improvement
- sustaining readiness over time

## Design Principles

1. Compliance supports resilience, but does not replace it.
2. Assessment quality depends on correct boundary definition.
3. Findings should be evidence-backed and explain confidence.
4. Prioritization should balance risk, cost, contractual urgency, and operational impact.
5. Human reviewers stay in the loop for major scoping, interpretation, and remediation decisions.

## Primary Agent Roles

### Company Onboarding Agent

Builds the initial organization profile:

- legal entity and business context
- contracts and customer obligations
- handling of FCI and CUI
- locations, subsidiaries, and managed service dependencies
- identity, endpoint, cloud, and network landscape

### Scoping Agent

Defines the assessment boundary by identifying:

- systems that store, process, or transmit sensitive data
- systems that protect those systems
- third-party dependencies
- organizational ownership and boundary assumptions

### Assessment Agent

Coordinates structured questions and follow-up prompts mapped to framework requirements and assessment objectives.

### Evidence Agent

Collects, normalizes, and maps evidence to requirements. Evidence may include:

- written policies and procedures
- screenshots and exports
- system configurations
- interview responses
- scan results
- historical incident and change records

### Gap Analysis Agent

Evaluates evidence and responses to produce requirement-level findings with:

- finding statement
- impacted requirement
- evidence references
- confidence score
- rationale and missing information

### Prioritization Agent

Ranks findings and remediation work using:

- compliance criticality
- security risk
- resilience impact
- remediation effort and cost
- business disruption and dependency depth

### Remediation Planning Agent

Transforms findings into executable work:

- remediation options
- recommended path
- owner
- target date
- validation criteria
- reassessment trigger

## Core Data Model

The platform should be built around an evidence graph rather than a questionnaire-only model.

Key entities:

- Company
- Engagement
- Assessment Boundary
- System
- Asset
- Requirement
- Assessment Objective
- Question
- Answer
- Evidence
- Scan
- Finding
- Risk
- Remediation Plan
- POA&M Item
- Decision

## Assessment Pipeline

1. Build company profile.
2. Define the boundary.
3. Select applicable frameworks and controls.
4. Generate baseline questionnaires.
5. Ask follow-up questions from missing or conflicting evidence.
6. Run targeted technical scans.
7. Produce findings and confidence ratings.
8. Prioritize remediation.
9. Track remediation and reassess.

## Initial MVP

The first implementation should stay narrow and practical:

1. Company onboarding profile
2. Boundary definition workflow
3. NIST SP 800-171 and 800-171A requirement model
4. Dynamic questionnaire engine
5. Evidence mapping
6. Gap assessment output
7. Remediation prioritization
8. Basic POA&M generation

## Open Questions

- How opinionated should the system be about assessment boundary proposals?
- What evidence types should be mandatory before a finding is considered high confidence?
- Which technical scans belong in the MVP versus a later phase?
- How should resilience scoring be represented alongside compliance posture?
