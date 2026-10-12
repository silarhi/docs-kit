import { defineSilarhiDocs } from '@silarhi/docs-kit'

export default defineSilarhiDocs({
    slug: 'docs',
    repo: 'silarhi/docs-kit',
    // The hub is not in the package registry
    umami: '8fba8909-1bbd-41eb-93d2-0bad6998bf21',
    title: 'SILARHI Open Source',
    description: 'Documentation of the open-source PHP libraries and Symfony bundles maintained by SILARHI.',
    sidebar: [
        { label: 'Packages', link: '/' },
        { label: 'Documentation theme', items: [{ autogenerate: { directory: 'theme' } }] },
    ],
})
