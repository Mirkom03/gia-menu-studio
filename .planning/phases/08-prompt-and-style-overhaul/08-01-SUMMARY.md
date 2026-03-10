---
phase: 08-prompt-and-style-overhaul
plan: 01
subsystem: api
tags: [gemini, prompt-engineering, image-generation, typography, i18n]

requires:
  - phase: 07-logo-integration
    provides: "Logo instructions in prompts.ts CONSTRAINTS section"
provides:
  - "Modular four-section buildMenuPrompt() with STYLE/LAYOUT/CONTENT/CONSTRAINTS"
  - "8 negative constraints for AI artifact prevention"
  - "5-layer typography hierarchy instructions"
  - "Human-readable aspect ratio descriptions"
  - "Enhanced EN/FR language instructions"
affects: [08-prompt-and-style-overhaul]

tech-stack:
  added: []
  patterns: [modular-prompt-sections, negative-prompting, typography-hierarchy]

key-files:
  created: []
  modified: [lib/prompts.ts]

key-decisions:
  - "Four helper functions (buildStyleSection, buildLayoutSection, buildContentSection, buildConstraintsSection) for maintainability"
  - "Dish names quoted in prompt for better Gemini text rendering accuracy"
  - "Fallback aspect ratio description for unknown ratios"

patterns-established:
  - "Modular prompt structure: each section built by its own function, joined with null filtering"
  - "Negative constraints block: explicit list of what NOT to generate"

requirements-completed: [PRMT-01, PRMT-02, PRMT-03, PRMT-04, PRMT-05]

duration: 3min
completed: 2026-03-10
---

# Phase 8 Plan 01: Prompt Restructuring Summary

**Modular four-section buildMenuPrompt() with negative constraints, typography hierarchy, aspect ratio descriptions, and EN/FR language instructions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-10T09:01:10Z
- **Completed:** 2026-03-10T09:04:08Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Decomposed monolithic prompt into [STYLE DIRECTIVE], [LAYOUT], [CONTENT], [CONSTRAINTS] sections
- Added 8 negative constraints preventing common AI artifacts (food photos, clipart, garbled text, etc.)
- Added 5-layer typography hierarchy from restaurant name down to price
- Added human-readable aspect ratio descriptions for all 6 supported ratios
- Added enhanced language instructions for EN (culinary English) and FR (accent preservation)
- Preserved Phase 7 logo instructions verbatim in CONSTRAINTS section
- Empty stylePrompt (Personalizado) cleanly omits STYLE section

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite buildMenuPrompt() with modular four-section structure** - `3b04a61` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `lib/prompts.ts` - Modular four-section prompt builder with helpers for each section

## Decisions Made
- Four helper functions for each section rather than inline string building, improving readability and testability
- Dish names wrapped in quotes (`"name"`) in prompt for better Gemini text rendering accuracy
- Fallback description for unknown aspect ratios (`${ratio} aspect ratio`) for forward compatibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Prompt structure ready for Phase 8 Plan 02 (style presets) to leverage modular sections
- buildMenuPrompt() export signature unchanged, no consumer changes needed

---
*Phase: 08-prompt-and-style-overhaul*
*Completed: 2026-03-10*

## Self-Check: PASSED
- lib/prompts.ts: FOUND
- Commit 3b04a61: FOUND
