# Decisions

Durable architectural rationale that cannot be reconstructed cheaply from the current code. Newest entries go first; each field stays within one to four sentences.

## 2026-08-05 — Build tooling is judged by dependency surface, not by convenience

**Context:** `rollup-plugin-filesize` printed a bundle-size report during the build. It pulled `pacote`, `tar`, and `sigstore` into the tree, and was the sole remaining source of 12 audit findings, 1 of them critical; the only fix npm offered was a major downgrade. It also wrote its report to stdout, which corrupted `npm pack --json` and forced a workaround in `scripts/check-package.mjs`.
**Decision:** Remove the plugin rather than downgrade or accept the findings. A development tool must justify its transitive dependency surface against what it actually provides.
**Why:** A cosmetic build report is not worth a package-fetching dependency chain, and a tool that pollutes stdout makes machine-readable build output unreliable.
**Consequences:** `npm audit` reports zero findings and the package check performs a single `npm pack` with `prepack` live. Build plugins that write to stdout or add fetching, archiving, or signing dependencies need an explicit decision before adoption.

## 2026-08-05 — Browser ESM is the runtime contract; Node and npm are tooling defaults

**Context:** A frontend runtime, its development host, package manager, and registry are different portability surfaces; binding them together would shrink compatibility without improving browser behavior.
**Decision:** Ship standards-based ESM without Node-specific APIs. Use Active Node LTS and npm as the canonical development, CI, and publishing path; treat pnpm, Bun, Deno, and later JSR as compatibility or distribution lanes.
**Why:** Browser independence preserves the widest consumer surface, while the established Node/npm path minimizes ecosystem and agent ambiguity. Alternatives may still prove operational advantages without becoming framework semantics.
**Consequences:** Runtime imports of host-specific APIs are architecture violations. Replacing the canonical toolchain requires repository-specific compatibility and performance evidence plus a new decision.

## 2026-08-05 — Competitive claims require correctness-first reproducible evidence

**Context:** Microbenchmarks can reward invalid DOM behavior, incompatible modes, or cherry-picked operations, while the project also wants to measure AI and human changeability.
**Decision:** Use `docs/performance.md` as the measurement contract: correctness gates timing, standard and product workloads stay separate, raw samples and environment metadata accompany summaries, and changeability is evaluated independently.
**Why:** Scoped reproducible evidence can guide architecture; an absolute “faster than” claim cannot.
**Consequences:** Benchmark-only runtime APIs and unpublished exclusions are rejected. Candidate budgets become gates only after a recorded baseline ratifies them.

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
