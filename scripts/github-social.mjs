/*
 * Renders the GitHub social preview of every public SILARHI repository (social/<repo>.png, 1280×640) with headless
 * Chrome, in the layout of sainthillier.fr's og:image: badges, headline, lead and link on the left, a card with the
 * install command and three figures on the right.
 *
 * The figures are read from each repository's composer.json or package.json on GitHub, so a new PHP or Symfony floor
 * only needs a run again. GitHub has no API to set the image: upload each file in the repository's Settings → Social
 * preview. Run `pnpm social` (needs `gh`, logged in); CHROME_PATH overrides the macOS Chrome location.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { packages, siteUrl } from '../packages/docs-kit/packages.js'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(rootDir, 'social')
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const asset = (path) => pathToFileURL(resolve(rootDir, path)).href
const fonts = 'packages/docs-kit/node_modules/@fontsource-variable/montserrat/files'

// GitHub's template keeps what matters 40pt (80px) away from the edges: its previews are cropped to other ratios
const SIZE = { width: 1280, height: 640 }
const SAFE = 80

/**
 * Every public repository but the profile readme (.github), the client sites and silarhi.fr, whose preview is drawn
 * with its og:image by its own `pnpm og-image`. A package of the docs registry takes its name, description and site
 * from it; `stats` replaces the figures read from its manifest.
 */
const repositories = [
    ...packages.map(({ slug, name, description, composer }) => ({
        repo: slug,
        name,
        lead: description,
        site: siteUrl(slug),
        install: `composer require \\\n  ${composer}`,
    })),
    {
        repo: 'tabler-ux-kit',
        name: 'Tabler UX Kit',
        lead: 'Tabler components for the Symfony UX Toolkit: installed into your application, yours to edit.',
        site: siteUrl('tabler-ux-components'),
        kind: 'Symfony UX Toolkit kit',
        install: 'php bin/console ux:install \\\n  alert --kit=github.com/\\\n  silarhi/tabler-ux-kit',
        stats: [
            ['Source', 'Twig', true],
            ['Copied', 'Yours', true],
            ['License', 'MIT'],
        ],
    },
    {
        repo: 'docs-kit',
        name: 'SILARHI Docs Kit',
        lead: 'The shared Starlight kit behind the documentation sites of the SILARHI open-source packages.',
        site: 'https://docs.silarhi.dev',
        manifest: 'packages/docs-kit/package.json',
        install: 'pnpm add @silarhi/docs-kit',
    },
    {
        repo: 'app-js',
        name: 'app-js',
        install: 'pnpm add @silarhi/app-js',
    },
    {
        repo: 'docker-php',
        name: 'PHP Docker Images',
        lead: 'Apache, FrankenPHP and CI/Alpine images for PHP apps, with Symfony variants. On Docker Hub and GHCR.',
        site: 'https://hub.docker.com/r/silarhi/php-apache',
        kind: 'Docker images',
        install: 'docker pull \\\n  silarhi/php-apache:8.5',
        stats: [
            ['PHP', '8.1+'],
            ['Web', 'FrankenPHP', true],
            ['CI', 'Alpine', true],
        ],
    },
    {
        repo: 'symfony-docker-ci',
        name: 'Symfony Docker CI',
        lead: 'A proof of concept of CI/CD with Symfony, Docker and CircleCI, live on labs.silarhi.fr.',
        site: 'https://labs.silarhi.fr',
        kind: 'Demo application',
    },
    {
        repo: 'labs.silarhi.fr',
        name: 'SILARHI Labs',
        lead: 'Docker Compose deploy configs for the labs.silarhi.fr demos: Symfony CI, ESI with Varnish, PHP image.',
        site: 'https://labs.silarhi.fr',
        kind: 'Deploy configs',
        stats: [
            ['Demos', '3'],
            ['Deploy', 'Compose', true],
            ['Cache', 'Varnish', true],
        ],
    },
]

// stderr ignored: a missing manifest is a 404 the caller expects
const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
const github = (repo) => JSON.parse(gh('api', `repos/silarhi/${repo}`))
const manifestOf = (repo, path) => {
    try {
        return JSON.parse(
            Buffer.from(JSON.parse(gh('api', `repos/silarhi/${repo}/contents/${path}`)).content, 'base64')
        )
    } catch {
        return null
    }
}
/** "^6.4 || ^7.0" → "6.4+", the lowest version a constraint allows. */
const floor = (constraint) => `${constraint.match(/\d+(\.\d+)?/)[0]}+`

/** The badge, card line and figures read from the manifest, for the repositories that do not set them. */
const describe = (entry, meta) => {
    const composer = manifestOf(entry.repo, 'composer.json')
    const npm = composer ? null : manifestOf(entry.repo, entry.manifest ?? 'package.json')
    const license = composer?.license ?? npm?.license ?? meta.license?.spdx_id ?? 'MIT'
    if (composer) {
        const require = composer.require ?? {}
        const symfony = Object.entries(require).find(([name]) =>
            /^symfony\/(framework-bundle|http-kernel|dependency-injection|config)$/.test(name)
        )
        const dependencies = Object.keys(require).filter((name) => name !== 'php' && !name.startsWith('ext-'))
        const middle = symfony
            ? ['Symfony', floor(symfony[1])]
            : require['doctrine/orm']
              ? ['Doctrine', floor(require['doctrine/orm'])]
              : ['Dependencies', String(dependencies.length)]
        return {
            license,
            kind:
                composer.type === 'symfony-bundle' || composer.name?.endsWith('-bundle')
                    ? 'Symfony bundle'
                    : require['doctrine/orm']
                      ? 'Doctrine ORM'
                      : composer.type === 'project'
                        ? 'Symfony application'
                        : 'PHP library',
            stats: [['PHP', floor(require.php ?? '8.2')], middle, ['License', license]],
        }
    }
    return {
        license,
        kind: 'TypeScript',
        stats: [
            ['Language', 'TS'],
            ['Dependencies', String(Object.keys(npm?.dependencies ?? {}).length)],
            ['License', license],
        ],
    }
}

const icons = {
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
}
const icon = (name, width = 2) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`
const escapeHtml = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
/** The name, its last word in the brand blue when it has several. */
const headline = (name) => {
    const words = escapeHtml(name).split(' ')
    return words.length > 1 ? `${words.slice(0, -1).join(' ')} <span class="hl">${words.at(-1)}</span>` : words[0]
}

const page = ({ title, lead, host, kind, status, name, role, install, stats }) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Montserrat'; font-weight: 100 900; src: url('${asset(`${fonts}/montserrat-latin-wght-normal.woff2`)}'); }
@font-face { font-family: 'Montserrat'; font-weight: 100 900; src: url('${asset(`${fonts}/montserrat-latin-ext-wght-normal.woff2`)}'); unicode-range: U+0100-024F; }
:root { --primary: #2563eb; --pill: #fdd035; --on-pill: #231a00; --surface: #f8faff; --low: #eff4ff; --high: #dbeafe; --ink: #0b1120; --muted: #475569; --hairline: rgb(11 17 32 / .08); }
* { box-sizing: border-box; margin: 0; }
html, body { width: ${SIZE.width}px; height: ${SIZE.height}px; overflow: hidden; }
body { position: relative; display: flex; flex-direction: column; padding: ${SAFE}px; background: var(--surface); color: var(--ink); font-family: 'Montserrat', sans-serif; -webkit-font-smoothing: antialiased; }
svg { width: 1em; height: 1em; flex-shrink: 0; }
.blob { position: absolute; border-radius: 9999px; filter: blur(64px); }
.blob-a { top: -160px; right: -80px; width: 640px; height: 640px; background: rgb(37 99 235 / .08); }
.blob-b { bottom: -200px; left: -120px; width: 480px; height: 480px; background: rgb(56 189 248 / .18); }
.badges { position: relative; display: flex; gap: 10px; margin-bottom: 24px; }
.badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 9999px; background: var(--low); font-size: 16px; font-weight: 600; letter-spacing: .04em; white-space: nowrap; }
.badge-status { background: var(--high); text-transform: uppercase; }
.badge-topic { color: var(--primary); }
.dot { width: 10px; height: 10px; border-radius: 9999px; background: var(--pill); }
.content { position: relative; display: flex; flex: 1; gap: 56px; min-height: 0; }
.intro { display: flex; flex: 1; flex-direction: column; justify-content: center; min-width: 0; }
h1 { font-size: 64px; font-weight: 800; line-height: 1.06; letter-spacing: -.035em; }
.hl { color: var(--primary); }
.lead { margin-top: 22px; font-size: 25px; line-height: 1.4; color: var(--muted); }
.lead strong { color: var(--ink); font-weight: 600; }
.site { display: inline-flex; align-self: flex-start; align-items: center; gap: 10px; margin-top: 32px; padding: 12px 22px; border-radius: 12px; background: var(--pill); color: var(--on-pill); font-size: 22px; font-weight: 700; }
.card-wrap { position: relative; flex-shrink: 0; align-self: center; width: 380px; }
.card-glow { position: absolute; inset: -10px; border-radius: 28px; background: linear-gradient(to top right, rgb(37 99 235 / .12), rgb(253 208 53 / .25), transparent); filter: blur(16px); }
.card { position: relative; overflow: hidden; border: 1px solid var(--hairline); border-radius: 20px; background: #fff; box-shadow: 0 20px 25px -5px rgb(11 28 48 / .1), 0 8px 10px -6px rgb(11 28 48 / .1); }
.profile { display: flex; flex-direction: column; gap: 18px; padding: 26px 24px 24px; background: var(--low); border-bottom: 1px solid var(--hairline); }
.head { display: flex; align-items: center; gap: 14px; }
.head img { width: 56px; height: 56px; }
.profile.centered { align-items: center; padding: 34px 24px 28px; text-align: center; }
.profile.centered .head { flex-direction: column; }
.profile.centered .head img { width: 112px; height: 112px; }
.name { font-size: 26px; font-weight: 700; letter-spacing: -.01em; }
.role { margin-top: 2px; font-size: 16px; color: var(--muted); }
pre { padding: 16px 18px; border-radius: 12px; background: #0f172a; color: #86efac; font-family: Menlo, ui-monospace, monospace; font-size: 15px; line-height: 1.5; white-space: pre; overflow: hidden; }
pre .prompt { color: #94a3b8; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); padding: 20px 8px; text-align: center; }
.stats div { display: flex; flex-direction: column-reverse; }
.stats div + div { border-left: 1px solid var(--hairline); }
.stats dd { font-size: 30px; font-weight: 700; line-height: 1.2; color: var(--primary); white-space: nowrap; }
.stats dd.neutral { color: var(--ink); }
.stats dd.word { font-size: 20px; line-height: 36px; }
.stats dt { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #8a8f98; }
</style></head><body>
<div class="blob blob-a"></div><div class="blob blob-b"></div>
<div class="badges">
  <span class="badge badge-status"><span class="dot"></span>${escapeHtml(status)}</span>
  <span class="badge badge-topic">${icon('code')}${escapeHtml(kind)}</span>
</div>
<div class="content">
  <div class="intro"><h1>${title}</h1><p class="lead">${lead}</p><span class="site">${icon('link', 2.25)}${escapeHtml(host)}</span></div>
  <div class="card-wrap"><div class="card-glow"></div><div class="card">
    <div class="profile${install ? '' : ' centered'}">
      <div class="head"><img src="${asset('packages/docs-kit/assets/logo.png')}" alt=""><div><p class="name">${escapeHtml(name)}</p><p class="role">${escapeHtml(role)}</p></div></div>
      ${install ? `<pre><span class="prompt">$</span> ${escapeHtml(install)}</pre>` : ''}
    </div>
    <dl class="stats">${stats
        .map(([label, value, neutral]) => {
            const classes = [neutral ? 'neutral' : '', value.length > 5 ? 'word' : ''].filter(Boolean).join(' ')
            return `<div><dt>${escapeHtml(label)}</dt><dd class="${classes}">${escapeHtml(value)}</dd></div>`
        })
        .join('')}</dl>
  </div></div>
</div></body></html>`

const only = process.argv.slice(2)
const workDir = mkdtempSync(join(tmpdir(), 'github-social-'))
mkdirSync(outDir, { recursive: true })
try {
    for (const entry of repositories.filter(({ repo }) => only.length === 0 || only.includes(repo))) {
        const meta = github(entry.repo)
        const read = entry.stats ? { license: 'MIT', kind: entry.kind, stats: entry.stats } : describe(entry, meta)
        const html = join(workDir, `${entry.repo}.html`)
        writeFileSync(
            html,
            page({
                title: entry.title ?? headline(entry.name),
                lead: entry.lead ?? escapeHtml(meta.description ?? ''),
                host: new URL(entry.site ?? meta.html_url).host + (entry.site ? '' : new URL(meta.html_url).pathname),
                kind: entry.kind ?? read.kind,
                status: entry.status ?? `Open source · ${read.license}`,
                name: entry.name,
                role: entry.role ?? 'Open source by SILARHI',
                install: entry.install,
                stats: read.stats,
            })
        )
        const output = resolve(outDir, `${entry.repo}.png`)
        execFileSync(
            chrome,
            [
                '--headless',
                '--hide-scrollbars',
                // The page loads the fonts and the logo from the repository through file:// URLs
                '--allow-file-access-from-files',
                '--force-device-scale-factor=1',
                `--window-size=${SIZE.width},${SIZE.height}`,
                // Leaves time for the web fonts to load before the capture
                '--virtual-time-budget=3000',
                `--screenshot=${output}`,
                pathToFileURL(html).href,
            ],
            { stdio: 'ignore' }
        )
        console.log(`social/${entry.repo}.png: ${(statSync(output).size / 1024).toFixed(1)} KB`)
    }
} finally {
    rmSync(workDir, { recursive: true, force: true })
}
