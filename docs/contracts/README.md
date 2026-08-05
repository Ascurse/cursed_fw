# Runtime contracts

Contracts describe observable behavior that consumers or adjacent modules may rely on. They are narrower than the vision and more stable than implementation details.

## Files

- [public-api.md](public-api.md) — package exports and application lifecycle.
- [vnode.md](vnode.md) — VNode kinds and child normalization.
- [dom-renderer.md](dom-renderer.md) — DOM mount, patch, teardown, props, and events.

## Status language

- **Contract:** intentional behavior to preserve or migrate explicitly.
- **Current limitation:** observed behavior that is not a promise and may be fixed compatibly.
- **Target:** approved direction that is not implemented yet.

Tests are the executable form of these contracts. If prose and a passing behavioral test disagree, stop the task and resolve the contradiction instead of silently choosing one.
