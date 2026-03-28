# Program-First Domain Model

## Purpose

This document defines the core domain objects for a security program manager.

The model is centered on understanding a company's current security program, identifying the most important gaps, and tracking improvement over time.

Frameworks such as CMMC and NIST SP 800-171 attach to this model as overlays. They do not define the model itself.

## Model Principles

1. The primary unit of value is the security program, not the assessment.
2. Capabilities are more important than controls as the base modeling layer.
3. Questions, evidence, scans, and framework mappings are inputs into program understanding.
4. Roadmap items and maintenance work are first-class outputs.
5. The model should support continuous consulting work, not only point-in-time reviews.

## Core Objects

### Company

Represents the client organization.

Key fields:

- company_id
- legal_name
- preferred_name
- industry
- employee_count_range
- locations
- business_units
- revenue_model
- customer_profile
- service_providers

### Engagement

Represents a consulting engagement or program workstream.

Key fields:

- engagement_id
- company_id
- engagement_name
- lead_consultant
- start_date
- end_date
- status
- engagement_goal

### Security Program

Represents the client's current security operating model as understood during the engagement.

Key fields:

- program_id
- company_id
- engagement_id
- operating_summary
- program_owner
- staffing_model
- governance_summary
- resilience_summary
- current_stage

### Capability

Represents a reusable security capability area the program needs to operate well.

Examples:

- governance and policy
- asset and configuration management
- identity and access management
- endpoint and infrastructure protection
- vulnerability management
- logging and monitoring
- incident response
- backup and recovery
- security awareness
- vendor and third-party oversight

Key fields:

- capability_id
- name
- category
- description
- resilience_dimension

### Capability Review

Represents the current observed state of one capability for one company or engagement.

Key fields:

- capability_review_id
- program_id
- capability_id
- maturity_score
- confidence_score
- operating_summary
- strengths
- weaknesses
- evidence_readiness
- resilience_impact
- status

### System Profile

Represents a business or technical system that matters to the security program.

Key fields:

- system_profile_id
- program_id
- name
- business_function
- owner
- hosting_model
- criticality
- dependency_type
- recovery_importance

### Risk Driver

Represents a business, technical, or contractual condition that shapes priorities.

Examples:

- regulated customer expectations
- weak identity controls
- limited security staffing
- high ransomware exposure
- fragile backups
- third-party concentration

Key fields:

- risk_driver_id
- program_id
- title
- description
- source
- urgency
- impact_area

### Evidence

Represents supporting material for program understanding.

Key fields:

- evidence_id
- engagement_id
- evidence_type
- title
- source
- collected_at
- freshness
- linked_object_type
- linked_object_id
- trust_level

### Scan

Represents technical validation data that informs the program baseline.

Key fields:

- scan_id
- engagement_id
- scan_type
- target
- executed_at
- summary
- linked_system_profiles
- linked_capability_reviews

### Initiative

Represents a proposed or active improvement effort.

Key fields:

- initiative_id
- program_id
- title
- summary
- target_capabilities
- primary_risk_drivers
- expected_outcomes
- effort_estimate
- cost_estimate
- resilience_value
- priority
- status

### Initiative Milestone

Represents a measurable checkpoint inside an initiative.

Key fields:

- milestone_id
- initiative_id
- title
- due_date
- owner
- validation_method
- status

### Maintenance Task

Represents recurring or triggered work needed to keep the program healthy.

Examples:

- quarterly access review
- backup restore validation
- logging coverage review
- incident exercise
- policy refresh

Key fields:

- maintenance_task_id
- program_id
- title
- cadence
- trigger_condition
- owner
- evidence_expectation
- status

### Framework Overlay

Represents a mapping layer from the security program to a framework.

Key fields:

- framework_overlay_id
- program_id
- framework_name
- framework_version
- scope_notes
- reporting_state

### Framework Mapping

Represents how a capability, evidence item, initiative, or maintenance task supports a framework requirement.

Key fields:

- framework_mapping_id
- framework_overlay_id
- target_object_type
- target_object_id
- requirement_id
- support_level
- notes

### Decision

Represents a recorded judgment that affects scope, priority, or interpretation.

Key fields:

- decision_id
- engagement_id
- title
- context
- decision
- rationale
- decided_by
- decided_at

## Core Relationships

- one company has many engagements
- one engagement has one active security program view
- one security program has many capability reviews
- one security program has many system profiles
- one security program has many risk drivers
- one security program has many initiatives
- one initiative has many milestones
- one security program has many maintenance tasks
- evidence can support capability reviews, initiatives, maintenance tasks, and framework mappings
- framework overlays map the base program model to external frameworks

## Frontend and Backend Contract Guidance

The frontend should treat capability reviews, initiatives, and maintenance tasks as first-class resources.

The backend should expose:

- canonical program resources
- workflow endpoints for onboarding and roadmap generation
- overlay endpoints for framework mapping and reporting

The application should not force consultants to think in requirement-first terms unless they are explicitly entering a framework review mode.
