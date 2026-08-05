# Decisions

Durable architectural rationale that cannot be reconstructed cheaply from the current code. Newest entries go first; each field stays within one to four sentences.

## 2026-08-05 — Public API changes require explicit compatibility decisions

**Context:** The package has published `createApp`, `h`, `hFragment`, and `hString`, even though the project is still experimental.
**Decision:** Treat these exports and the `createApp` option shape as a compatibility boundary. Breaking changes require migration notes, consumer evidence, and an explicit major-version decision.
**Why:** A small user base is not proof that no consumer exists, and silent rewrites make both human and agent work unsafe.
**Consequences:** Internal renderer and type changes remain free behind behavioral contracts; accidental defects are not promoted to promises.

## 2026-08-05 — Keep one runtime package until a second product boundary exists

**Context:** The runtime is small enough to understand as one unit, while speculative package splitting would add manifests, build edges, and navigation overhead.
**Decision:** Use internal VNode, renderer, DOM-props, and application boundaries inside `packages/runtime` rather than creating packages now.
**Why:** Local module boundaries provide the reasoning benefit without cross-package coordination cost.
**Consequences:** A second renderer or independently consumable subsystem is the trigger for reconsidering package boundaries.

## 2026-08-05 — AI-native means explicit and measurable, not prompt-heavy

**Context:** The project goal is maximum convenience for AI agents while remaining readable for humans.
**Decision:** Optimize for plain data, explicit flow, narrow modules, typed contracts, deterministic checks, and repeatable agent evaluations. Avoid hidden runtime/compiler magic in the core.
**Why:** The same properties that reduce an agent's context and ambiguity also improve reviewability and maintenance for humans.
**Consequences:** New abstractions must reduce demonstrated complexity; agent usability claims are checked through `docs/agent-evals.md`.

## 2026-08-05 — Documentation uses layers with different lifetimes

**Context:** A journal alone cannot describe a framework's current contracts and architecture, while a single large manual quickly becomes stale.
**Decision:** Keep living truth in `docs/vision.md`, `docs/architecture.md`, `docs/development.md`, and `docs/contracts/`; keep durable rationale and gotchas in `docs/journal/`; keep active work only in Beads.
**Why:** Separating current truth, historical rationale, and task state gives agents precise retrieval without duplicating volatile information.
**Consequences:** Every document has an explicit read/update trigger in `docs/README.md`; journal archives are excluded from routine agent retrieval.
