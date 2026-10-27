# SILARHI documentation theme

Monorepo of the documentation tooling of the [SILARHI](https://silarhi.fr) open-source packages.

| Path                                                   | What                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [`packages/docs-kit`](packages/docs-kit) | [`@silarhi/docs-kit`](https://www.npmjs.com/package/@silarhi/docs-kit) on npm |
| [`site`](site)                                         | The hub, [docs.silarhi.dev](https://docs.silarhi.dev): the package list and the theme guide |
| [`social`](social)                                     | The GitHub social preview of every public SILARHI repository (1280×640)                     |

Each package documents itself from its own `docs/` folder, published at `https://<package>.silarhi.dev` by the
reusable workflow [`docs-site.yml`](.github/workflows/docs-site.yml) of this repository.

## Development

```bash
pnpm install
pnpm dev     # the hub, with the local theme
pnpm lint
```

A pnpm workspace (`pnpm-workspace.yaml`): the hub depends on the theme through `workspace:*`. The pnpm version is
pinned by `packageManager` in `package.json`; a dependency that needs an install script must be listed under
`allowBuilds` in `pnpm-workspace.yaml` (none does today).

To try the theme on a package before releasing it: `pnpm link <path to>/docs-kit/packages/docs-kit`
in the `docs/` folder of the package.

## GitHub social previews

`pnpm social` draws `social/<repository>.png` for the repositories listed in
[`scripts/github-social.mjs`](scripts/github-social.mjs) (the packages of `packages.js`, then the others), with headless
Chrome and `gh` logged in; `pnpm social picasso-bundle` draws one. The PHP, Symfony and Doctrine floors and the licence
are read from each repository's `composer.json` or `package.json` on GitHub: run it again after raising one, and for a
new package. GitHub has no API for this image: upload the file in the repository's Settings → General → Social preview.

Websites keep 1200×630 for their `og:image`, the ratio Facebook and LinkedIn show uncropped; 1280×640 is GitHub's, with
the 80 px safe border of its template.

## Release

1. Bump `version` in `packages/docs-kit/package.json`
2. Tag `v<version>` on `origin/main` and push the tag: `release.yml` publishes to npm

## License

MIT
