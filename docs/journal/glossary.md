# Glossary

Current project terminology. Remove terms that no longer describe the system.

## Framework terms

- **VNode** — plain data describing an element, text node, or fragment before DOM reconciliation. Defined by [the VNode contract](../contracts/vnode.md).
- **Application runtime** — the state, reducer, dispatch, scheduling, mount, and unmount boundary exposed through `createApp`.
- **DOM renderer** — the subsystem that mounts, patches, and unmounts VNode trees without owning application policy.
- **Patch** — reconciliation from a previous VNode tree to a next tree using minimal DOM operations.
- **Public contract** — observable package behavior that must be preserved or migrated explicitly.

## Documentation terms

- **Living document** — current system truth that must change in the same diff as the code fact it describes.
- **Journal** — compact durable rationale and gotchas that cannot be reconstructed cheaply from current code; it never stores task status.
- **Agent evaluation** — a repeatable task run by a fresh agent to measure context retrieval, locality, contract safety, evidence, and readability.
- **Measurement contract** — the correctness, workload, statistics, metadata, and reporting rules that make comparative results valid. Defined in [performance.md](../performance.md).
- **Compatibility lane** — a non-canonical runtime or package-manager consumer check that proves portability without changing the shipped API.
- **Correctness oracle** — untimed assertions that an implementation must pass before its timing or memory result is accepted.
