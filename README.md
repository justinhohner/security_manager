# Security Manager

Security Manager is an agentic AI consultant for security framework alignment and resilience planning.
It is intended to help organizations scope assessment boundaries, collect evidence, identify gaps, and prioritize remediation across compliance and operational security outcomes.

## Initial Scope

The first frameworks in scope are:

- CMMC
- NIST SP 800-171
- NIST SP 800-171A

The system is being designed to support more than static compliance. It should help organizations:

- understand what systems, people, and processes are in scope
- assess control implementation and evidence quality
- identify gaps and prioritize remediation work
- improve resilience through better detection, response, and recovery readiness

## Core Product Direction

The product should support a staged workflow:

1. Onboard the company and build a profile.
2. Define the assessment boundary and in-scope systems.
3. Ask framework-aware questions and generate follow-up questions.
4. Collect and map evidence to requirements and assessment objectives.
5. Augment interviews and questionnaires with technical scans.
6. Produce findings, risk context, and remediation recommendations.
7. Prioritize remediation by cost, risk, benefit, and operational impact.
8. Track decisions, POA&M items, and reassessment over time.

## Documentation Map

- [Project Architecture](./docs/architecture.md)
- [Onboarding Flow](./docs/onboarding-flow.md)
- [Domain Model](./docs/domain-model.md)
- [Screen Map](./docs/screen-map.md)
- [API Contract Draft](./docs/api-contract.md)
- [Vertical Slice 001](./docs/vertical-slice-001.md)
- [Architecture Decision Records](./docs/adr/README.md)
- [ADR 0002: Onboarding Interaction Model](./docs/adr/0002-onboarding-interaction-model.md)
- [Initial GitHub Issue Draft](./docs/github-issue-bootstrap.md)

## Working Agreement

Major design decisions should be captured as ADRs so the system can evolve without losing reasoning context.
