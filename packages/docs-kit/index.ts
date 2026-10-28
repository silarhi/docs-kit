// Shipped as TypeScript on purpose: Vite never externalizes a .ts entry, so it bundles this preset and its
// TypeScript-only dependencies (starlight-llms-txt) when loading astro.config.mjs, instead of handing them to Node
import { access, copyFile, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import starlight from '@astrojs/starlight'
import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroIntegration, AstroUserConfig } from 'astro'
import { defineConfig } from 'astro/config'
import starlightLlmsTxt from 'starlight-llms-txt'
import starlightVersions from 'starlight-versions'
import { packages, siteUrl } from './packages.js'

const FAVICON = '/silarhi-favicon.png'
// The tracker host of the silarhi.dev sites: it serves the script and its endpoint only (the dashboard stays on
// analytics.silarhi.fr), and being a subdomain of the site, it is not blocked as a third-party analytics host
const UMAMI_SCRIPT = 'https://analytics.silarhi.dev/script.js'
const faviconFile = new URL('./assets/favicon.png', import.meta.url)
const trackSearchFile = new URL('./scripts/track-search.js', import.meta.url)
const logoFile = new URL('./assets/logo.png', import.meta.url)
const OG_MODULE = 'virtual:silarhi-docs-kit/og'
// Resolved from this package (`import` condition, the ES module of satori): a site does not depend on them, so with
// pnpm it cannot find them from its own build
const ogDependencies: Record<string, string> = Object.fromEntries(
    ['satori', '@resvg/resvg-js'].map((name) => [name, fileURLToPath(import.meta.resolve(name))])
)

/**
 * Serves the SILARHI favicon at a public path: Starlight's `favicon` option only accepts files of `public/`,
 * which a package cannot ship.
 */
const favicon = (): AstroIntegration => ({
    name: '@silarhi/docs-kit/favicon',
    hooks: {
        'astro:server:setup': ({ server }) => {
            server.middlewares.use(FAVICON, async (_req, res) => {
                res.setHeader('Content-Type', 'image/png')
                res.end(await readFile(faviconFile))
            })
        },
        'astro:build:done': async ({ dir }) => {
            await copyFile(faviconFile, new URL(`.${FAVICON}`, dir))
        },
    },
})

/**
 * Serves a social image per page (`/og/<page>.png`) and writes a `robots.txt` pointing to the sitemap,
 * unless the site ships its own in `public/`.
 *
 * The image route gets the logo path and the site title from a virtual module: once bundled, it can no longer
 * find the logo from its own `import.meta.url`.
 */
const seo = (siteTitle: string): AstroIntegration => {
    let site: string | undefined

    return {
        name: '@silarhi/docs-kit/seo',
        hooks: {
            'astro:config:setup': ({ injectRoute, updateConfig }) => {
                const resolved = `\0${OG_MODULE}`
                updateConfig({
                    vite: {
                        plugins: [
                            {
                                name: OG_MODULE,
                                enforce: 'pre',
                                resolveId: (id) => {
                                    if (id === OG_MODULE) {
                                        return resolved
                                    }
                                    // Kept out of the bundle: resvg is a native module, which Vite cannot bundle
                                    return id in ogDependencies ? { id: ogDependencies[id], external: true } : undefined
                                },
                                load: (id) =>
                                    id === resolved
                                        ? `export const logo = ${JSON.stringify(fileURLToPath(logoFile))}\nexport const siteTitle = ${JSON.stringify(siteTitle)}`
                                        : undefined,
                            },
                        ],
                    },
                })
                injectRoute({ pattern: '/og/[...route]', entrypoint: new URL('./og-image.ts', import.meta.url) })
            },
            'astro:config:done': ({ config }) => {
                site = config.site
            },
            'astro:build:done': async ({ dir }) => {
                const robots = new URL('./robots.txt', dir)
                const exists = await access(robots).then(
                    () => true,
                    () => false
                )
                if (!exists && site) {
                    await writeFile(
                        robots,
                        `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site)}\n`
                    )
                }
            },
        },
    }
}

export interface SilarhiThemeOptions {
    /** GitHub `owner/name`, used for the social link and "Edit page". */
    repo?: string
    /** Branch the "Edit page" links point to: the default branch of the repository, e.g. `6.x`. */
    branch?: string
    /** ID of the site's own website on https://analytics.silarhi.fr: no tracking without it. */
    umami?: string
}

/**
 * Starlight plugin applying the SILARHI branding: logo, favicon, colors and footer.
 *
 * Every option set by the site wins over the preset.
 */
export function silarhiTheme({ repo, branch = 'main', umami }: SilarhiThemeOptions = {}): StarlightPlugin {
    return {
        name: '@silarhi/docs-kit',
        hooks: {
            async 'config:setup'({ config, astroConfig, updateConfig, addIntegration, addRouteMiddleware }) {
                addIntegration(favicon())
                addIntegration(seo(typeof config.title === 'string' ? config.title : Object.values(config.title)[0]))
                addRouteMiddleware({ entrypoint: '@silarhi/docs-kit/route-middleware' })

                // `data-domains` keeps `astro dev` and `astro preview` out of the stats: the tracker only runs on the site host
                const tracking = umami
                    ? [
                          {
                              tag: 'script' as const,
                              attrs: {
                                  defer: true,
                                  src: UMAMI_SCRIPT,
                                  'data-website-id': umami,
                                  ...(astroConfig.site ? { 'data-domains': new URL(astroConfig.site).hostname } : {}),
                              },
                          },
                          { tag: 'script' as const, content: await readFile(trackSearchFile, 'utf8') },
                      ]
                    : []

                updateConfig({
                    head: [...(config.head ?? []), ...tracking],
                    logo: config.logo ?? { src: '@silarhi/docs-kit/assets/logo.png' },
                    favicon: config.favicon ?? FAVICON,
                    customCss: ['@silarhi/docs-kit/styles/theme.css', ...(config.customCss ?? [])],
                    components: {
                        Footer: '@silarhi/docs-kit/components/Footer.astro',
                        ...config.components,
                    },
                    social:
                        config.social ??
                        (repo ? [{ icon: 'github', label: 'GitHub', href: `https://github.com/${repo}` }] : []),
                    editLink:
                        config.editLink ?? (repo ? { baseUrl: `https://github.com/${repo}/edit/${branch}/docs/` } : {}),
                    lastUpdated: config.lastUpdated ?? true,
                    credits: config.credits ?? false,
                })
            },
        },
    }
}

export interface SilarhiDocsOptions extends SilarhiThemeOptions {
    /** Package slug: the GitHub repository name and the subdomain of silarhi.dev. */
    slug: string
    title: string
    /** Meta description and llms.txt summary. */
    description?: string
    sidebar?: StarlightUserConfig['sidebar']
    /**
     * Archived versions, newest first, e.g. `[{ slug: '1.x', label: 'v1' }]`: adding one snapshots the current pages
     * into `src/content/docs/<slug>/` on the next `astro dev` or `astro build`, to commit.
     */
    versions?: { slug: string; label?: string }[]
    /** Label of the current version in the version picker, e.g. `v2`. */
    currentVersion?: string
    /** Extra Starlight options, winning over the preset. */
    starlight?: Partial<StarlightUserConfig>
    /** Extra Astro options, winning over the preset. */
    astro?: AstroUserConfig
}

/**
 * Full Astro config of a SILARHI package documentation, published at https://<slug>.silarhi.dev.
 *
 * The Umami website comes from the package registry (`packages.js`) unless `umami` is set.
 */
export function defineSilarhiDocs({
    slug,
    title,
    description,
    repo = `silarhi/${slug}`,
    branch,
    umami = packages.find((pkg) => pkg.slug === slug)?.umami,
    sidebar,
    versions = [],
    currentVersion,
    starlight: extra = {},
    astro = {},
}: SilarhiDocsOptions) {
    return defineConfig({
        site: siteUrl(slug),
        ...astro,
        integrations: [
            starlight({
                title,
                description,
                sidebar,
                ...extra,
                plugins: [
                    silarhiTheme({ repo, branch, umami }),
                    // starlight-versions refuses an empty list: a single-version site has no picker
                    ...(versions.length > 0
                        ? [
                              starlightVersions({
                                  versions,
                                  current: currentVersion ? { label: currentVersion } : undefined,
                              }),
                          ]
                        : []),
                    starlightLlmsTxt(),
                    ...(extra.plugins ?? []),
                ],
            }),
            ...(astro.integrations ?? []),
        ],
    })
}
