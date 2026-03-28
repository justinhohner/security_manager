# Security Manager

Security Manager is an agentic AI consultant for security framework alignment and resilience planning.
It is intended to help organizations build, improve, and maintain practical security programs while using frameworks as structured inputs, validation lenses, and reporting overlays.

## Initial Scope

The first frameworks in scope are:

- CMMC
- NIST SP 800-171
- NIST SP 800-171A

The system is being designed to support more than static compliance. It should help organizations:

- understand business, technical, and operational context
- baseline core security capabilities
- identify gaps and prioritize improvement work
- improve resilience through better detection, response, and recovery readiness
- maintain the program over time as environments and obligations change

## Core Product Direction

The product should support a staged workflow:

1. Onboard the company and build a profile.
2. Build a security program baseline across core capabilities.
3. Define important business, technical, and resilience context.
4. Use framework-aware questions and evidence to understand current stance.
5. Generate prioritized initiatives and improvement roadmap items.
6. Track implementation, maintenance, and recurring validation work.
7. Use assessments and framework mapping as one lens within the broader program lifecycle.

## Documentation Map

- [Product Reset](./docs/product-reset.md)
- [Project Architecture](./docs/architecture.md)
- [Onboarding Flow](./docs/onboarding-flow.md)
- [Domain Model](./docs/domain-model.md)
- [Screen Map](./docs/screen-map.md)
- [API Contract Draft](./docs/api-contract.md)
- [Vertical Slice 001](./docs/vertical-slice-001.md)
- [Architecture Decision Records](./docs/adr/README.md)
- [ADR 0002: Onboarding Interaction Model](./docs/adr/0002-onboarding-interaction-model.md)
- [ADR 0003: Adopt Program-First Product Model](./docs/adr/0003-adopt-program-first-product-model.md)
- [Initial GitHub Issue Draft](./docs/github-issue-bootstrap.md)

## Working Agreement

Major design decisions should be captured as ADRs so the system can evolve without losing reasoning context.
