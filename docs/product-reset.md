# Product Reset

## Why This Reset Exists

The project has drifted toward an assessment workbench for CMMC and NIST SP 800-171.

That is not the intended product.

The intended product is a security program manager that helps a consultant:

- understand a company's current security posture
- build and maintain a practical security program
- prioritize improvement work over time
- use frameworks like CMMC and NIST SP 800-171 as structured inputs and reporting overlays

Assessments are still part of the product, but they are not the product's center of gravity.

## Correct Product Framing

The platform should be:

- program-first
- resilience-first
- continuous rather than point-in-time
- framework-informed rather than framework-owned

The primary question is not:

- is this company compliant right now

The primary question is:

- what security program does this company have today
- where is it fragile
- what should be improved next
- how should the program be maintained over time

## What Changes

The old mental model was trending toward:

1. onboarding
2. assessment mapping
3. findings
4. remediation

The corrected model should be:

1. onboarding and discovery
2. program baseline
3. capability and resilience profile
4. prioritized roadmap
5. implementation tracking
6. continuous maintenance
7. framework assessment and reporting as one lens inside the cycle

## Role of Frameworks

CMMC and NIST SP 800-171 remain important, but they should be treated as:

- discovery aids
- maturity inputs
- gap-identification lenses
- export and reporting overlays
- validation checkpoints

They should not define the application's primary object model or user journey.

## New V1 Product Shape

The first version should help a consultant leave onboarding with:

- a company profile
- a business and technical context summary
- an initial security program baseline
- a capability-by-capability maturity view
- a prioritized improvement roadmap
- a small set of recommended next actions

## Recommended V1 Workflow

### 1. Company Discovery

Capture:

- business context
- industry and obligations
- operating model
- critical systems and dependencies
- staffing and outsourced support
- risk drivers and incident concerns

### 2. Program Baseline

Capture current state across core capabilities such as:

- governance and policy
- asset and configuration management
- identity and access
- endpoint and infrastructure security
- vulnerability management
- logging and monitoring
- incident response
- backup and recovery
- training and awareness
- vendor and third-party oversight

### 3. Capability Review

For each capability, determine:

- current maturity
- confidence in that maturity
- available evidence
- operational weaknesses
- resilience impact

### 4. Roadmap Generation

Generate improvement initiatives based on:

- risk reduction
- resilience value
- operational feasibility
- cost and effort
- business impact
- contractual or framework urgency

### 5. Ongoing Program Maintenance

Track:

- initiative status
- evidence freshness
- control drift
- environmental changes
- reassessment triggers
- recurring validation work

## What Still Fits From Current Work

Several parts of the current application still fit the product direction:

- company and engagement onboarding
- section-based workflow
- inline follow-up questions
- evidence references
- editable boundary summary
- trust-oriented finding fields such as evidence used and confidence

These pieces remain useful if they are repositioned under a broader program model.

## What Is Now Off-Track

These areas are currently overweight relative to the real product goal:

- requirement-by-requirement assessment views as a primary workflow
- control-centric findings as the main output of onboarding
- CUI and confidential-information handling as the dominant modeling lens
- framing the platform as an assessor tool instead of a program management tool

This work is not wasted, but it should become a secondary module rather than the main app path.

## Recommended Domain Center

The product should revolve around these core concepts:

- Company
- Engagement
- Security Program
- Capability
- Capability Review
- Initiative
- Evidence
- Risk
- Decision
- Framework Overlay

The framework overlay should map capabilities and evidence to CMMC, NIST SP 800-171, and later frameworks without taking over the base program model.

## Recommended Next Planning Work

Before more implementation, the next planning tasks should be:

1. define the program-first domain model
2. redefine onboarding around company discovery and capability baseline
3. define the roadmap and initiative model
4. decide how framework overlays attach to capabilities and evidence
5. identify which current UI paths become secondary rather than primary

## Immediate Implementation Guidance

Do not deepen the product around requirement-detail and assessment-first flows until the program-first model is established.

The next implementation slices should favor:

- capability baseline onboarding
- program dashboard or workspace
- initiative generation and prioritization
- maintenance and drift tracking

Requirement-level assessment views can remain in the repo, but they should no longer define the primary roadmap.
