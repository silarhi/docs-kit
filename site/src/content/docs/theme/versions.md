---
title: Versions
description: Keep the documentation of older major versions online next to the current one.
sidebar:
    order: 3
---

Versions come from [starlight-versions](https://starlight-versions.vercel.app): the default branch holds the current
documentation, and frozen snapshots of the older majors, served under `/<version>/` with a version picker and an
"outdated version" banner. GitHub Pages only ever deploys the default branch.

## Archiving a version

Before documenting a new major, archive the current pages as the previous one:

```js
// docs/astro.config.mjs
export default defineSilarhiDocs({
    slug: 'picasso-bundle',
    title: 'Picasso Bundle',
    currentVersion: 'v2',
    versions: [{ slug: '1.x', label: 'v1' }], // newest first
    // ...
})
```

Then run `yarn dev` or `yarn build` once in `docs/`: the pages are copied to `src/content/docs/1.x/` and the sidebar
to `src/content/versions/1.x.json`. Commit both, then update the current pages for the new major.

:::note
A snapshot is plain Markdown: fix a typo of an older version by editing its file under `src/content/docs/<version>/`.
:::

## Branch-per-major repositories

Repositories with one branch per major (`cfonb-parser`: `2.x` … `6.x`) document every version from the default branch:
the `docs.yml` workflow lists that branch in `push.branches`, and the other branches never deploy.
