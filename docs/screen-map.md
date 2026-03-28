# Screen Map

## Purpose

This document defines the initial application surfaces for v1.

The goal is to keep frontend design anchored to the workflows already chosen for onboarding, assessment, findings, and remediation.

## Application Shape

The product should begin as a single application with role-based views for consultants and assessors.

The primary navigation should favor workflow progression over generic reporting.

Suggested top-level navigation:

- engagements
- onboarding
- boundary
- assessment
- findings
- remediation
- exports

## 1. Engagement List

Purpose:

- locate active and past engagements
- create a new engagement
- understand current progress at a glance

Primary information:

- company name
- engagement name
- target frameworks
- current stage
- last updated
- open high-priority findings count

Primary actions:

- create engagement
- open engagement
- export engagement summary

## 2. Engagement Overview

Purpose:

- provide the operating summary for a single engagement
- show where the team is in the workflow
- surface blockers and confidence gaps

Primary panels:

- company and engagement summary
- framework targets
- onboarding completion
- boundary confidence
- evidence readiness
- findings summary
- next recommended actions

## 3. Onboarding Workspace

Purpose:

- complete the section-based onboarding flow
- capture structured answers
- generate and answer inline follow-up questions

Primary layout:

- left navigation for sections
- center pane for questions and answers
- right context pane for notes, evidence references, and follow-up rationale

Primary section order:

1. engagement setup
2. business and contract context
3. organization profile
4. environment overview
5. boundary baseline
6. security program baseline
7. evidence readiness
8. initial review

Primary interaction rules:

- baseline questions appear in stable section order
- inline follow-up questions appear directly under the triggering answer
- factual fields use structured inputs
- evaluative fields use the 1 to 5 scale
- freeform notes stay minimal and contextual

## 4. Boundary Workspace

Purpose:

- review and refine the initial assessment boundary
- make scope assumptions visible
- connect systems and dependencies to the boundary

Primary panels:

- boundary summary
- in-scope systems
- protected systems
- third-party dependencies
- exclusions and assumptions
- confidence and unresolved scope questions

Primary actions:

- add or edit system
- mark CUI handling path
- record scope assumption
- flag unresolved scope question

## 5. Assessment Workspace

Purpose:

- connect requirements, objectives, answers, and evidence
- track assessment completeness
- prepare the basis for findings

Primary panels:

- framework families and requirements
- requirement detail
- mapped questions and answers
- evidence references
- assessment objective coverage
- missing information and confidence gaps

Primary actions:

- review requirement coverage
- attach evidence
- request follow-up
- mark ready for finding generation

## 6. Findings Workspace

Purpose:

- inspect, validate, and prioritize findings
- preserve trust by exposing reasoning and evidence

Primary list fields:

- priority
- requirement affected
- finding title
- confidence
- impact
- status

Finding detail must show:

- requirement affected
- finding statement
- why the finding exists
- evidence used
- evidence missing
- confidence
- impact
- recommended remediation
- priority rationale

Primary actions:

- accept or revise finding
- adjust priority inputs
- create remediation item
- mark for more evidence

## 7. Remediation Workspace

Purpose:

- transform validated findings into tracked remediation work

Primary list fields:

- remediation item
- linked finding
- owner
- effort
- cost
- target date
- status

Primary detail panels:

- action summary
- expected benefit
- cost and effort
- validation plan
- dependencies
- reassessment trigger

## 8. Exports

Purpose:

- produce client-ready outputs without needing client login

Likely export types:

- engagement summary
- boundary summary
- findings register
- remediation plan
- POA&M style export

## Design Notes

- the application should keep list-and-detail workflows consistent across boundary, findings, and remediation
- every major workspace should show completion, confidence, and unresolved items
- the UI should optimize for reviewable structured information rather than conversational interaction
