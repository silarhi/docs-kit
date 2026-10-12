---
title: Publishing a new package
description: Checklist to put the documentation of a SILARHI package online.
sidebar:
    order: 2
---

1. **Scaffold** — copy the `docs/` folder of [llms-txt-bundle](https://github.com/silarhi/llms-txt-bundle/tree/main/docs),
   change the `slug`, `title` and `description` in `astro.config.mjs`, then split the README into pages.
2. **Workflow** — copy `.github/workflows/docs.yml`: it calls the reusable
   [`docs-site.yml`](https://github.com/silarhi/docs-kit/blob/main/.github/workflows/docs-site.yml) of `silarhi/docs-kit`,
   which builds on every pull request touching `docs/` and deploys to GitHub Pages on the default branch.
3. **Composer archive** — add `/docs export-ignore` to `.gitattributes`.
4. **GitHub Pages** — _Settings → Pages_: source **GitHub Actions**, custom domain `<package>.silarhi.dev`, **Enforce HTTPS**.
5. **DNS** — Cloudflare zone `silarhi.dev`: `CNAME <package> → silarhi.github.io`, **DNS only** (grey cloud),
   otherwise GitHub cannot issue the certificate.
6. **Hub** — set `published: true` for the package in `packages/docs-kit/packages.js`, release the theme:
   the hub and the footer of every site link to it.
   In the same change, add a website named and with domain `<package>.silarhi.dev` to the SILARHI team on
   [analytics.silarhi.fr](https://analytics.silarhi.fr), and set its ID as `umami` next to `published`: the site
   tracks its visits once it upgrades to that theme release.
7. **README** — trim it to a landing page: the pitch, features, requirements, installation, a quick start, and a
   _Documentation_ list linking every page. Before cutting, check that every section, code block and inline-code
   token of the old README exists on the site. Move _Testing & Quality_ and _Contributing_ to a `CONTRIBUTING.md`
   (`/CONTRIBUTING.md export-ignore`), and point the links to old README anchors (`README.md#…` in `CHANGELOG.md`,
   `UPGRADE*.md`, docblocks, exception messages) to the documentation pages.
8. **`CLAUDE.md`** — if it says to document the API in the README, make it `docs/`: otherwise the README grows back.
9. **Website** — once the site is live, set it as the repository _Website_ (`gh repo edit --homepage`), and as the
   `homepage` of an npm package the repository publishes.

:::caution[Domain takeover]
`silarhi.dev` must be a [verified domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
of the `silarhi` organization: only its repositories can then claim a `*.silarhi.dev` subdomain, even one whose CNAME outlives its site.
:::
