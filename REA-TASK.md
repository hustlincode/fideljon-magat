# REA-TASK.md — Reverse-Engineering Task Log

> Protocol: official REA (github.com/morluto/rea, docs at rea.tools).
> Rule: never guess a command; every claim needs REA evidence.

## Step 0 — RESUME (DONE)
- Checked for REA-TASK.md: did not exist → started fresh at step 1.

## Step 1 — ASK (DONE)
User answers (saved verbatim-in-meaning):
- **What to reverse:** Website — Fidel Jon Magat's portfolio.
- **Where it is:** https://fideljon.vercel.app (live; identical to https://fideljon-magat.vercel.app from package.json).
- **Scope (one feature):** Homepage — hero, navbar, intro, recent works, skillset, contact, footer, scroll/reveal motion, responsive behavior.
- **Goal:** C — working version reproduced inside the existing project (D:\FideljonPortfolio), validated side by side.
- **Source of truth:** Live site = source of truth. Audit the local project against the live site, fix every difference, keep working features intact.

Facts gathered during recon:
- Local project: React 18 + Vite 5, React Router, GSAP + Lenis + motion, "Aether" chatbot, orange #FF5500 accent.
- The live site appears to be this exact repo deployed (same content, same chatbot, same accent).
- Git repo: clean, origin = https://github.com/hustlincode/FideljonPortfolio.git

## Step 2 — SETUP (DONE)
- Node: v24.16.0 (allowed: 22.19+, 24.11+, 26+).
- REA CLI verified via `npx -y rea-agents@latest --help` → rea@6.5.0.
- Doctor (before): `registration:opencode` = FAIL (config_drift) → setup required per protocol.
- Dry-run shown to user; user approved.
- `npx -y rea-agents@latest setup --client opencode --yes --json` → applied: configured_opencode + installed_skill.
  - Registration command: `cmd.exe /d /c npx -y rea-agents@6.5.0 mcp`
  - Backup: C:\Users\fidel\.config\opencode\opencode.jsonc.rea.backup
  - Skill: reverse-engineer-anything v42, 207 tools, aligned.
- Doctor (after): `registration:opencode` = aligned; healthy: true. (Ghidra/JADX/Hopper/IDA missing = normal, not needed for web route.)
- Action needed: restart OpenCode so the new MCP registration loads.

**next step: 3**  (ROUTE — website → rea.tools/guides/browser)

## Repo / Step 7 state (for resume)
- Remote now redirects: github.com/hustlincode/FideljonPortfolio → github.com/hustlincode/fideljon-magat (renamed on GitHub; About = fideljon-magat.vercel.app).
- Current branch: css_architecture (commits pushed here).
- Repo visibility: PUBLIC. Decision pending: user wants private? (gh CLI is not installed; visibility can be changed in GitHub settings or by installing gh.)
- Commits so far: REA-TASK.md created and pushed (chore(rea): step 1-2).
