# ADR 0003: Adopt Program-First Product Model

## Status

Accepted

## Context

The project was initially framed as an agentic AI security manager that would help companies improve resilience while using CMMC and NIST SP 800-171 as key starting frameworks.

During early planning and implementation, the design drifted toward an assessment-centric application:

- onboarding fed requirement mapping
- requirement mapping fed findings
- findings fed remediation

That direction over-centered control-level assessment work and treated framework posture as the primary product output.

The intended product is broader. It should help consultants build, improve, and maintain a practical security program over time, with assessments serving as one input and one reporting lens.

## Decision

The product will adopt a program-first model.

This means:

- the primary workflow is security program discovery, baseline, roadmap, and maintenance
- frameworks such as CMMC and NIST SP 800-171 are overlays and validation lenses
- assessment artifacts are secondary to the broader program model
- resilience and operational maturity take precedence over point-in-time compliance status

## Consequences

Positive consequences:

- the product aligns better to continuous consulting work
- the application can support multiple frameworks without being defined by one of them
- roadmap generation and maintenance become first-class product outcomes
- resilience, detect/respond/recover, and operational sustainability can be modeled directly

Tradeoffs:

- some existing assessment-first work becomes secondary
- the current domain model will need to be re-centered around capabilities and initiatives
- future implementation should avoid expanding requirement-detail flows until the new core model is defined

## Implementation Direction

Near-term planning should focus on:

1. security program domain model
2. capability baseline onboarding
3. initiative and roadmap model
4. maintenance workflow
5. framework overlay model

Current assessment screens and logic may remain in place as provisional functionality, but they should not be treated as the primary application path.
