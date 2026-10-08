---
title: Getting started
description: Add a documentation site to a SILARHI package with the shared Starlight theme.
sidebar:
    order: 1
---

Every SILARHI package documents itself from a `docs/` folder, published on GitHub Pages at `https://<package>.silarhi.dev`.
The look, the footer, the favicon and the `llms.txt` come from [`@silarhi/docs-kit`](https://www.npmjs.com/package/@silarhi/docs-kit).

## Layout

```text
docs/
├── astro.config.mjs
├── package.json
├── yarn.lock
├── tsconfig.json
└── src/
    ├── content.config.ts
    └── content/docs/
        ├── index.mdx
        └── *.md
```

```ts
// docs/src/content.config.ts
export { collections } from '@silarhi/docs-kit/content'
```

The folder has its own `package.json`: the documentation tooling never mixes with the package one,
and `/docs export-ignore` in `.gitattributes` keeps it out of the Composer archive.

## Configuration

```js
// docs/astro.config.mjs
import { defineSilarhiDocs } from '@silarhi/docs-kit'

export default defineSilarhiDocs({
    slug: 'llms-txt-bundle', // GitHub repository and subdomain
    title: 'LLMs.txt Bundle',
    description: 'Build, dump and serve an llms.txt file from your Symfony application.',
    sidebar: [
        {
            label: 'Getting started',
            items: [{ autogenerate: { directory: 'getting-started' } }],
        },
    ],
})
```

`defineSilarhiDocs()` sets the `site` URL, adds Starlight with the SILARHI plugin and `starlight-llms-txt`.
Dark mode is Starlight's: dark by default, with a light / dark / auto picker in the header.
Any Starlight option can be passed through `starlight: {}`, any Astro one through `astro: {}`: they win over the preset.

### Starlight plugin only

A site that keeps its own Astro config can use the plugin alone:

```js
import starlight from '@astrojs/starlight'
import { silarhiTheme } from '@silarhi/docs-kit'

starlight({
    title: 'My package',
    plugins: [silarhiTheme({ repo: 'silarhi/my-package' })],
})
```
