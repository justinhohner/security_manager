# Screen Map

## Purpose

This document defines the initial application surfaces for the program-first version of v1.

The goal is to keep frontend design anchored to workflows for onboarding, capability baseline, roadmap generation, and ongoing program maintenance.

## Application Shape

The product should begin as a single application with role-based views for consultants and internal reviewers.

The primary navigation should favor program workflow progression over framework-centric reporting.

Suggested top-level navigation:

- engagements
- program baseline
- capabilities
- roadmap
- maintenance
- framework overlays
- exports

## 1. Engagement List

Purpose:

- locate active and past engagements
- create a new engagement
- understand current progress at a glance

Primary information:

- company name
- engagement name
- engagement goal
- current stage
- last updated
- top priority indicator

Primary actions:

- create engagement
- open engagement
- export engagement summary

## 2. Engagement Overview

Purpose:

- provide the operating summary for a single engagement
- show where the team is in the workflow
- surface capability gaps and priority direction

Primary panels:

- company and engagement summary
- business and operating context
- onboarding completion
- capability baseline summary
- roadmap preview
- evidence readiness
- next recommended actions

## 3. Program Baseline Workspace

Purpose:

- complete the section-based onboarding flow
- capture structured answers
- generate and answer inline follow-up questions
- build the current-state program baseline

Primary layout:

- left navigation for sections
- center pane for questions and answers
- right context pane for capability summary, evidence cues, and follow-up rationale

Primary section order:

1. engagement context
2. business context
3. operating model
4. technology and dependency profile
5. security capability baseline
6. evidence and validation readiness
7. framework and obligation overlay
8. initial program review

Primary interaction rules:

- baseline questions appear in stable section order
- inline follow-up questions appear directly under the triggering answer
- factual fields use structured inputs
- evaluative fields use the 1 to 5 scale
- freeform notes stay minimal and contextual

## 4. Capability Workspace

Purpose:

- inspect one capability in more detail
- understand maturity, confidence, evidence, and operational weaknesses
- prepare improvement planning

Primary panels:

- capability summary
- maturity and confidence
- strengths and weaknesses
- linked systems or dependencies
- evidence readiness
- framework overlay hints

Primary actions:

- review current posture
- add supporting evidence references
- flag low-confidence assumptions
- mark candidate initiatives

## 5. Roadmap Workspace

Purpose:

- review, validate, and prioritize initiative candidates
- turn current-state understanding into practical improvement work

Primary list fields:

- priority
- initiative title
- target capabilities
- resilience value
- effort band
- status

Initiative detail should show:

- summary
- targeted capabilities
- related risks
- expected outcomes
- suggested first steps
- evidence or validation expectations
- priority rationale
- framework relevance if any

Primary actions:

- accept or revise initiative
- adjust priority inputs
- promote to tracked work
- defer or regroup initiative

## 6. Maintenance Workspace

Purpose:

- track recurring or triggered work needed to keep the program healthy

Primary list fields:

- maintenance task
- cadence or trigger
- owner
- linked capability
- validation expectation
- status

Primary detail panels:

- task summary
- why it matters
- required evidence
- trigger conditions
- recent completion history

## 7. Framework Overlay Workspace

Purpose:

- view the security program through a framework lens without making the framework the main workflow

Primary panels:

- selected framework summary
- mapped capabilities
- supported and unsupported requirement areas
- evidence gaps
- export readiness

Primary actions:

- review framework alignment
- identify overlay gaps
- generate framework-facing export

## 8. Exports

Purpose:

- produce client-ready outputs without needing client login

Likely export types:

- engagement summary
- capability baseline summary
- roadmap summary
- maintenance summary
- framework overlay report

## Design Notes

- the application should keep list-and-detail workflows consistent across capabilities, roadmap, and maintenance
- every major workspace should show confidence, unresolved items, and recommended next actions
- the UI should optimize for structured consulting work rather than conversational interaction
- framework-centric views should feel like overlays on top of the main program workspace
