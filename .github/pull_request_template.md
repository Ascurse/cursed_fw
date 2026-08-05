<!--
Keep the diff small and single-purpose. Unrelated edits, debug output, accidental public exports,
and regenerated `dist/` artifacts get a pull request sent back.
-->

## What changed

<!-- The observable behavior change, in one or two sentences. Not a file list. -->

## Why

<!-- The problem this solves. Link the issue if one exists. -->

## Verification

<!--
Paste the actual command you ran and its exit code.
-->

```
npm ci
npm run check   # exit 0
```

<!--
Rendering, events, attributes, focus, or lifecycle changed? A green test run does not prove browser
behavior. Describe the real browser scenario you exercised against `examples/` or a consumer fixture.
-->

## Checklist

- [ ] Behavior change has a test that failed first, for the right reason
- [ ] Browser-facing behavior was exercised in a real browser, not only jsdom
- [ ] Public exports in `packages/runtime/src/index.js` are unchanged, or the change is intentional and described above
- [ ] Contracts in `docs/contracts/` and architecture docs updated in this same diff if a recorded fact changed
- [ ] A journal entry was added only if the reason is durable and cannot be reconstructed from the code
- [ ] No temporary servers, caches, debug code, or regenerated `dist/` in the diff
