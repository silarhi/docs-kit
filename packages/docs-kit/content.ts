import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { docsVersionsLoader } from 'starlight-versions/loader'

/**
 * Content collections of a SILARHI documentation site, re-exported from its `src/content.config.ts`:
 *
 *     export { collections } from '@silarhi/docs-kit/content'
 *
 * `versions` holds the sidebars of the archived versions (starlight-versions), and stays empty until the first one.
 */
export const collections = {
    docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
    versions: defineCollection({ loader: docsVersionsLoader() }),
}
