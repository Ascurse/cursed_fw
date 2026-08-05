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
