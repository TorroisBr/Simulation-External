# Simulation-External

Simulation-External is the reusable external integration surface and tooling ecosystem for Simulation. Web Explorer and Obsidian are first-party reference consumers of that surface, not the definition of the surface itself.

This repository is not the Simulation core and does not define its canonical architecture. World Exchange is a read-oriented, versioned interoperability contract, separate from Phase 12 persistence/save data. Consumers may use portable `*.world.json` documents and do not need a running Web, Obsidian, or Simulation-External service.

## Repository layout

- `packages/world-schema` defines the versioned World Exchange contract and validation.
- `packages/world-io` parses, validates, and serializes portable World Exchange JSON.
- `packages/world-projection` prototypes source-to-contract adapter mapping; it is not a Simulation exporter contract.
- `packages/world-markdown` provides specialized Markdown rendering and safe vault synchronization.
- `packages/world-fixtures` contains validated demo/test data; consumers do not require it for portable files.
- `examples/minimal-consumer` proves an independent consumer needs only `world-io` at runtime.
- `apps/web` and `apps/obsidian-plugin` are first-party reference consumers.
- `docs` records boundaries, schema, mappings, synchronization ownership, and future stages.

## Getting started

Requires Node.js current LTS and pnpm.

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
```

The web app can be started with `pnpm --filter @simulation-external/web dev`. Plugin packaging and installation are documented in `apps/obsidian-plugin/README.md` when available.

## Boundaries

There is no live connection to Simulation, no database, and no backend. Do not load or modify Simulation saves or runtime state. P12 persistence, World Exchange, and portable JSON remain separate; External is also separate from P19 mechanics extensions. Future exporter or authoring work requires a separately agreed integration contract with the Simulation project. See [External Platform Surface](docs/EXTERNAL_PLATFORM_SURFACE.md), [Architecture](docs/ARCHITECTURE.md), [World Exchange](docs/WORLD_EXCHANGE.md), and [Roadmap](docs/ROADMAP.md).
