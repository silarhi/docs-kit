/**
 * SILARHI open-source packages with a documentation site.
 *
 * Feeds the hub (docs.silarhi.dev) and the "Other packages" footer of every site.
 * Each site lives at https://<slug>.silarhi.dev and is built from the `docs/` folder of github.com/silarhi/<slug>.
 * `headline` completes the home page title ("<name> – <headline>"): the words people search for, under 60 characters with the name.
 * `umami` is the ID of its own website on https://analytics.silarhi.fr (one per site, SILARHI team).
 */
export const packages = [
    {
        slug: 'llms-txt-bundle',
        name: 'LLMs.txt Bundle',
        headline: 'llms.txt generator for Symfony',
        description: 'Build, dump and serve an llms.txt file from your Symfony application.',
        composer: 'silarhi/llms-txt-bundle',
        published: true,
        umami: '063e932e-cd3a-4a7b-92c3-e333af5d6a6e',
    },
    {
        slug: 'picasso-bundle',
        name: 'Picasso Bundle',
        headline: 'Responsive images for Symfony (AVIF, WebP, srcset)',
        description: 'Responsive image component for Symfony, inspired by next/image.',
        composer: 'silarhi/picasso-bundle',
        published: true,
        umami: '3ada68cf-c4f7-42a7-8d79-251cb8e89a4b',
    },
    {
        slug: 'tabler-ux-components',
        name: 'Tabler UX Components',
        headline: 'Tabler Twig components for Symfony UX',
        description: 'Tabler-flavored Twig UX components for Symfony, following the shadcn composition pattern.',
        composer: 'silarhi/tabler-ux-components',
        published: true,
        umami: 'a0c2ddc5-2080-46cc-909b-bf4b30498b3d',
    },
    {
        slug: 'turbo-bundle',
        name: 'Turbo Bundle',
        headline: 'Hotwire Turbo helpers for Symfony',
        description:
            'Framework-agnostic Hotwire Turbo helpers: a lifecycle orchestrator for the browser and frame-redirect following for Symfony.',
        composer: 'silarhi/turbo-bundle',
        published: true,
        umami: 'cb89a9c9-04b5-48a3-801c-0b22fd3c2347',
    },
    {
        slug: 'cap-bundle',
        name: 'Cap Bundle',
        headline: 'trycap.dev CAPTCHA for Symfony forms',
        description:
            'Cap CAPTCHA (trycap.dev), the self-hosted proof-of-work reCAPTCHA alternative, in your Symfony forms.',
        composer: 'silarhi/cap-bundle',
        published: true,
        umami: '6a2d5575-d74b-414e-b960-e3829d8a499c',
    },
    {
        slug: 'ux-icons-js-bundle',
        name: 'UX Icons JS Bundle',
        headline: 'Symfony UX Icons in React, Vue and JavaScript',
        description: 'Render Symfony UX Icons in JavaScript, React and Vue, with the same attributes as ux_icon().',
        composer: 'silarhi/ux-icons-js-bundle',
        published: true,
        umami: 'a3a22a7e-ad74-4b8a-b4f7-c2e0939114d3',
    },
    {
        slug: 'cursor-pagination',
        name: 'Cursor Pagination',
        headline: 'Cursor pagination for Doctrine ORM',
        description: 'Doctrine ORM cursor-based pagination for faster batch operations.',
        composer: 'silarhi/cursor-pagination',
        published: true,
        umami: '54f10d23-99a1-4d5d-a5e0-0eb43bac4c83',
    },
    {
        slug: 'cfonb-parser',
        name: 'CFONB Parser',
        headline: 'PHP parser for CFONB 120 and 240 bank files',
        description: 'A zero-dependency PHP parser for CFONB bank transactions.',
        composer: 'silarhi/cfonb-parser',
        published: true,
        umami: 'f7334f53-8959-4809-b42b-943ece09dd1f',
    },
    {
        slug: 'caf-parser',
        name: 'CAF Parser',
        headline: 'PHP parser for CAF LA44ZZ payment files',
        description: 'A parser for CAF LA44ZZ files.',
        composer: 'silarhi/caf-parser',
        published: true,
        umami: '6780c193-9404-48f3-b6e1-500141ba50e5',
    },
    {
        slug: 'qif-library',
        name: 'QIF Library',
        headline: 'Read and write QIF files in PHP',
        description: 'Parse and write QIF (Quicken Interchange Format) files.',
        composer: 'silarhi/qif-library',
        published: true,
        umami: 'cb638e6e-dd91-4571-9ee4-da98061e226e',
    },
]

export const siteUrl = (slug) => `https://${slug}.silarhi.dev`

/** Registry entry of the site at `site`, found by its subdomain: `undefined` for the hub. */
export const packageOf = (site) => {
    const slug = new URL(site).hostname.split('.')[0]
    return packages.find((pkg) => pkg.slug === slug)
}
