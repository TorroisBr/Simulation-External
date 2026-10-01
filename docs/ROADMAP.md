# Roadmap

## Stage A — external schema and fixtures

Define World Exchange v1, validation, stable IDs/references, and a connected fictional fixture world. Keep it independent from persistence and Simulation runtime code.

## Stage B — Web World Explorer

Build a fixture-driven web shell with search, entity navigation/details, relationship traversal, and event history. Consume the shared contract directly.

## Stage C — Obsidian export/sync prototype

Generate deterministic notes from the same exchange. Preserve user-owned vault content and test synchronization outside Obsidian before adding the UI adapter.

## Stage D — read-only projection boundary (in progress)

The corrected study and an External-only fixture-backed adapter prototype define and exercise the boundary, including explicit omissions and consumer compatibility. Stage D.1 has reviewed World Exchange field requirements: the World scope ID and stable entity IDs remain required, display names are optional, and domain type/event/relationship requirements remain in place. The prototype does not read Simulation or establish its source contract. A real exporter remains future work and requires coordination and an explicit integration contract with Simulation architecture owners. It should project approved domain data into World Exchange and must not load persistence files or expose internal runtime state.

### Stage D.2 — portable World Exchange (implemented, fixture/project data only)

`world-io` now parses, validates, and deterministically serializes normal
World Exchange v1 JSON artifacts. The Web Explorer can open a local file, and
Obsidian can manually import the same file through the existing safe Markdown
sync path. The bundled fixture remains available. This makes the External
artifact boundary usable by multiple consumers; it does not add a Simulation
exporter, source contract, or live integration. See
[Portable World Exchange](PORTABLE_WORLD_EXCHANGE.md).

### Stage D.3 — External platform surface (implemented)

Formalized Simulation-External as the reusable integration surface, with
World Exchange as the language-neutral interoperability contract and Web and
Obsidian as reference consumers. The package layers, dependency direction,
public entry points, stability expectations, and consumer-pressure rule are
documented. A minimal consumer package compiles and parses a portable sample
using only `world-io` at runtime. This stage adds no Simulation exporter,
service, transport, or package publication. See
[External Platform Surface](EXTERNAL_PLATFORM_SURFACE.md).

## Stage E — controlled authoring/import (future)

Requires separately agreed ownership, validation, conflict handling, authorization, and mutation contracts with Simulation core. No bidirectional live mutation is implemented by this roadmap foundation.

## Stage F — future extension/API integration (future)

Evaluate only after the read-only boundary and ownership model are proven. Any API, IPC, plugin, or cloud direction requires explicit architecture review. No IPC, sockets, REST server in Simulation, code injection, runtime plugin loading, authentication, multiplayer, cloud synchronization, or production database is included now.
