# Vision: an AI-native, human-readable frontend framework

## Purpose

`cursed_fw` is a small frontend framework for learning and experimenting with the mechanics of UI runtimes. Its distinctive constraint is that a new human or AI agent should be able to understand a subsystem, change it locally, and verify the result without reconstructing hidden conventions.

AI-native does not mean AI-generated or prompt-heavy. It means that the repository exposes intent through narrow modules, explicit types and data flow, executable contracts, deterministic tooling, and concise documentation.

## Product principles

1. **Explicit over magical.** Plain VNodes, functions, parameters, and return values are preferred over reflection, decorators, implicit globals, and compiler-only semantics.
2. **Local reasoning.** A change should require reading one subsystem, its contract, and its tests rather than the entire runtime.
3. **Executable truth.** Important behavior is expressed in tests and real consumer examples. Prose explains intent and boundaries; it does not replace evidence.
4. **Stable surfaces, replaceable internals.** Public APIs change deliberately. Internal algorithms may evolve behind behavioral contracts.
5. **Readable performance.** Optimize measured renderer paths without obscuring the algorithm. A small amount of duplication is preferable to a premature abstraction.
6. **Documentation with lifetimes.** Current truth, durable rationale, gotchas, and task state live in different systems so that none of them becomes a stale dump.

## Near-term goals

- Restore a reproducible lint, test, build, browser, and package baseline.
- Preserve and document the published `createApp`, `h`, `hFragment`, and `hString` surface.
- Define a normalized VNode contract and safe application lifecycle.
- Replace full-tree destroy/remount with an incremental DOM patcher that preserves node identity and focus.
- Introduce TypeScript only after behavioral tests protect the current runtime.
- Evaluate agent usability with repeatable tasks and a concrete rubric.

## Non-goals until the core is stable

- Competing with production React, Vue, or Svelte ecosystems.
- JSX/compiler transforms, SSR/hydration, routing, plugin systems, or a component marketplace.
- Signals, computed values, or scheduling APIs without an ADR and a measured need.
- Multiple packages before a second renderer or independently consumable boundary exists.
- Maximizing benchmark scores at the cost of clarity.

## Success measures

- A clean checkout has one documented setup path and one aggregate verification command.
- Every public behavior points to a contract and a behavioral test.
- Rendering changes include real browser evidence when DOM identity, events, attributes, or focus can change.
- A fresh agent can complete the benchmark tasks in [agent-evals.md](agent-evals.md) without hidden context, broad unrelated edits, or invariant violations.
- Architecture documents stay short because source layout and types carry most of the explanation.
