# Architecture

## Purpose

Simulation-External is the reusable external integration surface and tooling ecosystem for Simulation. Web Explorer and Obsidian are first-party reference consumers of that surface, not the definition of the surface itself. This repository is not Simulation core or an authority for its canonical architecture. Fixture/project data and validated portable artifacts are the current consumer sources; there is no Simulation exporter.

The shared boundary is a versioned, read-oriented World Exchange projection.
Stable IDs define entity identity; optional display names do not. Consumers
render a fallback when an approved source has no label:

```text
Simulation canonical facts (future, coordinated source)
                         ↓
              approved read/projection adapter
                         ↓
                 World Exchange v1
                         ↓
          optional portable JSON via `world-io`
             ↙             ↓             ↘
      Web Explorer      Obsidian      other consumers
```

The exchange is not a persistence format. In particular, it must not mirror Phase 12 save data, runtime continuation state, hydration internals, receipts, mutation epochs, Unity serialization, or internal Store implementations.

## Package boundaries

- `packages/world-schema` is the **contract layer**: public entity types, stable ID references, schema versioning, validation, and generic index helpers. It has no consumer or Simulation runtime dependency.
- `packages/world-io` is **core tooling** for portable JSON; its runtime dependency is `world-schema` alone.
- `packages/world-projection` is **experimental integration tooling**. Its External-only candidate port and mapper are not a Simulation source contract or runtime authority.
- `packages/world-markdown` is **specialized adapter tooling** for deterministic notes and safe generated-region sync; it is not part of the core contract.
- `packages/world-fixtures` supplies **demo/test data**, not a required consumer runtime source.
- `examples/minimal-consumer` proves that a typed consumer can parse a local exchange with only `world-io` as a direct runtime dependency.
- `apps/web` and `apps/obsidian-plugin` are **reference consumers**. They use the same World Exchange while keeping navigation, presentation, and vault behavior in their respective apps.

Dependency direction flows from consumers and tooling toward the contract. Reusable packages must not depend on either app. Test-only interoperability dependencies do not create runtime edges. No package may import Simulation core or Unity implementation types.

## External surface and future integration

The first exchange is read-only and fixture-backed. `world-projection` demonstrates a fixture-backed adapter boundary and explicit omissions; its source contract is not Simulation-owned and it does not read Simulation. World Exchange v1 requires a World scope ID but permits absent display names on World and entity records; public domain type, event, and relationship fields remain required where they carry meaning. The Stage D.1 review documents the field decisions. A future read-only exporter needs an explicit contract owned or reviewed with Simulation core before any runtime integration is attempted. It must transform selected public domain data into the exchange instead of exposing runtime objects. IPC, sockets, an in-process REST server, save loading/editing, memory inspection, and live mutation are outside this foundation.

`world-io` now serializes valid v1 exchanges to deterministic UTF-8 JSON and parses local artifacts through the canonical schema validator without repair. The `*.world.json` file is a potentially stale exchange artifact, not P12 persistence or an authority source. See [Portable World Exchange](PORTABLE_WORLD_EXCHANGE.md).

## Consumer architecture

Consumers adapt the renderer-independent exchange to their own navigation and presentation. Stable IDs connect entities. Consumer-local display state may exist, but canonical entity definitions and relationship meaning remain in `world-schema`. Obsidian-generated text has explicit ownership markers; user-authored content remains outside those markers and is preserved during synchronization.

World Exchange is language-neutral and needs no central server. Apps are
examples of consumers, not a required gateway. For supported package exports,
dependency direction, stability expectations, and consumer-pressure rules,
see [External Platform Surface](EXTERNAL_PLATFORM_SURFACE.md).
