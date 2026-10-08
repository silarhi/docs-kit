// Shipped as TypeScript on purpose: Vite never externalizes a .ts entry, so it bundles this preset and its
// TypeScript-only dependencies (starlight-llms-txt) when loading astro.config.mjs, instead of handing them to Node
import { copyFile, readFile } from 'node:fs/promises'
import starlight from '@astrojs/starlight'
import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroIntegration, AstroUserConfig } from 'astro'
import { defineConfig } from 'astro/config'
import starlightLlmsTxt from 'starlight-llms-txt'
import starlightVersions from 'starlight-versions'
import { siteUrl } from './packages.js'

const FAVICON = '/silarhi-favicon.png'
const faviconFile = new URL('./assets/favicon.png', import.meta.url)

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

export interface SilarhiThemeOptions {
    /** GitHub `owner/name`, used for the social link and "Edit page". */
    repo?: string
}

/**
 * Starlight plugin applying the SILARHI branding: logo, favicon, colors and footer.
 *
 * Every option set by the site wins over the preset.
 */
export function silarhiTheme({ repo }: SilarhiThemeOptions = {}): StarlightPlugin {
    return {
        name: '@silarhi/docs-kit',
        hooks: {
            'config:setup'({ config, updateConfig, addIntegration }) {
                addIntegration(favicon())

                updateConfig({
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
                        config.editLink ?? (repo ? { baseUrl: `https://github.com/${repo}/edit/main/docs/` } : {}),
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

/** Full Astro config of a SILARHI package documentation, published at https://<slug>.silarhi.dev. */
export function defineSilarhiDocs({
    slug,
    title,
    description,
    repo = `silarhi/${slug}`,
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
                    silarhiTheme({ repo }),
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
