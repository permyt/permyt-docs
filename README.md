# permyt-docs

The documentation site for Permyt — published at
[docs.permyt.io](https://docs.permyt.io).

Built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build).

## Requirements

- Node.js 22 (see `.nvmrc`). The site builds on Node 20.3+ as well, but 22 is
  the supported line. Astro 5 is pinned because Astro 6 requires Node 22.12+.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
```

| Command           | Action                                         |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the dev server.                          |
| `npm run build`   | Build the static site to `dist/`.              |
| `npm run preview` | Preview the built site locally.                |

## Content

Pages live in `src/content/docs/` as Markdown and MDX. The sidebar is defined
in `astro.config.mjs`. Sections:

- **Introduction** — what Permyt is, how it works, the three roles.
- **Concepts** — scopes, consent, force inputs, the zero-knowledge broker.
- **Build with Permyt** — the SDK, quickstart, requester, provider, connect.
- **Protocol reference** — actors, cycles, the broker API and data shapes.
- **Patterns** — provider patterns, connectors, AI agents as requesters.
- **The Permyt app** — the consumer app.

Brand assets in `src/assets/` are the Permyt logo SVGs.

## Deployment

The site is a static build, deployed to **Cloudflare Pages**. Project
settings:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 22 (from `.nvmrc`, or set `NODE_VERSION=22`)

`wrangler.toml` declares `pages_build_output_dir` for Wrangler-based deploys.

## Contributing

Doc improvements welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for setup,
where content lives, and how to open a pull request.

## License

MIT — see [LICENSE](LICENSE).
