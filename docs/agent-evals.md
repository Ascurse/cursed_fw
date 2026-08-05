# Agent usability evaluations

## Purpose

AI-agent convenience is a quality attribute, not a claim inferred from the presence of `AGENTS.md`. These evaluations measure whether a fresh agent can discover the right context, make a local change, and prove it without violating project boundaries.

They are not the product backlog. Each evaluation runs in a disposable branch or worktree against a known commit and records evidence without merging the probe.

## Evaluation protocol

1. Start a fresh agent with only the repository and one task prompt.
2. Record the base commit, model/tooling identity, prompt, files read, commands run, final diff, and test output.
3. Do not provide undocumented hints after the run starts.
4. Stop when the task is complete or the agent declares a concrete blocker.
5. Review the result against the rubric below; discard the probe branch afterward.

Comparative runs pin the repository commit, framework version, model and tool versions, permission set, task prompt, timeout, and starting context. Run each scenario at least five times per framework/model pair; report individual outcomes, median, p95 where meaningful, and failure causes rather than only the best run.

## Quantitative metrics

- first-pass acceptance and final acceptance rate;
- elapsed time and time to the first valid failing proof;
- input/output tokens or the nearest available context-cost measure;
- tool calls, files read, and production modules changed;
- framework APIs invented or used incorrectly;
- boundary violations, unrelated edits, and public-contract regressions;
- review corrections and explicit human interventions;
- verification surfaces completed with successful exit evidence.

Lower time, context, or diff size never compensates for failed acceptance. Prompts describe observable outcomes and constraints, not file paths or framework-specific solutions. Equivalent React, Vue, Svelte, and `cursed_fw` tasks must have the same behavioral oracle even when idiomatic implementations differ.

## Initial scenarios

### E1 — Locate and explain the application lifecycle

Prompt: “Explain how a browser event changes state and reaches the DOM. Name the public contract and the smallest module boundary that should change if rerender scheduling changes. Do not edit files.”

Expected evidence: the agent reads the documentation map, public API contract, architecture, `app.js`, and `dispatcher.js`; it does not propose changing VNode normalization or DOM props.

### E2 — Make unmount cleanup idempotent

Prompt: “Make repeated application unmount safe without changing the public API. Use TDD and prove that unrelated subscriptions are retained.”

Expected evidence: a focused lifecycle/dispatcher test fails first; the implementation touches only the application/dispatcher boundary and its tests; the public contract is updated only if a new guarantee is established.

### E3 — Add finite numeric children

Prompt: “Allow finite numeric VNode children to render as text while keeping empty child semantics explicit. Use TDD.”

Expected evidence: the agent finds the VNode contract, changes normalization rather than the DOM renderer, tests `0`, negative numbers, `NaN`/infinity policy, and preserves child order.

### E4 — Correct ARIA and boolean prop handling

Prompt: “Make `aria-*` values observable as attributes and preserve boolean DOM property behavior. Do not introduce a generic compatibility layer.”

Expected evidence: the agent works inside DOM-props helpers, adds DOM integration tests, and does not change application state or public exports.

### E5 — Add keyed child reordering

Prompt: “Implement keyed list reordering while preserving unaffected DOM node identity and event handlers.”

Expected evidence: the agent identifies this scenario as gated on the incremental renderer, reads the renderer contract, uses identity assertions and a real browser case, and rejects index-as-key behavior.

## Rubric

Score each dimension from 0 to 2:

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Context retrieval | Misses canonical docs or contract | Finds them after broad exploration | Starts from the map and reads only relevant material |
| Change locality | Broad or cross-boundary diff | Some unnecessary files | Smallest responsible boundary plus tests/docs |
| Contract safety | Breaks or ignores public behavior | Preserves behavior accidentally | Names and proves the affected contract |
| Test quality | No meaningful RED or tautological test | Partial behavioral coverage | Failing-first proof at the cheapest faithful surface |
| Verification | Inference-only claim | Unit evidence only | Required unit, browser, build, or package evidence |
| Human readability | Clever or under-explained implementation | Understandable with effort | Intentional names, explicit flow, minimal necessary rationale |

A run passes with at least 10/12 and no zero in contract safety, test quality, or verification. Record qualitative failure causes; do not optimize only for the numeric score.

The first comparative baseline evaluates candidate goals from [performance.md](performance.md). A claimed advantage requires repeated accepted runs and published metadata; a single successful agent or one model is exploratory evidence only.

## Feedback loop

When multiple agents fail the same way, fix the smallest root cause: a module boundary, type, contract, command, error message, or documentation route. Do not add prompt text when executable structure can remove the ambiguity.
