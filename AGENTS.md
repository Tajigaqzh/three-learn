# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React + TypeScript app with Three.js scenes and VitePress docs.

- `src/main.tsx` bootstraps the React app; `src/App.tsx` mounts the router.
- `src/router/` defines browser routes. Current pages live under `src/pages/`.
- `src/pages/basicCube/` and `src/pages/shadowCube/` contain scene pages, hooks, and Three.js helpers grouped by concern: `camera/`, `control/`, `geometry/`, `helper/`, `light/`, `render/`, and `scene/`.
- `src/assets/` stores imported app assets; `public/` stores static files served as-is.
- `docs/` contains VitePress documentation.
- `scripts/` contains repository automation, including staged formatting.

## Build, Test, and Development Commands

Use pnpm, as the repository includes `pnpm-lock.yaml`.

- `pnpm dev`: start the Vite development server.
- `pnpm build`: run TypeScript project build checks and produce the Vite production build in `dist/`.
- `pnpm preview`: preview the production build locally.
- `pnpm docs:dev`: run the VitePress docs server.
- `pnpm docs:build`: build the documentation site.
- `pnpm lint`: run Oxlint.
- `pnpm fmt`: format supported files with Oxfmt.
- `pnpm fmt:check`: verify formatting without writing changes.

There is currently no dedicated test script in `package.json`.

## Coding Style & Naming Conventions

Write TypeScript and React components using existing patterns. Use 2-space indentation, semicolons, single quotes, trailing commas, and a 100-column print width per `.oxfmtrc.json`. Keep React pages in PascalCase files such as `CubeScenePage.tsx`; hooks should use `useXxx.ts`; factory helpers should use names like `createRenderer.ts` or `createCamera.ts`.

Use the `@/` alias for source-root imports when appropriate. Keep Three.js setup split into small, focused factory modules.

## Testing Guidelines

No test framework is configured yet. Do not run `pnpm build` as the default way to
verify every change. Prefer the narrowest relevant check for the files touched,
such as targeted linting, formatting checks, type checks, or VitePress docs checks
when docs structure/config changes.

Only run `pnpm build` when the user explicitly asks for it, when preparing a
release/production bundle, or when the change affects TypeScript project
configuration, bundling, routing, build-time imports, or another area where a
production build is the appropriate verification. For documentation-only content
changes, do not verify by building unless docs config, links, or static assets
were changed and a docs-specific check is needed.

If adding tests later, place them near the code they cover and document the new
command in `package.json` and this guide.

## Commit & Pull Request Guidelines

Recent history uses short Conventional Commit-style subjects, for example `feat: add routed cube scenes` and `chore: add oxfmt and husky pre-commit checks`. Prefer `type: summary` with an imperative, specific summary.

Pull requests should include the change purpose, key implementation notes, verification commands run, and screenshots or recordings for visible UI or Three.js scene changes.

## Agent-Specific Instructions

This repository is indexed by CodeGraph (`.codegraph/`). Use CodeGraph before broad manual source searches when locating or understanding code paths.
