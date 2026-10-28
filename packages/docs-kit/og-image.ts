// Social image of every docs page, drawn at build time in the layout of sainthillier.fr's og:image: badges, the page
// title and description, the site's link, and a card with the package and its install command

import { getCollection } from 'astro:content'
import { readFile } from 'node:fs/promises'
import { logo, siteTitle } from 'virtual:silarhi-docs-kit/og'
import { Resvg } from '@resvg/resvg-js'
import type { APIRoute, GetStaticPaths } from 'astro'
import satori from 'satori'
import { packageOf } from './packages.js'
import { OG_IMAGE_SIZE, ogImagePath } from './seo.ts'

// TTF on purpose: satori reads TTF, OTF and WOFF, not the WOFF2 files of @fontsource-variable/montserrat
const FONTS = [
    ['Montserrat', 500, 'montserrat/latin-500-normal.ttf'],
    ['Montserrat', 600, 'montserrat/latin-600-normal.ttf'],
    ['Montserrat', 800, 'montserrat/latin-800-normal.ttf'],
    ['JetBrains Mono', 500, 'jetbrains-mono/latin-500-normal.ttf'],
] as const
const fonts = await Promise.all(
    FONTS.map(async ([name, weight, file]) => ({
        name,
        weight,
        style: 'normal' as const,
        data: await (await fetch(`https://api.fontsource.org/v1/fonts/${file}`)).arrayBuffer(),
    }))
)
const logoSrc = `data:image/png;base64,${(await readFile(logo)).toString('base64')}`

const site = import.meta.env.SITE
const pkg = site ? packageOf(site) : undefined
const host = site ? new URL(site).host : 'docs.silarhi.dev'

const COLORS = {
    primary: '#2563eb',
    pill: '#fdd035',
    onPill: '#231a00',
    surface: '#f8faff',
    low: '#eff4ff',
    high: '#dbeafe',
    ink: '#0b1120',
    muted: '#475569',
    hairline: 'rgba(11, 17, 32, 0.08)',
}

type Style = Record<string, string | number>
type Element = { type: string; props: Record<string, unknown> }
type Child = Element | string | false | undefined

/** A satori element: one with several children must be a flex box, so `display: flex` is the default. */
const h = (type: string, style: Style, ...children: Child[]): Element => ({
    type,
    props: { style: { display: 'flex', ...style }, children: children.filter(Boolean) },
})

/** A Lucide icon, its paths separated by `|`. */
const icon = (paths: string, color: string): Element => ({
    type: 'svg',
    props: {
        width: 18,
        height: 18,
        viewBox: '0 0 24 24',
        children: paths.split('|').map((d) => ({
            type: 'path',
            props: { d, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
        })),
    },
})
const CODE = 'm16 18 6-6-6-6|m8 6-6 6 6 6'
const LINK =
    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71|M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'

const badge = (label: string, style: Style, before: Element) =>
    h(
        'div',
        {
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 9999,
            background: COLORS.low,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.04em',
            ...style,
        },
        before,
        label
    )

/** A long title or description would push the card off the image: a smaller title, a shortened description. */
const titleSize = (title: string) => (title.length > 60 ? 44 : title.length > 36 ? 54 : 64)
const shorten = (text: string, max = 150) =>
    text.length <= max ? text : `${text.slice(0, text.lastIndexOf(' ', max - 1)).replace(/[,;:.]$/, '')}…`

/** The title in words, its last one in the brand blue as in the sainthillier.fr layout (a single word: all of it). */
const headline = (title: string): Element[] => {
    const words = title.split(' ')
    return words.map((word, index) =>
        h(
            'span',
            {
                marginRight: index < words.length - 1 ? '0.25em' : 0,
                color: index === words.length - 1 ? COLORS.primary : COLORS.ink,
            },
            word
        )
    )
}

// What the card leaves of the image: its width less the padding (72 × 2), the gap (48) and the card
const CARD_WIDTH = 360
const TEXT_WIDTH = OG_IMAGE_SIZE.width - 2 * 72 - 48 - CARD_WIDTH

const image = (title: string, description: string) =>
    h(
        'div',
        {
            // The canvas, padding included: a width in pixels would add the padding to it
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            padding: '64px 72px 56px',
            backgroundColor: COLORS.surface,
            // satori has no blur filter: the two blobs of the sainthillier.fr layout are radial gradients
            backgroundImage:
                'radial-gradient(circle at 92% 0%, rgba(37, 99, 235, 0.12), rgba(248, 250, 255, 0) 45%), radial-gradient(circle at 0% 100%, rgba(56, 189, 248, 0.22), rgba(248, 250, 255, 0) 40%)',
            color: COLORS.ink,
            fontFamily: 'Montserrat',
        },
        h(
            'div',
            { gap: 10, marginBottom: 28 },
            badge(
                'OPEN SOURCE · MIT',
                { background: COLORS.high },
                h('div', { width: 10, height: 10, borderRadius: 9999, background: COLORS.pill })
            ),
            badge(`${siteTitle} · Documentation`, { color: COLORS.primary }, icon(CODE, COLORS.primary))
        ),
        h(
            'div',
            { flex: 1, gap: 48 },
            h(
                'div',
                // Its width set: satori sizes a flex item on its text, which would push the card off the image
                { width: TEXT_WIDTH, flexShrink: 0, flexDirection: 'column', justifyContent: 'center' },
                h(
                    'div',
                    {
                        fontSize: titleSize(title),
                        fontWeight: 800,
                        lineHeight: 1.08,
                        letterSpacing: '-0.035em',
                        flexWrap: 'wrap',
                    },
                    ...headline(title)
                ),
                description !== '' &&
                    h(
                        'div',
                        { marginTop: 24, fontSize: 25, lineHeight: 1.4, color: COLORS.muted },
                        shorten(description)
                    ),
                h(
                    'div',
                    {
                        alignSelf: 'flex-start',
                        alignItems: 'center',
                        gap: 10,
                        marginTop: 36,
                        padding: '12px 22px',
                        borderRadius: 12,
                        background: COLORS.pill,
                        color: COLORS.onPill,
                        fontSize: 22,
                        fontWeight: 800,
                    },
                    icon(LINK, COLORS.onPill),
                    host
                )
            ),
            h(
                'div',
                {
                    flexDirection: 'column',
                    alignSelf: 'center',
                    width: CARD_WIDTH,
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: `1px solid ${COLORS.hairline}`,
                    borderRadius: 20,
                    background: '#ffffff',
                    boxShadow: '0 20px 25px -5px rgba(11, 28, 48, 0.1)',
                },
                h(
                    'div',
                    { flexDirection: 'column', gap: 18, padding: '26px 24px 24px', background: COLORS.low },
                    h(
                        'div',
                        { alignItems: 'center', gap: 14 },
                        { type: 'img', props: { src: logoSrc, width: 56, height: 56 } },
                        h(
                            'div',
                            { flexDirection: 'column' },
                            h('div', { fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }, siteTitle),
                            h(
                                'div',
                                { marginTop: 2, fontSize: 15, fontWeight: 500, color: COLORS.muted },
                                'Open source by SILARHI'
                            )
                        )
                    ),
                    pkg &&
                        h(
                            'div',
                            {
                                flexDirection: 'column',
                                padding: '16px 18px',
                                borderRadius: 12,
                                background: '#0f172a',
                                color: '#86efac',
                                fontFamily: 'JetBrains Mono',
                                fontSize: 15,
                                lineHeight: 1.5,
                            },
                            h('div', {}, h('div', { color: '#94a3b8', marginRight: 10 }, '$'), 'composer require'),
                            h('div', { paddingLeft: 22 }, pkg.composer)
                        )
                )
            )
        )
    )

const entries = await getCollection('docs')

export const getStaticPaths = (() =>
    entries.map(({ id, data }) => {
        // The collection ids the home `index`: Starlight's route data, which the route middleware reads, calls it ''
        const isHome = id === 'index'
        return {
            // The image path the route middleware points to, without `/og/`
            params: { route: ogImagePath(isHome ? '' : id).slice(4) },
            // Home: the package and what it does; other pages: the page, the package being in the badge
            props: { title: isHome ? siteTitle : data.title, description: data.description ?? '' },
        }
    })) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
    const svg = await satori(image(props.title, props.description) as Parameters<typeof satori>[0], {
        ...OG_IMAGE_SIZE,
        fonts,
    })
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: OG_IMAGE_SIZE.width } }).render().asPng()
    return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } })
}
