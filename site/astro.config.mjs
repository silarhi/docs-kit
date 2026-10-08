import { defineSilarhiDocs } from '@silarhi/docs-kit'

export default defineSilarhiDocs({
    slug: 'docs',
    repo: 'silarhi/docs-kit',
    title: 'SILARHI Open Source',
    description: 'Documentation of the open-source PHP libraries and Symfony bundles maintained by SILARHI.',
    sidebar: [
        { label: 'Packages', link: '/' },
        { label: 'Documentation theme', items: [{ autogenerate: { directory: 'theme' } }] },
    ],
})
