/**
 * SILARHI open-source packages with a documentation site.
 *
 * Feeds the hub (docs.silarhi.dev) and the "Other packages" footer of every site.
 * Each site lives at https://<slug>.silarhi.dev and is built from the `docs/` folder of github.com/silarhi/<slug>.
 * `umami` is the ID of its own website on https://analytics.silarhi.fr (one per site, SILARHI team).
 */
export const packages = [
    {
        slug: 'llms-txt-bundle',
        name: 'LLMs.txt Bundle',
        description: 'Build, dump and serve an llms.txt file from your Symfony application.',
        composer: 'silarhi/llms-txt-bundle',
        published: true,
        umami: '063e932e-cd3a-4a7b-92c3-e333af5d6a6e',
    },
    {
        slug: 'picasso-bundle',
        name: 'Picasso Bundle',
        description: 'Responsive image component for Symfony, inspired by next/image.',
        composer: 'silarhi/picasso-bundle',
        published: true,
        umami: '3ada68cf-c4f7-42a7-8d79-251cb8e89a4b',
    },
    {
        slug: 'tabler-ux-components',
        name: 'Tabler UX Components',
        description: 'Tabler-flavored Twig UX components for Symfony, following the shadcn composition pattern.',
        composer: 'silarhi/tabler-ux-components',
        published: true,
        umami: 'a0c2ddc5-2080-46cc-909b-bf4b30498b3d',
    },
    {
        slug: 'turbo-bundle',
        name: 'Turbo Bundle',
        description:
            'Framework-agnostic Hotwire Turbo helpers: a lifecycle orchestrator for the browser and frame-redirect following for Symfony.',
        composer: 'silarhi/turbo-bundle',
        published: true,
        umami: 'cb89a9c9-04b5-48a3-801c-0b22fd3c2347',
    },
    {
        slug: 'ux-icons-js-bundle',
        name: 'UX Icons JS Bundle',
        description: 'Render Symfony UX Icons in JavaScript, React and Vue, with the same attributes as ux_icon().',
        composer: 'silarhi/ux-icons-js-bundle',
        published: true,
        umami: 'a3a22a7e-ad74-4b8a-b4f7-c2e0939114d3',
    },
    {
        slug: 'cursor-pagination',
        name: 'Cursor Pagination',
        description: 'Doctrine ORM cursor-based pagination for faster batch operations.',
        composer: 'silarhi/cursor-pagination',
        published: true,
        umami: '54f10d23-99a1-4d5d-a5e0-0eb43bac4c83',
    },
    {
        slug: 'cfonb-parser',
        name: 'CFONB Parser',
        description: 'A zero-dependency PHP parser for CFONB bank transactions.',
        composer: 'silarhi/cfonb-parser',
        published: true,
        umami: 'f7334f53-8959-4809-b42b-943ece09dd1f',
    },
    {
        slug: 'caf-parser',
        name: 'CAF Parser',
        description: 'A parser for CAF LA44ZZ files.',
        composer: 'silarhi/caf-parser',
        published: true,
        umami: '6780c193-9404-48f3-b6e1-500141ba50e5',
    },
    {
        slug: 'qif-library',
        name: 'QIF Library',
        description: 'Parse and write QIF (Quicken Interchange Format) files.',
        composer: 'silarhi/qif-library',
        published: true,
        umami: 'cb638e6e-dd91-4571-9ee4-da98061e226e',
    },
]

export const siteUrl = (slug) => `https://${slug}.silarhi.dev`
