# Simulation External — System Reference

## Purpose

Simulation-External is the reusable external integration surface and tooling ecosystem for Simulation. Web Explorer and Obsidian are first-party reference consumers of that surface, not the definition of the surface itself. The bundled validated fixture remains the demo source; both consumers can also load a portable World Exchange artifact.

## Architectural relationship

```text
Simulation canonical facts (future, coordinated source)
      ↓
approved read/projection adapter
      ↓
World Exchange v1 / portable JSON
      ↓
Web / Obsidian / CLI / other consumers
```

Simulation-External is separate from Simulation core and cannot redefine canonical Simulation architecture. World Exchange is not the Phase 12 (P12) persistence/save format. Public contracts expose stable domain concepts, not internal runtime or Store details. Unity is not part of the public external contract.

## Current structure

- **Contract:** `world-schema` owns World Exchange v1 types and validation.
- **Core tooling:** `world-io` parses, validates, and serializes portable JSON.
- **Adapter tooling:** `world-projection` is an External-only prototype; `world-markdown` is specialized Markdown/vault tooling.
- **Supporting data:** `world-fixtures` provides demo/test data and is not required for portable-file consumers.
- **Reference consumers:** `apps/web` and `apps/obsidian-plugin` exercise the surface; `examples/minimal-consumer` proves the smallest package path (`world-io` → `world-schema`).
- Root tooling provides the pnpm workspace, TypeScript, ESLint, Vitest, and Prettier.

See [External Platform Surface](EXTERNAL_PLATFORM_SURFACE.md) for public APIs,
stability expectations, dependency rules, and the third-party consumer flow.

## World Exchange

The current contract is schema version 1. Entity identity uses stable, non-empty IDs; references are explicit IDs and are validated against the exchange. World is a required scope object with a required ID; World and entity display names are optional and consumers provide fallbacks. Domain kinds/types, HistoricalEvent title/time, and Relationship endpoints/type remain required. Supported categories are World, Person, City, Location, Organization, Institution, Faction, Item, HistoricalEvent, and Relationship. Relationship endpoints may refer to any supported entity category. Runtime validation applies to fixtures and portable files. Fixtures and the External-only prototype remain the only implemented producer sources; no Simulation exporter contract exists.

See [World Exchange v1](WORLD_EXCHANGE.md) for field and compatibility rules.
See [Portable World Exchange](PORTABLE_WORLD_EXCHANGE.md) for JSON parsing,
serialization, consumer loading, and artifact authority limits.

## Obsidian model

The plugin exports deterministic Markdown grouped by entity type. Machine-readable frontmatter records entity and world identity; stable IDs, rather than filenames or display names, define identity. Known references become wikilinks. The Markdown package owns only its defined frontmatter keys and generated marker block. GM notes and all other user-authored content must be preserved. Existing notes without matching entity and world identity are treated as unclaimed and left unchanged.

See [Obsidian Mapping](OBSIDIAN_MAPPING.md) and [Sync Model](SYNC_MODEL.md).

## Web model

The Web Explorer provides world overview, global search, entity lists and details, related-entity navigation, and historical-event browsing. It consumes the shared `WorldExchange` value from either `world-fixtures` or `world-io`; display-derived state belongs in the Web layer. The Web app must not redefine World Exchange entity types.

## Integration status

**Implemented:** World Exchange schema and validation; fixture world; Web consumer with local portable-file loading; deterministic Markdown transformation and sync safeguards; Obsidian fixture and portable-file import; deterministic `world-io` JSON parsing/serialization; External-only, fixture-backed projection boundary prototype with omission reporting and consumer compatibility tests.

**Stage D.3 implemented:** package layers and public workspace entry points are classified; reference apps are explicitly consumers; consumer-pressure and stability rules are documented; a minimal independent consumer is part of workspace validation.

**Not implemented:** a real Simulation exporter or Simulation-owned source contract; live IPC; runtime mutation; P12 save consumption; Mod API; live bidirectional synchronization.

## Simulation dependency boundaries

Future projection work needs an agreed domain authority and a read-only contract that maps approved domain data into World Exchange. P12 or P19 decisions matter only where a specific projection question depends on them; Simulation-External does not wait for P12 as a whole. Unsupported concepts and unresolved authority questions should be recorded rather than inferred.

Authorized Simulation source studies use the ignored local `.references/Simulation` mirror and the `simulation-reference-mirror` workflow. Canonical refs must be selected explicitly; `origin/main` is not assumed to be the architecture baseline. The mirror has local push protections, and the sibling Simulation checkout is not the study source.

## Current roadmap stage

Stages A (schema and fixtures), B (Web Explorer), and C (Obsidian export/sync prototype) are implemented. Stage D has a corrected read-only projection study, an External-only fixture-backed boundary prototype, a completed Stage D.1 contract pressure review, implemented Stage D.2 portable World Exchange consumers, and implemented Stage D.3 platform surface. These stages do not supply Simulation-side World identity or a source contract, so no real exporter exists. Runtime exporter implementation requires explicit coordination and authorization. Stages E and F remain future work.

## Validation

From the repository root, the canonical commands are:

```text
pnpm build
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
git diff --check
```

## Git and durability

Make commits at meaningful durable boundaries. Do not force push or rewrite shared history, and do not modify the Simulation repository. Re-check `git status -sb`, branch tracking, and the remote before relying on later commits: a local commit alone is not remotely durable.

## Architectural invariants

1. P12 persistence and World Exchange are separate formats and concerns.
2. Stable IDs survive display-name and filename changes.
3. Consumers use the shared schema; they do not own or redefine it.
4. User-authored Obsidian content is never blindly overwritten.
5. Core schema fields express shared domain concepts, not consumer-specific needs.
6. Internal Simulation runtime and Unity types do not leak into public contracts.
7. A live mutation path requires an explicit integration contract.
8. Read projection and authoring/import are separate concerns.

This summary is a quick-start reference. Detailed rules remain in the linked design documents and package contracts.
