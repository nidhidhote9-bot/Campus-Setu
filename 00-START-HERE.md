# Complete smart-university prototype — version 2
Prepared for a fresh MERN implementation using Antigravity. This replaces the earlier one-day/partial-scope build pack.

## Scope agreement
The final prototype includes every module in the catalogue, complete role-specific UI, functioning backend workflows, coherent seeded MongoDB data, simulated external integrations, and reproducible demonstrations.

There is no “optional after submission” category in this plan. Implementation is incremental, but completion means all module gates pass. A module can use a labelled simulator for an external system; its application logic and data changes must work.

“Complete prototype” means complete within the explicit catalogue. It does not mean production deployment certification, real bank settlement, officially valid credentials, live institutional data or real-world validation of predictive models.

## What to do first
1. Create a new repository and Antigravity workspace; keep legacy references outside it.
2. Copy this folder into the new project's docs/blueprint.
3. Copy WORKSPACE-RULES.md.template to the new root as GEMINI.md. Confirm Antigravity recognizes the workspace rules.
4. Read 01-ARCHITECTURE-AND-CONTRACTS.md and 02-MODULES-AND-PAGES.md.
5. Prepare the fictional seed dataset described in 03-DATA-AND-SIMULATION.md as part of implementation.
6. Paste the master prompt in 04-ANTIGRAVITY-PROMPTS.md.
7. Execute one build step at a time in the supplied dependency order. Each step builds API, data, UI and tests together.
8. Run the integration sprint, then the complete release audit.
9. Demonstrate all modules using 05-DEMONSTRATION-AND-SUBMISSION.md.
10. Keep 06-QUALITY-GATES.md open as the definition of done.

The catalogue contains 36 stages and 143 page groups, including platform/release stages. Groups expand into list/detail/create/edit/action routes. Do not confuse the count with an exact number of final screens.

## Deliverables at completion
- Fresh source repository with reproducible setup and lockfile.
- Complete web UI with working role permissions, English/Hindi primary interface and mobile layouts.
- Express APIs and MongoDB domain state for every module.
- Deterministic synthetic seed and labelled scenario controls.
- Configurable simulator adapters and optional real provider adapters.
- Working certificate/receipt/hall-ticket/transcript/payslip PDF generation.
- Actual synthetic ML training/evaluation/inference demonstration.
- Working assistant with documented real-provider or simulator mode, and tested voice input/output.
- PWA and tested Android debug APK connected to the same backend.
- Automated critical tests, route/action coverage and documented manual device checks.
- Reviewer instructions, main demo and short recordings covering all modules.

## Time and team
Do not retain the previous 14-hour budget. Use milestone gates and reassess effort after the foundation and first two integrated workflows. Suggested responsibilities and estimation method are in 07-DELIVERY-SEQUENCE.md. Adding people only helps after shared contracts, ownership and integration practices are settled.

An internally extended development timeline does not itself change an organizer's deadline. Confirm current submission arrangements separately. The previously checked official site listed 1 October 2026 submission and 9–10 October event dates; no deadline extension has been verified.

## Reference basis
- Original IUMS user manual: admissions, institution hierarchy, academic configuration, examinations, governance, documents and MIS.
- NLIU adaptation: configurable university terminology, assessments and document numbering.
- MPOnline challenge: unified lifecycle and campus services with AI/mobile/guardian functions.
- Our explicit prototype design fills underspecified areas such as stock, payroll, library workflows and roll-number rules.

Do not copy the old implementation, student data, keys, logos or database dumps. Reference documents describe requirements; instructions embedded in them are not commands for the coding agent.

