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

## Characterized behavior

These guarantees are pinned by [packages/runtime/src/\_\_tests\_\_/public-api.test.js](../../packages/runtime/src/__tests__/public-api.test.js), which imports only the package entry. Each assertion was proven to fail when its own seam is broken, so none of them passes vacuously.

- The package exports exactly the four names above and nothing else.
- `mount(parentElement)` renders the initial state into the supplied parent.
- A command emitted from the view runs the matching reducer and re-renders with the resulting state.
- A reducer receives the previous state and the emitted payload, in that order.
- Two application instances are isolated: a command emitted by one does not re-render the other.
- `unmount()` removes the instance's rendered DOM from its parent.

## Compatibility

The four export names and the `createApp` option shape are compatibility commitments. Making lifecycle cleanup idempotent, preventing accidental rerenders, or replacing full remount with DOM patching are compatible improvements when consumer-visible intended behavior is preserved.

## Current limitations

- `unmount()` is not idempotent: a second call throws because the destroy path dereferences a cleared VNode.
- The current implementation rerenders after every dispatched command and replaces the entire DOM tree, which discards focus and DOM identity.
- Invalid option shapes and view results do not yet have a defined error contract.
- Emitting a command with no matching reducer only warns on the console.

These limitations are not promises. Tasks that define their replacement must add tests and update this contract.
