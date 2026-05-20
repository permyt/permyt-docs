# Contributing to permyt-docs

Thanks for helping improve the Permyt documentation. This repo is the source
for [docs.permyt.io](https://docs.permyt.io) — an [Astro](https://astro.build) +
[Starlight](https://starlight.astro.build) static site.

## Local setup

Requires Node.js 22 (see `.nvmrc`).

```bash
npm install
npm run dev      # http://localhost:4321
```

| Command           | Action                                |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the dev server.                 |
| `npm run build`   | Build the static site to `dist/`.     |
| `npm run preview` | Preview the built site locally.       |

## Where content lives

- Pages: `src/content/docs/` as Markdown (`.md`) and MDX (`.mdx`).
- Sidebar / navigation: `astro.config.mjs`.
- Brand assets (logos): `src/assets/`.
- Theme tweaks: `src/styles/custom.css`.

Sections mirror the sidebar groups in `astro.config.mjs`:
`concepts/`, `build/`, `protocol/`, `patterns/`, `app/`.

## Proposing changes

1. **Open an issue first** for anything beyond a typo or small clarification —
   especially structural changes, new pages, or sidebar reorganization. This
   avoids duplicated work and lets us agree on scope.
2. **Fork and branch** from `main`. Use a descriptive branch name
   (e.g. `docs/clarify-force-inputs`).
3. **Make your edits** in `src/content/docs/`. Keep prose in the existing voice
   — concise, technical, second-person where natural.
4. **Verify the build passes** before opening a PR:

   ```bash
   npm run build
   ```

   The build catches broken internal links, malformed frontmatter, and MDX
   syntax errors.
5. **Open a pull request** describing what changed and why. Link the issue if
   one exists. Screenshots help for visual changes.

## Style notes

- Prefer short sentences and active voice.
- Code samples should be runnable or clearly marked as illustrative.
- Link to other doc pages with Starlight slugs (relative paths), not full URLs.
- Don't commit `dist/`, `.astro/`, or `node_modules/` — `.gitignore` already
  covers these.

## License

By contributing, you agree that your contributions will be licensed under the
MIT License (see [LICENSE](LICENSE)).
