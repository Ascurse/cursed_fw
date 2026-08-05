# Performance and competitive evidence

## Purpose

`cursed_fw` does not claim to be universally better than React, Vue, Svelte, or every specialized runtime. Its target is narrower: a small browser-first runtime with predictable DOM behavior, competitive measured performance, and a lower cost of safe change for humans and AI agents.

This document defines what counts as evidence. Raw results and current task status do not live here; every result belongs to a versioned artifact tied to a commit and environment.

## Evidence hierarchy

| Layer | Question | Primary evidence |
| --- | --- | --- |
| Correctness | Did every implementation produce the same observable UI? | DOM, identity, focus, selection, event-count, and cleanup assertions |
| Update performance | How quickly does existing UI react to state and input? | CPU duration, p95 latency, long tasks, DOM operations |
| Delivery performance | What must the browser download and execute? | minified Brotli bytes, parse/compile/eval, main-thread work, cold startup |
| Resource use | Does the runtime retain unnecessary work or objects? | heap after GC, ready/run memory, detached nodes, retained listeners |
| Changeability | How costly is a correct framework change? | agent and human task success, time, context, diff locality, review corrections |
| Portability | How much toolchain or host coupling exists? | direct browser ESM and package-manager/runtime compatibility fixtures |

Correctness is a prerequisite, not another weighted score. A fast implementation that loses focus, changes the wrong node, fires an event twice, or leaks a listener is invalid and receives no performance result.

## Benchmark layers

### 1. Standard framework benchmark

Maintain a conforming keyed implementation for [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark). Use its native protocol for create, replace, partial update, select, swap, remove, append, clear, memory, startup, script bootup, main-thread work, and transferred bytes.

This layer provides external comparability. Do not customize the workload, remove required behavior, compare keyed with non-keyed implementations, or add benchmark-only public APIs.

### 2. Product workloads

Build equivalent production-mode applications in `cursed_fw`, React, Vue, and Svelte:

1. Editable todo list: add, edit, filter, remove, and preserve focus/selection.
2. Keyed table: create 1,000/10,000 rows, update subsets, reorder, append, and clear.
3. Form: controlled input, validation, disabled submit, and repeated interaction.
4. Dashboard: independent partial updates at different frequencies.
5. Lifecycle stress: repeated mount, update, and unmount followed by GC inspection.
6. Update storm: bounded high-frequency input while recording interaction latency and long tasks.

The fixture data, resulting DOM semantics, interaction script, production mode, and browser profile must be equivalent. Framework-specific idioms are allowed only when they preserve the same observable contract.

### 3. Package and startup

Measure the actual consumer artifact rather than a source estimate:

- runtime and reference-app bytes after minification and Brotli compression;
- package tarball contents and production dependency count;
- browser script parse/compile/eval and main-thread work;
- cold and warm startup as separate results;
- direct ESM import and bundled consumer startup.

### 4. Changeability evaluations

Use the protocol in [agent-evals.md](agent-evals.md) against equivalent repositories and task prompts. Performance of an AI agent is not inferred from documentation size or code style; it is measured through accepted outcomes.

For humans, use the same small comprehension and change tasks when participants are available. Record time to locate the responsible boundary, time to accepted change, incorrect assumptions, review corrections, and confidence. Do not treat a one-person anecdote as a comparative result.

## Correctness oracle

Every timed workload first runs untimed assertions for:

- text, attributes, properties, class, style, and child order;
- stable identity of unaffected keyed nodes;
- focus, selection, and user-entered input state;
- exact event-call counts and current handler behavior;
- idempotent teardown and absence of retained listeners or detached DOM nodes;
- identical final application state and accessible DOM semantics.

Timing and correctness use the same production build. A separate simplified benchmark implementation is not valid evidence for the shipped package.

## Reproducibility and statistics

Each result records:

- repository commit and dirty-state status;
- framework/package versions and lockfiles;
- OS, hardware, browser, browser flags, Node/package-manager versions;
- build mode, fixture version, warmup policy, throttling, and GC policy;
- every raw sample, excluded sample, and documented exclusion reason.

The product suite uses at least 20 measured repetitions after declared warmups and reports median, p95, spread, and a 95% confidence interval. Cold-start samples run in isolated browser contexts. The standard benchmark keeps its upstream protocol. A regression gate requires a repeated statistically credible change, not one faster or slower sample.

Weights, comparison groups, and budgets are fixed before viewing a new result. Publish raw data and failures alongside summaries; do not report only favorable operations or combine incompatible environments.

## Candidate budgets

These are hypotheses for the first baseline, not release promises or active gates:

- core browser runtime at or below 5 KiB Brotli with zero production dependencies;
- standard CPU geometric mean no more than 25% slower than the fastest pinned React/Vue/Svelte comparator;
- no core standard operation more than 2x slower than the comparator median;
- ready and lifecycle memory no more than 20% above the smallest mainstream comparator, with zero retained detached nodes after the defined cleanup scenario;
- no accepted product workload introduces a task longer than 50 ms under the pinned reference profile;
- at least 90% first-pass agent-eval acceptance, with no zero in contract safety, test quality, or verification;
- at least 25% lower median agent context/token cost than the best comparator without reducing acceptance quality.

The baseline task must retain, revise, or reject each number with evidence. Once ratified, budgets move into an executable configuration used by CI; prose remains explanatory.

## Runtime and distribution portability

The shipped runtime targets browsers, not Node:

- publish standards-based ESM;
- do not import Node, Bun, or Deno APIs from browser runtime code;
- support direct browser module consumption in addition to bundlers;
- keep Node Active LTS plus npm as the canonical development, CI, and publishing path;
- test pnpm, Bun, and Deno as compatibility lanes without making their runtime-specific APIs part of the package contract;
- consider JSR as an additional TypeScript-oriented registry only after the npm package and types are stable.

An alternative tool may become canonical only after a recorded decision compares compatibility, install/test time, reproducibility, agent familiarity, CI availability, and migration cost using this repository.

## Reporting claims

Every public comparison states the pinned versions, commit, environment, scenario, sample count, statistic, correctness status, and known limitations. Prefer scoped statements such as “uses fewer transferred bytes in the todo fixture” over “faster than React.”

Benchmark improvements that make the core execution model harder to explain require an architecture decision and changeability re-evaluation. Readable performance is the product constraint; benchmark rank alone is not.
