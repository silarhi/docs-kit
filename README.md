# SILARHI documentation theme

Monorepo of the documentation tooling of the [SILARHI](https://silarhi.fr) open-source packages.

| Path                                                   | What                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [`packages/docs-kit`](packages/docs-kit) | [`@silarhi/docs-kit`](https://www.npmjs.com/package/@silarhi/docs-kit) on npm |
| [`site`](site)                                         | The hub, [docs.silarhi.dev](https://docs.silarhi.dev): the package list and the theme guide |

Each package documents itself from its own `docs/` folder, published at `https://<package>.silarhi.dev` by the
reusable workflow [`docs-site.yml`](.github/workflows/docs-site.yml) of this repository.

## Development

```bash
yarn install
yarn dev     # the hub, with the local theme
yarn lint
```

To try the theme on a package before releasing it: `yarn link` in `packages/docs-kit`,
then `yarn link @silarhi/docs-kit` in the `docs/` folder of the package.

## Release

1. Bump `version` in `packages/docs-kit/package.json`
2. Tag `v<version>` on `origin/main` and push the tag: `release.yml` publishes to npm

## License

MIT
