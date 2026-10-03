# Simulation-External Platform Surface

> Simulation-External is the reusable external integration surface and tooling
> ecosystem for Simulation. Web Explorer and Obsidian are first-party
> reference consumers of that surface, not the definition of the surface
> itself.

## Purpose

Simulation-External defines and supports language-neutral exchange contracts
and reusable tools around those contracts. A developer can consume a
portable World Exchange document without running this repository's apps, a
central service, or Simulation. The file format and
[World Exchange v1 and v2 specification](WORLD_EXCHANGE.md) are the interoperability
contract. TypeScript packages are optional conveniences for consumers that
want the provided parser, validator, serializers, or adapters.

The supported data path is:

```text
Simulation canonical facts (future, coordinated source)
                         ↓
              approved read/projection adapter
                         ↓
             World Exchange v1 or v2 document
                         ↓
             optional `world-io` tooling
              ↙          ↓          ↘
     Web Explorer    Obsidian    any other consumer
```

An independent implementation may read the specification and implement the
same contract in another language. It does not need React, Vite, Obsidian,
`world-markdown`, fixtures, a TypeScript workspace, or a running Simulation
service. The `world-io` package is a supported workspace API; registry
publication and a package distribution policy have not been established.

## Platform layers

| Layer                             | Package or surface                      | Role and stability                                                                                                                                                                                  |
| --------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contract**                      | `@simulation-external/world-schema`     | World Exchange v1/v2 types, stable ID/reference shape, collection coverage, validation semantics, and indexes. This owns the typed contract; its wire compatibility is governed by `schemaVersion`. |
| **Core tooling**                  | `@simulation-external/world-io`         | UTF-8 JSON parsing, schema validation, and deterministic serialization. It depends at runtime only on `world-schema`; it does not map domain sources or define a second schema.                     |
| **Integration / adapter tooling** | `@simulation-external/world-projection` | Experimental External-only candidate-facts adapter prototype. It demonstrates omission reporting and mapping discipline; it is not a Simulation API, source of truth, or stable exporter contract.  |
| **Integration / adapter tooling** | `@simulation-external/world-markdown`   | Markdown rendering and safe vault synchronization helpers. This is useful for Markdown-oriented integrations and is not a dependency of the World Exchange contract or core file tooling.           |
| **Supporting data**               | `@simulation-external/world-fixtures`   | Validated demo and test data. Its sample identities/content carry no production-data or contract-stability guarantee, and it is not required to parse or consume a real portable exchange.          |
| **Reference consumers**           | `apps/web`, `apps/obsidian-plugin`      | First-party applications that exercise the same exchange. Their UI state, navigation, vault integration, and other internals are not platform contracts.                                            |

Applications depend on the platform directionally. Reusable packages must not
depend on either application. Test-only dependencies used to prove
cross-package compatibility do not add runtime edges; package manifests and
package entry points define the declared workspace/build boundary.

## Supported package entry points

Each workspace package exposes its package root (`@simulation-external/<name>`)
through its `exports` map. Consumers should use those declared root entry
points, not reach into `src`, `dist`, tests, or private implementation files.

### Contract: `world-schema`

The intended contract exports are `WorldExchange`, `WorldExchangeV1`,
`WorldExchangeV2`, `WorldExchangeCollectionCoverage`,
`WorldExchangeCollectionCoverageStatus`, `WorldExchangeCollectionName`,
`EffectiveCollectionCoverage`, `WorldEntity`,
`WorldExchangeIndex`, the entity and JSON types, validation issue/result
types, `validateWorldExchange`, and the generic index helpers
`buildWorldExchangeIndex` and `getWorldEntityById`. Entity fields,
requiredness, ID/reference rules, and schema-version semantics are defined by
the wire contract, not by a particular consumer. Private validation
definitions and helper functions inside the package are implementation
details.

### Core tooling: `world-io`

The supported package-root API is:

- `parseWorldExchange(string | Uint8Array | ArrayBuffer)`;
- `validateWorldExchange(unknown)`;
- `serializeWorldExchange(unknown)`;
- `WorldExchange`, `ValidationIssue`, and `ValidationResult` types;
- `WorldExchangeParseError`, `WorldExchangeValidationError`, and
  `WorldExchangeSerializationError`.

The exported key-sorting routine and parser implementation are private. The
package delegates all entity validation to `world-schema`. Consumers do not
need fixtures, projection candidates, or Markdown models.

### Integration and adapter surfaces

`world-projection` exports `projectWorldExchange`, `toWorldExchangeId`, and
its candidate/omission types. These APIs are prototype-level and may evolve as
Simulation authority decisions are made; its current `ProjectionSource` is an
External test port, not a Simulation-owned source contract.

`world-markdown` exports Markdown note/vault/result types, generated-region
markers, `SimulationIdConflictError`, `renderWorldMarkdownNotes`,
`syncWorldMarkdown`, and `mergeExistingNote`. They are specific to Markdown
output and vault ownership. An exchange consumer that does not produce
Markdown has no reason to depend on this package.

`world-fixtures` exports `worldFixture` and its validated alias for demos and
tests. These exports are sample data, not part of the World Exchange schema
and not a production source dependency.

## Minimal consumer workflow

For a TypeScript consumer using the provided package, a portable file can be
read as text and parsed into the exported `WorldExchange` type:

```ts
import {
  parseWorldExchange,
  type WorldExchange,
} from "@simulation-external/world-io";

const world: WorldExchange = parseWorldExchange(text);
const worldId = world.world.id;
const people = world.people;
```

`parseWorldExchange` decodes/accepts JSON, rejects malformed input, and
validates against World Exchange v1 or v2. V1 coverage is exposed as
`LEGACY_UNKNOWN`; v2 uses its required producer-declared coverage map. Parsing
does not repair data or synthesize IDs. The complete runnable proof, including a local `*.world.json` sample, is
in [`examples/minimal-consumer`](../examples/minimal-consumer/README.md).
That example has one runtime dependency, `world-io`, which in turn depends on
`world-schema`; it imports no app, fixture, projection, or Markdown code.

The package is not a mandatory gateway: a CLI, native app, VTT, mobile app,
analytics tool, or other-language consumer can implement the documented JSON
contract directly. No consumer needs to run Web Explorer, Obsidian, or any
Simulation-External server.

## Dependency direction

Runtime dependencies point from tooling/consumers toward the contract:

```text
world-io ───────────────┐
world-projection ───────┤
world-markdown ─────────┼──> world-schema
world-fixtures ────────┘

minimal-consumer ─────────> world-io ──> world-schema
Web Explorer ────────────> world-io + world-schema + demo fixtures
Obsidian Plugin ─────────> world-io + world-markdown + demo fixtures
```

`world-projection` has development-only compatibility tests that exercise
portable I/O and Markdown rendering. `world-io` uses the fixture package only
in its test suite. Neither creates a production dependency on an adapter,
fixture, Web, or Obsidian package. The Web app imports contract types from
`world-schema` and typed parsing from `world-io`; these are both platform
packages. `world-schema` has no consumer dependency.

## Consumer pressure and contract evolution

A request from Web Explorer or Obsidian does not automatically become a
World Exchange requirement. Before changing the contract, classify the need
as one of:

1. a genuine external domain fact;
2. reusable integration capability;
3. presentation behavior;
4. consumer-specific convenience.

Only a cross-consumer domain fact with an approved source/meaning belongs in
the shared domain contract. Reusable transformations may belong in a tooling
package. Presentation belongs in the app when appropriate. Consumer
convenience must not silently become mandatory schema. This preserves the
Stage D.1 distinction between shared facts, optional labels, and consumer
fallbacks.

## Compatibility expectations

- **Contract:** `schemaVersion` is the World Exchange wire-compatibility
  signal. Changes to field meaning or required shape need explicit
  compatibility review and, when breaking, a new version/coexistence or
  migration plan. Package version and schema version are different concepts.
- **Core tooling:** exported package-root APIs may evolve, but API changes are
  intentional and validated against the contract. Parser/serializer behavior
  does not redefine wire semantics.
- **Adapter tooling:** narrower and integration-specific. The projection
  prototype is explicitly unstable; Markdown helpers evolve for their
  ownership rules without imposing requirements on the core schema.
- **Reference applications:** internal state and UI may evolve freely while
  consuming the supported platform surfaces. App behavior does not imply
  compatibility guarantees for app internals.
- **Distribution:** no package publication or external registry support is
  promised by this stage. The portable specification remains implementable
  without installing these TypeScript packages.

## Authority, readiness, and future exporter

Stage D.4 adds collection coverage to the External contract without changing
the current real-Simulation readiness:

| World Exchange concept                                                   | Current readiness for real Simulation projection                                                            |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| World                                                                    | `PARTIALLY_SUPPORTED` — WI-A supplies stable `WorldId`; no approved External read port or ID mapping exists |
| Faction                                                                  | `READY_TO_PROJECT` conceptually                                                                             |
| Person, City, Location, Institution, Item, HistoricalEvent, Relationship | `PARTIALLY_SUPPORTED`                                                                                       |
| Organization                                                             | `DEFERRED`                                                                                                  |

Those labels describe Simulation source readiness, not whether fixture/project
World Exchange documents can use the schema. Consult the [projection study](SIMULATION_PROJECTION_STUDY.md),
[entity mapping](SIMULATION_ENTITY_MAPPING.md), and
[Stage D.1 pressure review](WORLD_EXCHANGE_CONTRACT_PRESSURE_REVIEW.md) for
the evidence and unresolved field decisions. In particular, actor-specific
Knowledge is not factual world truth, current state does not create historical
events, and presentation labels/filenames do not provide domain identity.

The eventual producer path is:

```text
Simulation canonical facts
          ↓
approved read-only projection port
          ↓
Simulation-side adapter/exporter (one producer)
          ↓
World Exchange v1 or v2
          ↓
optional world-io / portable `*.world.json`
          ↓
any consumer, including Web and Obsidian
```

The exporter must be approved with Simulation architecture owners and map
authoritative domain facts into the public contract. It must not make the
contract Simulation-runtime-specific. World Exchange remains the
interoperability contract; this repository is not a mandatory runtime
service.

## Relationship to P12 and P19

P12 persistence, World Exchange, and portable `*.world.json` are distinct.
P12 preserves Simulation continuation state; World Exchange is a read-oriented
external projection; JSON is one portable encoding of that projection. No
External tooling consumes P12.

P19 extends Simulation mechanics, such as rules, hooks, world generation, and
gameplay/system modifications. Simulation-External serves approved external
consumption and eventual integration through separate contracts. External
does not depend on or become P19. Any future authoring/import path requires a
separate Simulation-approved mutation contract and does not turn this
platform into the mod system.

## Explicit non-goals

This surface is not a REST/HTTP service, WebSocket, IPC layer, daemon, central
gateway, or live Simulation connection. It adds no runtime mutation,
write-back, P12 reader, Mod API behavior, or file watcher connected to
Simulation. Those decisions remain out of scope and require separate
architecture approval.
