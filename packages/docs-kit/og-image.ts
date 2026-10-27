// Social image of every docs page, generated at build time: the page title and description on the SILARHI colors
import { getCollection } from 'astro:content'
import { logo, siteTitle } from 'virtual:silarhi-docs-kit/og'
import { OGImageRoute } from 'astro-og-canvas'
import { ogImagePath } from './seo.ts'

// TTF on purpose: CanvasKit does not read the WOFF2 files of @fontsource-variable/montserrat
const FONTS = [
    'https://api.fontsource.org/v1/fonts/montserrat/latin-700-normal.ttf',
    'https://api.fontsource.org/v1/fonts/montserrat/latin-400-normal.ttf',
]

// The collection ids the home `index`: Starlight's route data, which the route middleware reads, calls it ''
const entries = (await getCollection('docs')).map((entry) => ({ ...entry, id: entry.id === 'index' ? '' : entry.id }))

export const { getStaticPaths, GET } = await OGImageRoute({
    // Keys are the image paths without `/og/` and `.png`, as the route middleware builds them
    pages: Object.fromEntries(entries.map(({ id, data }) => [ogImagePath(id).slice(4, -4), { id, ...data }])),
    getImageOptions: (_path, page) => ({
        // Home: the package and what it does; other pages: the page, then the package it belongs to
        title: page.id === '' ? siteTitle : page.title,
        description: page.id === '' ? page.description : [siteTitle, page.description].filter(Boolean).join(' · '),
        logo: { path: logo, size: [96] },
        bgGradient: [
            [11, 17, 32],
            [23, 37, 84],
        ],
        border: { color: [59, 130, 246], width: 16, side: 'inline-start' },
        padding: 72,
        font: {
            title: { families: ['Montserrat'], weight: 'Bold', size: 64, lineHeight: 1.15, color: [255, 255, 255] },
            description: { families: ['Montserrat'], size: 32, lineHeight: 1.4, color: [191, 219, 254] },
        },
        fonts: FONTS,
    }),
})
