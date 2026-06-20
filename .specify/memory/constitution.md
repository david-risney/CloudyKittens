<!--
Sync Impact Report
==================
Version change: (template/unversioned) → 1.0.0
Bump rationale: Initial ratification — first concrete constitution replacing the
  unfilled template. MAJOR baseline established.

Modified principles: All placeholders replaced with concrete principles:
  - [PRINCIPLE_1_NAME] → I. Web Baseline, No Frameworks
  - [PRINCIPLE_2_NAME] → II. Spec-Driven Development
  - [PRINCIPLE_3_NAME] → III. Test-First (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] → IV. Calm, Cute & Accessible Experience
  - [PRINCIPLE_5_NAME] → V. Simplicity & Static Deployability

Added sections:
  - Additional Constraints (Technology & Performance)
  - Development Workflow & Quality Gates
  - Governance (fully specified)

Removed sections: None (all template slots filled).

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check uses dynamic
       reference; no hardcoded principle edits required)
  - ✅ .specify/templates/spec-template.md (no constitution-specific edits required)
  - ✅ .specify/templates/tasks-template.md (no constitution-specific edits required)
  - ✅ .specify/templates/commands/* (none present beyond extension command;
       no outdated references found)

Follow-up TODOs: None.
-->

# CloudyKittens Constitution
<!-- A cute, fun, calm web game built on the modern web platform baseline. -->

## Core Principles

### I. Web Baseline, No Frameworks

The game MUST be built directly on the modern web platform using only HTML, CSS, and
JavaScript (or TypeScript compiled to standard JavaScript). UI frameworks and CSS
frameworks (e.g. React, Vue, Svelte, Angular, Tailwind, Bootstrap) are PROHIBITED.

- Features MUST rely on capabilities supported by [Baseline](https://web.dev/baseline)
  (widely available across current Chrome, Edge, Firefox, and Safari). Use of
  non-Baseline APIs requires explicit justification and a graceful fallback.
- Direct DOM, Canvas, Web Audio, and standard Web APIs are the building blocks.
- Small, focused, dependency-free utility modules are permitted; pulling in a
  general-purpose framework is not.

**Rationale**: The platform itself is now capable, fast, and durable. Avoiding
frameworks keeps the game lightweight, easy to reason about, and free of churn from
external dependency upgrades.

### II. Spec-Driven Development

Every feature MUST begin with a written specification before implementation. Code
without a corresponding spec is not accepted.

- A spec describes user-visible behavior and acceptance criteria, not implementation.
- Ambiguities MUST be resolved in the spec (via clarification) before coding starts.
- The spec is the source of truth; when code and spec disagree, one of them is a bug
  to be fixed deliberately.

**Rationale**: A calm, polished game emerges from intentional design. Specifying
behavior first prevents scope drift and makes review objective.

### III. Test-First (NON-NEGOTIABLE)

Tests MUST be written and MUST fail before the implementing code is written.
Red → Green → Refactor is strictly enforced.

- Each spec acceptance criterion MUST map to at least one automated test.
- Game logic (state, rules, scoring, transitions) MUST be unit tested independently
  of the DOM where practical.
- No feature is "done" until its tests pass in the standard test runner.

**Rationale**: Tests encode the spec and guard the calm, predictable behavior players
rely on. Writing them first proves the spec is testable and the code is honest.

### IV. Calm, Cute & Accessible Experience

The experience MUST remain calm, gentle, and inclusive. The game is a place to relax,
never to stress.

- No punishing fail states, harsh time pressure, jarring audio, or aggressive
  monetization patterns. Tone is soft, cute, and forgiving.
- Motion MUST respect `prefers-reduced-motion`; audio MUST be off or gentle by default
  and user-controllable.
- Interactive elements MUST be keyboard-operable and meet WCAG AA color-contrast and
  focus-visibility expectations.

**Rationale**: The product's whole purpose is a calm, delightful moment. Accessibility
and gentleness are core requirements, not enhancements.

### V. Simplicity & Static Deployability

The game MUST stay simple to run and deploy: serving static files MUST be sufficient.

- No required server-side runtime, database, or backend for core gameplay. State that
  must persist uses client storage (e.g. `localStorage`/IndexedDB).
- Apply YAGNI: add abstraction only when a concrete, present need demands it.
- The build, if any, MUST produce plain static assets runnable from any static host.

**Rationale**: Simplicity keeps the project approachable, fast to load, and cheap to
host, while reinforcing the no-framework, Baseline-first philosophy.

## Additional Constraints (Technology & Performance)

- Language & platform: standard HTML5, modern CSS, and ES modules. TypeScript is
  allowed provided output is standard JavaScript with no framework runtime.
- Assets MUST be optimized; total initial load SHOULD stay small enough to feel
  instant on a typical connection.
- Animations target a smooth 60fps and MUST degrade gracefully under reduced-motion.
- Third-party dependencies are minimized; each addition MUST be justified against
  Principles I and V and pinned to a specific version.

## Development Workflow & Quality Gates

- Workflow order per feature: Spec → Clarify (if needed) → Plan → Tasks → Test-First
  Implementation → Review.
- Every change MUST pass the automated test suite before merge.
- Code review MUST verify: spec exists and is satisfied, tests precede code and cover
  acceptance criteria, no prohibited frameworks introduced, and accessibility/calm
  requirements are met.
- Any deviation from a principle MUST be recorded with explicit justification in the
  feature's plan (Complexity Tracking) and approved during review.

## Governance

This constitution supersedes all other development practices for the project. When a
practice conflicts with this document, this document wins.

- **Amendments**: Proposed via pull request that edits this file, including a Sync
  Impact Report and updated version. Amendments require review approval before merge.
- **Versioning policy**: Semantic versioning of the constitution itself:
  - MAJOR: backward-incompatible governance/principle removals or redefinitions.
  - MINOR: a new principle/section or materially expanded guidance.
  - PATCH: clarifications, wording, or non-semantic refinements.
- **Compliance review**: Every PR and review MUST verify compliance with the principles
  above. Unjustified violations block merge. Justified exceptions MUST be documented in
  the relevant plan's Complexity Tracking section.
- **Runtime guidance**: Agent and contributor runtime guidance lives in the active
  plan and the spec-kit templates; those MUST stay consistent with this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-06-15 | **Last Amended**: 2026-06-15
