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
7. **README** — link the documentation site and add it as the repository _Website_ (`gh repo edit --homepage`).

:::caution[Domain takeover]
`silarhi.dev` must be a [verified domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
of the `silarhi` organization: only its repositories can then claim a `*.silarhi.dev` subdomain, even one whose CNAME outlives its site.
:::
