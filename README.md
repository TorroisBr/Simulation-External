# Simulation-External

Experimental external tools for exploring Simulation worlds without coupling those tools to the Simulation runtime. The first consumers are a web World Explorer and an Obsidian integration; both use the same versioned World Exchange representation.

This repository is not the Simulation core and does not define its canonical architecture. For now, all consumers use validated fictional fixture data. The World Exchange is a read-oriented external projection, separate from the Phase 12 persistence/save format.

## Repository layout

- `packages/world-schema` defines the renderer-independent, versioned public contract and runtime validation.
- `packages/world-fixtures` contains connected demonstration data validated by the schema package.
- `packages/world-markdown` maps the exchange to deterministic Markdown while preserving user-authored regions.
- `apps/web` provides the fixture-driven World Explorer.
- `apps/obsidian-plugin` provides the Obsidian integration foundation.
- `docs` records boundaries, schema, mappings, synchronization ownership, and future stages.

## Getting started

Requires Node.js current LTS and pnpm.

```sh
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The web app can be started with `pnpm --filter @simulation-external/web dev`. Plugin packaging and installation are documented in `apps/obsidian-plugin/README.md` when available.

## Boundaries

There is no live connection to Simulation, no database, and no backend. Do not load or modify Simulation saves or runtime state. Future exporter or authoring work requires a separately agreed integration contract with the Simulation project. See [Architecture](docs/ARCHITECTURE.md), [World Exchange](docs/WORLD_EXCHANGE.md), and [Roadmap](docs/ROADMAP.md).
