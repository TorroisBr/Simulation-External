# Architecture

## Purpose

Simulation-External hosts experimental tools and integration surfaces without coupling them to the Simulation runtime. It is not the Simulation core repository and is not an authority for canonical Simulation architecture. Fixture/project data and validated portable artifacts are the current consumer sources; there is no Simulation exporter.

The shared boundary is a versioned, read-oriented World Exchange projection.
Stable IDs define entity identity; optional display names do not. Consumers
render a fallback when an approved source has no label:

```text
Simulation Core (future, separately coordinated exporter)
                         ↓
               World Exchange contract
                         ↓
              portable JSON (`world-io`)
                   ↙             ↘
             Web Explorer      Obsidian
```

The exchange is not a persistence format. In particular, it must not mirror Phase 12 save data, runtime continuation state, hydration internals, receipts, mutation epochs, Unity serialization, or internal Store implementations.

## Package boundaries

- `packages/world-schema` owns public entity types, stable ID references, schema versioning, and runtime validation. It has no renderer or Simulation runtime dependency.
- `packages/world-io` owns portable JSON parsing, schema-validation entry-points, and deterministic serialization. It consumes `world-schema`, but defines no entities or consumer-specific transforms.
- `packages/world-fixtures` owns mock worlds used by consumers and tests. Fixtures are checked by the schema package.
- `packages/world-projection` contains an External-only, fixture-backed prototype of a narrow read-only source port and mapper into World Exchange. It depends on `world-schema`; it does not define entity types or provide a Simulation exporter contract.
- `packages/world-markdown` owns deterministic Markdown and frontmatter mapping plus safe generated-region synchronization. It can be tested without Obsidian.
- `apps/web` renders the active exchange from either the fixture or a locally selected portable JSON file. Both sources use the same `WorldExchange` navigation path; file loading is browser-local.
- `apps/obsidian-plugin` adapts the same exchange from either the bundled fixture or a manually selected portable JSON file to a vault, and delegates Markdown generation/synchronization to the shared package.

Dependency direction flows from consumers to shared packages. Shared packages must not depend on either app. No package may import Simulation core or Unity implementation types.

## External surface and future integration

The first exchange is read-only and fixture-backed. `world-projection` demonstrates a fixture-backed adapter boundary and explicit omissions; its source contract is not Simulation-owned and it does not read Simulation. World Exchange v1 requires a World scope ID but permits absent display names on World and entity records; public domain type, event, and relationship fields remain required where they carry meaning. The Stage D.1 review documents the field decisions. A future read-only exporter needs an explicit contract owned or reviewed with Simulation core before any runtime integration is attempted. It must transform selected public domain data into the exchange instead of exposing runtime objects. IPC, sockets, an in-process REST server, save loading/editing, memory inspection, and live mutation are outside this foundation.

`world-io` now serializes valid v1 exchanges to deterministic UTF-8 JSON and parses local artifacts through the canonical schema validator without repair. The `*.world.json` file is a potentially stale exchange artifact, not P12 persistence or an authority source. See [Portable World Exchange](PORTABLE_WORLD_EXCHANGE.md).

## Consumer architecture

Consumers adapt the renderer-independent exchange to their own navigation and presentation. Stable IDs connect entities. Consumer-local display state may exist, but canonical entity definitions and relationship meaning remain in `world-schema`. Obsidian-generated text has explicit ownership markers; user-authored content remains outside those markers and is preserved during synchronization.
