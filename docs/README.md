# Documentation map

This directory separates current system truth from historical rationale and active work. Read the smallest document set that answers the current task.

| Document | Purpose | Read when | Update when |
| --- | --- | --- | --- |
| [vision.md](vision.md) | Product direction, goals, non-goals, success measures | Choosing scope or evaluating a new feature | The framework's purpose or product constraints change |
| [architecture.md](architecture.md) | Current system, intended boundaries, dependency rules | Changing modules or data flow | A boundary, dependency, or public surface changes |
| [development.md](development.md) | Task workflow, TDD, verification, release discipline | Starting or finishing implementation | Commands or Definition of Done change |
| [contracts/](contracts/README.md) | Observable behavior and compatibility commitments | Changing runtime behavior | Consumer-visible behavior changes |
| [agent-evals.md](agent-evals.md) | Repeatable evaluation of AI-agent usability | Measuring or improving agent ergonomics | Evaluation scenarios or rubric change |
| [journal/decisions.md](journal/decisions.md) | Durable rationale that code cannot explain | Before non-trivial work | A durable architectural decision is made or superseded |
| [journal/gotchas.md](journal/gotchas.md) | Non-obvious traps already encountered | Before non-trivial work and before editing linked files | A new trap is confirmed or an old one is removed |
| [journal/glossary.md](journal/glossary.md) | Project terminology | A term is unfamiliar | A durable project term appears or disappears |

Active tasks, dependencies, priorities, and progress live in Beads. They are intentionally not duplicated here.

## Documentation rules

- Contracts describe observable behavior, not implementation hopes.
- Architecture distinguishes the current implementation from intended boundaries.
- Journal entries explain reasons or traps, not source code and not task history.
- A behavior change updates its test and contract in the same diff.
- Archive files are created only when the first useful historical entry is retired. Agents do not read archives during routine work.
