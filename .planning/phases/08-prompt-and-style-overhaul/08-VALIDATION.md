---
phase: 8
slug: prompt-and-style-overhaul
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler + Next.js build + manual visual verification |
| **Config file** | tsconfig.json |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npx next build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx next build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | PRMT-01, PRMT-02, PRMT-03, PRMT-04, PRMT-05 | type-check + build | `npx tsc --noEmit && npx next build` | N/A | ⬜ pending |
| 08-02-01 | 02 | 1 | STYL-01, STYL-02, STYL-03, STYL-04 | type-check + migration | `npx tsc --noEmit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. TypeScript compilation validates code correctness; style migration is SQL; visual output requires manual verification.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Prompt outputs modular [STYLE][LAYOUT][CONTENT][CONSTRAINTS] sections | PRMT-01 | Prompt is a string — structure verified by reading output | Generate a menu, check prompt_used in DB or console |
| Negative prompting included | PRMT-02 | Part of prompt string | Verify "No food photographs", "No clipart" etc. in prompt |
| 8 styles produce distinct, professional images | STYL-01, STYL-02 | AI image quality is subjective | Generate with each style, compare results |
| StyleGallery gradient previews render correctly | STYL-03 | Visual UI check | Open style selection, verify gradient cards |
| Personalizado still works | STYL-04 | End-to-end flow | Enter custom prompt, generate image |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
