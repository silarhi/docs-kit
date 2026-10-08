/**
 * SILARHI open-source packages with a documentation site.
 *
 * Feeds the hub (docs.silarhi.dev) and the "Other packages" footer of every site.
 * Each site lives at https://<slug>.silarhi.dev and is built from the `docs/` folder of github.com/silarhi/<slug>.
 */
export const packages = [
    {
        slug: 'llms-txt-bundle',
        name: 'LLMs.txt Bundle',
        description: 'Build, dump and serve an llms.txt file from your Symfony application.',
        composer: 'silarhi/llms-txt-bundle',
        published: true,
    },
    {
        slug: 'picasso-bundle',
        name: 'Picasso Bundle',
        description: 'Responsive image component for Symfony, inspired by next/image.',
        composer: 'silarhi/picasso-bundle',
        published: false,
    },
    {
        slug: 'tabler-ux-components',
        name: 'Tabler UX Components',
        description: 'Tabler-flavored Twig UX components for Symfony, following the shadcn composition pattern.',
        composer: 'silarhi/tabler-ux-components',
        published: false,
    },
    {
        slug: 'cursor-pagination',
        name: 'Cursor Pagination',
        description: 'Doctrine ORM cursor-based pagination for faster batch operations.',
        composer: 'silarhi/cursor-pagination',
        published: false,
    },
    {
        slug: 'cfonb-parser',
        name: 'CFONB Parser',
        description: 'A zero-dependency PHP parser for CFONB bank transactions.',
        composer: 'silarhi/cfonb-parser',
        published: false,
    },
    {
        slug: 'caf-parser',
        name: 'CAF Parser',
        description: 'A parser for CAF LA44ZZ files.',
        composer: 'silarhi/caf-parser',
        published: false,
    },
    {
        slug: 'qif-library',
        name: 'QIF Library',
        description: 'Parse and write QIF (Quicken Interchange Format) files.',
        composer: 'silarhi/qif-library',
        published: false,
    },
]

export const siteUrl = (slug) => `https://${slug}.silarhi.dev`
