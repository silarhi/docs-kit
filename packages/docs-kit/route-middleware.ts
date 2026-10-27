// SEO tags Starlight leaves out: a home title that says what the package does, a social image and structured data
import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'
import { packageOf } from './packages.js'
import { OG_IMAGE_SIZE, ogImagePath } from './seo.ts'

type HeadEntry = StarlightRouteData['head'][number]

// The organization silarhi.fr describes in its own JSON-LD, referenced by its `@id`
const SILARHI = {
    '@type': 'Organization',
    '@id': 'https://silarhi.fr/#organization',
    name: 'SILARHI',
    url: 'https://silarhi.fr',
}

/** Replaces the `<meta>` with the same `property` or `name`, or adds it. */
const setMeta = (head: HeadEntry[], key: 'property' | 'name', value: string, content: string) => {
    const index = head.findIndex(({ tag, attrs }) => tag === 'meta' && attrs?.[key] === value)
    const entry: HeadEntry = { tag: 'meta', attrs: { [key]: value, content } }
    if (index === -1) {
        head.push(entry)
    } else {
        head[index] = entry
    }
}

export const onRequest = defineRouteMiddleware((context) => {
    const route = context.locals.starlightRoute
    const { site } = context
    // The 404 page is not a docs entry: it has no social image to point to
    if (!site || route.entry.id === '404') {
        return
    }

    const { head, entry, siteTitle } = route
    const { data } = entry
    const isHome = entry.id === ''
    const pkg = packageOf(site)
    const home = new URL('/', site).href
    const url = head.find(({ tag, attrs }) => tag === 'link' && attrs?.rel === 'canonical')?.attrs?.href ?? home
    const description = data.description

    // Starlight titles the home "<page> | <site>", i.e. the package name twice: the headline replaces the repeat.
    // A `head` title set in the frontmatter still wins.
    if (isHome && !data.head.some(({ tag }) => tag === 'title')) {
        const title = head.find(({ tag }) => tag === 'title')
        if (title) {
            title.content = pkg?.headline ? `${siteTitle} – ${pkg.headline}` : siteTitle
        }
    }

    const image = new URL(ogImagePath(entry.id), site).href
    setMeta(head, 'property', 'og:type', isHome ? 'website' : 'article')
    setMeta(head, 'property', 'og:image', image)
    setMeta(head, 'property', 'og:image:width', String(OG_IMAGE_SIZE.width))
    setMeta(head, 'property', 'og:image:height', String(OG_IMAGE_SIZE.height))
    setMeta(head, 'property', 'og:image:alt', isHome ? siteTitle : `${data.title} – ${siteTitle}`)

    const website = { '@type': 'WebSite', '@id': `${home}#website`, url: home, name: siteTitle, publisher: SILARHI }
    const graph: Record<string, unknown>[] = isHome
        ? [
              { ...website, description },
              ...(pkg
                  ? [
                        {
                            '@type': 'SoftwareSourceCode',
                            '@id': `${home}#software`,
                            name: pkg.name,
                            description: pkg.description,
                            url: home,
                            codeRepository: `https://github.com/silarhi/${pkg.slug}`,
                            programmingLanguage: 'PHP',
                            license: 'https://opensource.org/licenses/MIT',
                            author: SILARHI,
                        },
                    ]
                  : []),
          ]
        : [
              website,
              {
                  '@type': 'TechArticle',
                  headline: data.title,
                  description,
                  url,
                  image,
                  inLanguage: route.lang,
                  dateModified: route.lastUpdated?.toISOString(),
                  isPartOf: { '@id': `${home}#website` },
                  ...(pkg ? { about: { '@id': `${home}#software` } } : {}),
                  publisher: SILARHI,
              },
              {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                      { '@type': 'ListItem', position: 1, name: siteTitle, item: home },
                      { '@type': 'ListItem', position: 2, name: data.title, item: url },
                  ],
              },
          ]

    head.push({
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        // `<` escaped so that a title holding `</script>` cannot close the tag
        content: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c'),
    })
})
