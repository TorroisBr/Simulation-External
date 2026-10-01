# Simulation External — System Reference

## Purpose

Simulation-External provides external tools and projection surfaces for the Simulation ecosystem. Its initial consumers are the Web World Explorer and an Obsidian plugin. The current data source is a validated fixture world.

## Architectural relationship

```text
Simulation Core
      ↓
dedicated read/projection boundary (future, coordinated)
      ↓
World Exchange
      ↓
Web / Obsidian / future tools
```

Simulation-External is separate from Simulation core and cannot redefine canonical Simulation architecture. World Exchange is not the Phase 12 (P12) persistence/save format. Public contracts expose stable domain concepts, not internal runtime or Store details. Unity is not part of the public external contract.

## Current structure

- `packages/world-schema` owns renderer-agnostic World Exchange v1 types, ID/reference rules, indexes, and runtime validation.
- `packages/world-fixtures` provides the validated fictional world shared by apps and tests.
- `packages/world-projection` prototypes a read-only candidate-facts adapter into World Exchange using External-owned mocks; it has no Simulation source implementation.
- `packages/world-markdown` renders deterministic notes and safely merges generated content outside Obsidian.
- `apps/web` presents the fixture through the World Explorer.
- `apps/obsidian-plugin` adapts the same exchange to an Obsidian vault and invokes the shared Markdown package.
- Root tooling provides the pnpm workspace, strict TypeScript configuration, ESLint, Vitest, and Prettier.

## World Exchange

The current contract is schema version 1. Entity identity uses stable, non-empty IDs; references are explicit IDs and are validated against the exchange. Supported categories are World, Person, City, Location, Organization, Institution, Faction, Item, HistoricalEvent, and Relationship. Relationship endpoints may refer to any supported entity category. Runtime validation is applied to the fixture. Fixtures remain the integration source until an explicit projection contract exists.

See [World Exchange v1](WORLD_EXCHANGE.md) for field and compatibility rules.

## Obsidian model

The plugin exports deterministic Markdown grouped by entity type. Machine-readable frontmatter records entity and world identity; stable IDs, rather than filenames or display names, define identity. Known references become wikilinks. The Markdown package owns only its defined frontmatter keys and generated marker block. GM notes and all other user-authored content must be preserved. Existing notes without matching entity and world identity are treated as unclaimed and left unchanged.

See [Obsidian Mapping](OBSIDIAN_MAPPING.md) and [Sync Model](SYNC_MODEL.md).

## Web model

The Web Explorer provides world overview, global search, entity lists and details, related-entity navigation, and historical-event browsing. It consumes `world-schema` and `world-fixtures`; display-derived state belongs in the Web layer. The Web app must not redefine World Exchange entity types.

## Integration status

**Implemented:** World Exchange schema and validation; fixture world; Web consumer; deterministic Markdown transformation and sync safeguards; Obsidian fixture export prototype; External-only, fixture-backed projection boundary prototype with omission reporting and consumer compatibility tests.

**Not implemented:** a real Simulation exporter or Simulation-owned source contract; live IPC; runtime mutation; P12 save consumption; Mod API; live bidirectional synchronization.

## Simulation dependency boundaries

Future projection work needs an agreed domain authority and a read-only contract that maps approved domain data into World Exchange. P12 or P19 decisions matter only where a specific projection question depends on them; Simulation-External does not wait for P12 as a whole. Unsupported concepts and unresolved authority questions should be recorded rather than inferred.

## Current roadmap stage

Stages A (schema and fixtures), B (Web Explorer), and C (Obsidian export/sync prototype) are implemented. Stage D has a corrected read-only projection study and an External-only fixture-backed boundary prototype; Simulation-side source authority and World identity remain unresolved, so no real exporter exists. Runtime exporter implementation requires explicit coordination and authorization. Stages E and F remain future work.

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

Make commits at meaningful durable boundaries. Do not force push or rewrite shared history, and do not modify the Simulation repository. At the last repository inspection for this reference, `main` and `origin/main` both pointed to `02cecd3` with a clean working tree. Re-check `git status -sb` and the remote before relying on later commits: a local commit alone is not remotely durable.

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
