# VNode contract

## Node kinds

The runtime currently represents three node kinds as plain objects:

- Element: tag, props, children, and type `element`.
- Text: value and type `text`.
- Fragment: children and type `fragment`.

VNode objects are framework data. Consumers may construct them through the public helpers, while renderer-owned fields such as DOM element references and listener records remain internal.

## Public creation helpers

- `h(tag, props = {}, children = [])` creates an element VNode.
- `hString(text)` creates a text VNode.
- `hFragment(children)` creates a fragment VNode.

## Contract direction

Child normalization must become a pure, deterministic operation with one documented input domain. The intended domain is VNodes, strings, finite numbers, nested arrays, and empty values (`null`, `undefined`, and booleans). Strings and numbers become text nodes; nested arrays flatten in order; empty values do not create DOM nodes.

That expanded domain is a target until implemented by a dedicated issue. Current consumers should use strings or VNodes and should not depend on the behavior of unsupported child values.

## Invariants

- Normalization does not access the DOM or application state.
- Input order is preserved.
- A renderer can distinguish node kinds without inspecting unrelated fields.
- Renderer-owned fields are not part of VNode equality or the public contract.
- Invalid values fail through a defined error contract rather than an incidental property access.
