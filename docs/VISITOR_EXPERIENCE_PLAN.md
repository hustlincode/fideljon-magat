# Visitor Experience & Enjoyable Content Plan — FJM Portfolio

**Status:** Draft for review  
**Created:** 2026-10-15  
**Depends on:** `docs/ANIMATION_PLAN.md` (motion tier), existing portfolio content  
**Scope:** Content/interaction ideas that make visits memorable and useful; no code changes  
**Focus:** The initial 2026-friendly “delight” ideas; external portfolio inspiration is intentionally discarded for this iteration.

## 1. Goal

Add enjoyable, optional, tasteful visitor experiences without becoming a gimmick:
- Recruiters understand value in under 60 seconds.
- Developers see proof of engineering and product taste.
- Return visitors get small, respectful surprises.
- Every delightful detail remains reduced-motion-safe, accessible, and performance-conscious.

## 2. Candidate delight experiences

### VX-1. Interactive mini-challenges (high value, medium risk)
**What:** A tiny logic puzzle or interactive challenge that can unlock a hidden project note, badge, or shortcut.  
**Where:** Projects section, optionally as an easter egg.  
**Why:** Proves interaction quality and keeps developers engaged.

### VX-2. Visit-aware hero Easter eggs (medium value, low-medium risk)
**What:** Time-of-day greeting, subtle accent variation, or a “you came back” cue for repeat visitors.  
**Where:** Hero section only.  
**Why:** Creates personalization without being intrusive.

### VX-3. Cursor/motion toys scoped to content (medium-high value, medium risk)
**What:** Magnetic avatars on project cards, springy tech icons, or a small pointer-reactive character.  
**Where:** Project cards, skills, hero area.  
**Why:** Builds on existing pointer tracking and gives content-aware delight.

### VX-4. “Behind the build” project interactions (high value, medium risk)
**What:** Before/after sliders, component breakdowns, decision timelines, or “try a sample” interactions.  
**Where:** `Projects` / `ProjectDetail`.  
**Why:** More valuable than decoration because it proves engineering thinking.

### VX-5. Friendly boot/status micro moments (medium value, low risk)
**What:** Fun but brief loading messages, transition winks, or scroll milestone callouts.  
**Where:** Route loading, nav progress rail, section transitions.  
**Why:** Adds personality while staying fast.

### VX-6. Shareable artifacts (medium-high value, medium risk)
**What:** “Copy link with context” card, OG-style preview, lightweight metrics card, or printable CV shortcut.  
**Where:** Footer CTA, Resume page, project details.  
**Why:** Encourages sharing and helps branding.

### VX-7. Skill/identity mini game (medium-high value, high risk)
**What:** Stack sorter, experience trivia, or “guess the stack” with clues from real projects.  
**Where:** Skills or a small secondary section.  
**Why:** Memorable identity marker when it stays optional.

### VX-8. Theme-aware delight (medium value, low-medium risk)
**What:** Light and dark versions get tiny distinct reactions while keeping the core layout consistent.  
**Where:** Hero, pointer toy, accent variations.  
**Why:** Makes theme switching feel intentional.

## 3. Recommendation: build in this order

### Phase A — Safe delight
1. VX-5 Friendly boot/status micro moments
2. VX-2 Visit-aware hero Easter eggs
3. VX-8 Theme-aware delight

### Phase B — Proof-driven interaction
4. VX-4 Behind the build project interactions
5. VX-3 Cursor/motion toys scoped to content

### Phase C — Identity/share features
6. VX-6 Shareable artifacts
7. VX-7 Skill/identity mini game
8. VX-1 Interactive mini-challenges

## 4. Feature approval checklist for each item
Before implementing any delightful feature, confirm:
- Does it improve recruiter comprehension or make the work more credible?
- Can it degrade gracefully under reduced motion?
- Does it increase or reduce INP / Lighthouse?
- Does it require assets we actually have?
- Is it useful after the first visit, not just impressive once?
- Can it be removed without breaking core navigation?

## 5. Asset requirements
- small set of project images/diagrams for before/after or “behind the build” interactions
- short copy focused on impact rather than feature lists
- licensed audio only if opt-in audio is eventually chosen
- emoji/icon assets kept minimal and consistent

## 6. Exclusions / anti-goals
- No autoplay sound
- No blocking splash animation
- No forced games or required puzzles before viewing work
- No fake metrics
- No user accounts or tracking-heavy personalization
- No delight that obscures the contact path

## 7. Suggested decision lock questions
1. Which 1–2 delight features should be real before adding visual-only polish?
2. Should these playful details target developers, recruiters, or both equally?
3. Should optional audio remain out of scope entirely?
4. Is the goal more “identity and memorability” or more “clarity and proof”?

No application code has been changed.