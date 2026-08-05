# Public API contract

## Package surface

The package exports exactly these consumer-facing functions from `packages/runtime/src/index.js`:

- `createApp(options)`
- `h(tag, props?, children?)`
- `hFragment(children)`
- `hString(text)`

Internal renderer, dispatcher, attribute, and event helpers are not public API.

## `createApp`

`createApp({ state, view, reducers })` creates an isolated application instance.

- `state` is the instance's initial state.
- `view(state, emit)` returns the root VNode.
- `reducers` maps command names to `(previousState, payload) => nextState` functions.
- `emit(commandName, payload)` belongs to the application instance and is passed to the view.
- `mount(parentElement)` renders into the supplied parent.
- `unmount()` tears down the instance's rendered DOM and subscriptions.

Reducers are treated as state transitions: they return the next state and do not perform DOM work. Separate application instances must not share dispatcher or render state implicitly.

## Compatibility

The four export names and the `createApp` option shape are compatibility commitments. Making lifecycle cleanup idempotent, preventing accidental rerenders, or replacing full remount with DOM patching are compatible improvements when consumer-visible intended behavior is preserved.

## Current limitations

- Lifecycle methods do not yet have complete behavioral coverage.
- The current implementation rerenders after every dispatched command and replaces the entire DOM tree.
- Invalid option shapes and view results do not yet have a defined error contract.

These limitations are not promises. Tasks that define their replacement must add tests and update this contract.
