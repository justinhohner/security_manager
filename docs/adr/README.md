# Architecture Decision Records

This directory stores architecture decision records for significant design choices.

Each ADR should capture:

- the decision being made
- the context and constraints
- the options considered
- the selected option
- the consequences of the decision

## Naming

Use sequential filenames:

- `0001-<short-topic>.md`
- `0002-<short-topic>.md`
- `0003-<short-topic>.md`

## Suggested Process

1. Open or reference a GitHub issue for the decision.
2. Record the context and tradeoffs in an ADR.
3. Review the decision before implementation if it changes architecture or product direction.
4. Update the ADR status if the decision is superseded later.

## Starter Decisions

The first ADRs likely needed for this project are:

- assessment boundary model
- evidence graph design
- finding prioritization model
- scan integration strategy
- human approval points for agent actions

Current ADRs:

- `0001-record-architecture-decisions.md`
- `0002-onboarding-interaction-model.md`
- `0003-adopt-program-first-product-model.md`
