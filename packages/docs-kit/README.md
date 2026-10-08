# @silarhi/docs-kit

Shared [Starlight](https://starlight.astro.build) preset for the documentation of the SILARHI open-source packages:
branding (logo, favicon, colors, Montserrat headings), footer linking the other packages, "Edit page" links,
and an `llms.txt` through [starlight-llms-txt](https://github.com/delucis/starlight-llms-txt).

```bash
yarn add @silarhi/docs-kit @astrojs/starlight astro
```

```js
// astro.config.mjs
import { defineSilarhiDocs } from '@silarhi/docs-kit'

export default defineSilarhiDocs({
    slug: 'my-package', // github.com/silarhi/my-package, published at https://my-package.silarhi.dev
    title: 'My Package',
    description: 'What it does, in one sentence.',
    sidebar: [{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] }],
})
```

Or the Starlight plugin alone: `plugins: [silarhiTheme({ repo: 'silarhi/my-package' })]`.

Full guide: https://docs.silarhi.dev/theme/getting-started/

## License

MIT
