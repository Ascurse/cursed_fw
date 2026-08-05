# DOM renderer contract

## Responsibility

The DOM renderer translates VNode trees into DOM operations. It owns mount, patch, and unmount behavior plus DOM property and event reconciliation. It does not own reducers, application commands, or state policy.

## Mount and unmount

- Mount creates DOM nodes in VNode order and records only the references required for later patch or teardown.
- Unmount removes the rendered nodes and every event listener registered by the renderer.
- Cleanup is safe to call through the application lifecycle without removing unrelated handlers or DOM.
- Fragment teardown removes fragment children, not the parent container.

## Target patch behavior

`patchDOM(previousVNode, nextVNode, parentElement)` is the intended incremental boundary.

- Different node kinds or element tags replace the old node.
- Equal element identity reuses the DOM node.
- Text changes update the existing text node.
- Props, styles, and listeners are diffed and stale values are removed.
- Child insertions, removals, and reorders preserve unaffected DOM identity.
- Keyed children use stable keys; duplicate or invalid keys produce a defined error.

Patch behavior is a target until the incremental renderer tasks land. The current full teardown/remount behavior is an implementation limitation, not a compatibility requirement.

## Attributes and events

- DOM properties and HTML attributes use explicit semantics; arbitrary names are not blindly treated as interchangeable.
- `data-*` and `aria-*` values are represented as attributes.
- Boolean properties such as `disabled` use property semantics.
- Event handlers are declared under `props.on` using real DOM event names.
- Replacing or removing a listener detaches the exact previously registered function.

## Observable acceptance

Browser input focus, selection, value, event count, and DOM node identity are part of renderer acceptance when an update should preserve the existing element. Unit tests that only compare VNode objects cannot prove this contract.
