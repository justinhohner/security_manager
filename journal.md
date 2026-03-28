## 2026-03-28

- justinhohner clarified that the product is not an assessment tool for CMMC or NIST SP 800-171.
- The intended product is a security program manager that uses frameworks as inputs, overlays, and reporting lenses.
- Current assessment-first work still has value, but it should become secondary to a program-first model centered on capability baseline, roadmap, and maintenance.
- Added three replacement planning docs for the new center of gravity: program-first domain model, capability baseline onboarding, and initiative/roadmap model.
- Replaced the old implementation-facing planning direction with program-first versions of the screen map, API contract, and first vertical slice.
- Created issue #8 for the program-first workspace scaffold and added a parallel `/program` route with derived capability baseline and roadmap preview.
- Added read-only capability detail pages under the program workspace so capability cards now drill into rationale, evidence signals, and linked next actions.
- Added saved initiative candidates to the program workspace so roadmap preview items can now be promoted into tracked planning records.
- Added initiative detail pages and simple status transitions so saved initiative candidates can move into planned and in-progress states.
- Added a dedicated roadmap workspace that groups saved initiatives by status and links into initiative detail from a stable planning list view.
- Added lightweight owner and target-date planning fields to initiative detail so saved initiatives can start functioning as a consultant work plan.
