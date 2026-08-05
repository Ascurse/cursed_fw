# Architecture

## Current system

The repository currently has one npm workspace package and one browser example.

```text
examples/ch02/TODO.js
        |
        v
packages/runtime/src/index.js
        |
        +-- app.js ---------- application state and dispatch lifecycle
        +-- dispatcher.js --- command subscriptions
        +-- h.js ------------ VNode creation
        +-- mount-dom.js ---- recursive DOM creation
        +-- destroy-dom.js -- recursive teardown
        +-- attributes.js --- DOM attributes, properties, class, style
        +-- events.js ------- DOM listener registration and removal
```

The public ESM boundary exports `createApp`, `h`, `hFragment`, and `hString`. A view receives `(state, emit)` and returns a VNode tree. A command dispatch runs a matching reducer, then the current implementation destroys and mounts the entire tree.

## Intended internal boundaries

The target is still one package. These are module boundaries, not a request to create packages immediately.

| Boundary | Responsibility | Must not own |
| --- | --- | --- |
| VNode model | Node kinds, normalization, child rules, public creation helpers | DOM APIs, application state, scheduling |
| DOM renderer | Mount, patch, and unmount VNodes; preserve node identity | Reducers, command names, application policy |
| DOM props | Attribute/property semantics, class/style updates, listener diffing | VNode creation or state transitions |
| Application runtime | State, reducers, dispatch, render scheduling, mount lifecycle | Direct element creation or attribute rules |
| Public API | Stable exports and consumer types | Internal helpers and experimental APIs |

When the source is reorganized, prefer focused directories such as `vdom/`, `renderer/`, `dom/`, and `app/`. Do not perform that move before characterization tests can prove the public behavior stayed intact.

## Runtime flow

```text
browser event
    -> emit(command, payload)
    -> dispatcher
    -> reducer(previousState, payload)
    -> nextState
    -> view(nextState, emit)
    -> next VNode tree
    -> renderer.patch(previousTree, nextTree, parent)
    -> minimal DOM operations
```

The final step is currently implemented as full teardown plus mount. Incremental patching is the intended replacement, but it is not yet a shipped contract.

## Dependency rules

- Application runtime may depend on the renderer and VNode model.
- Renderer may depend on the VNode model and DOM-props helpers.
- VNode model has no DOM or application dependency.
- DOM-props helpers have no application-state dependency.
- Consumers import only from the package public API.
- Same-level modules communicate through explicit functions and data, not shared mutable globals.

## Compatibility boundary

The npm package has already published the four-function API. Preserve names and observable semantics while internals change. A breaking change requires a decision entry, migration notes, consumer fixtures, and an explicit major-version plan.

Known defects and accidental implementation details are not compatibility promises. Contracts identify which behaviors are intentional.

## Architecture change protocol

For a change that moves a boundary or adds a subsystem:

1. Record the user-visible requirement and alternatives in the active Beads issue.
2. Add or update the relevant contract.
3. Write a short decision entry when the rationale will outlive the task.
4. Pin current observable behavior before refactoring.
5. Keep each commit independently testable and revertible.
