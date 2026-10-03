# Fixture-backed Projection Boundary Prototype

## Purpose and limit

This prototype exercises a future read-only boundary entirely inside Simulation-External:

```text
Simulation-like read source
        ↓
world-projection adapter
        ↓
World Exchange v2
        ↓
Web / Obsidian
```

It does not implement or imply a Simulation-owned exporter contract. The source port and mocks are External prototype artifacts. The corrected canonical evidence and readiness classifications remain [the Stage D study](SIMULATION_PROJECTION_STUDY.md) and [entity mapping](SIMULATION_ENTITY_MAPPING.md). No Simulation files are changed.

The package `@simulation-external/world-projection` owns the prototype adapter and its read-only source interface. `@simulation-external/world-schema` remains the sole owner of World Exchange entity contracts and validation. The adapter returns either a schema-validated v2 `WorldExchange` or `exchange: null` with structured omissions. An included source collection that cannot be mapped completely fails closed; the prototype never emits a partial array labeled complete or fabricates required fields to force a payload.

## Boundary and source shape

`ProjectionSource` is a narrow synchronous read port. Its methods expose only candidate facts needed by this adapter: semantic source IDs, supplied public names/kinds/types, direct City and Location references, active Faction affiliation endpoints, and Item definition candidates. `readCollectionCoverage()` explicitly declares one of the four v2 statuses for every collection. It has no HistoricalEvent read method because no generic retained-event source contract is established. It is not a copied Simulation model and has no Store/runtime/Unity/P12 types. Arrays and records are treated as read-only inputs. There are no write methods.

This interface is not a proposed Simulation contract. Every source implementation would still require Simulation owner review. A future adapter should read only through a Simulation-approved domain read port and translate approved facts into this seam; it must not expose runtime objects or Stores.

The canonical-capability mock does not supply a World identity because this External-only prototype has no approved Simulation read port or WorldId mapping. Therefore it produces no `WorldExchange`; this is not evidence that Simulation lacks a World identity. Promoted WI-A provides a stable typed `WorldId`, while how an approved read port exposes it and maps it to World Exchange `world.id` remains open. HistoricalEvent is declared unsupported rather than represented by a fabricated event candidate. A separate consumer compatibility mock explicitly owns its `fixture-*` identities, whole-fixture coverage declarations, and optional presentation values. It proves both labeled and unlabeled v2 exchanges pass through the existing Web data helpers and Markdown renderer. None of those fixture values claims to be available from Simulation.

## Identity policy

For concepts with a prototype ID mapper (World, Person, City, Location, Institution, and Faction), the adapter encodes explicit source IDs as:

```text
simulation-external:projection-v1:<entity-kind>:<encodeURIComponent(source-id)>
```

The kind prefix prevents collisions between entity categories. The versioned namespace leaves room for a deliberate mapping migration. Names, filenames, array position, runtime identity, authored-definition identity, and presentation fallbacks are not used as IDs. Identity values must be stable in the source domain and unique within the projected collection. `world-schema` performs final uniqueness and reference validation.

A City authored definition ID is carried separately in the candidate type and is never substituted for a City instance ID. Item definition IDs are not treated as unique held Item IDs. No ID mapping is currently provided for generic Organization, Item, HistoricalEvent, or Relationship records.

## Mapping by World Exchange concept

The status labels below are the corrected Stage D classifications. They describe Simulation concept readiness, not whether a fixture can be made to satisfy the v2 schema.

| Concept         | Stage D status        | Prototype behavior                                                                                                                                                                                                                                                                                           |
| --------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| World           | `PARTIALLY_SUPPORTED` | WI-A provides a stable typed `WorldId`; this prototype has no approved source port or External ID mapping, so its canonical-capability mock supplies no ID and produces no exchange. No profile, seed, config, or fixture identity is promoted into Simulation truth.                                        |
| Person          | `PARTIALLY_SUPPORTED` | Maps stable Person identity with an optional supplied public name. Current residence and Location references are included only when their referenced City/Location is projectable. Scope, age, biography, occupation, and location edge cases remain unresolved.                                             |
| City            | `PARTIALLY_SUPPORTED` | Maps only an explicitly supplied stable City instance identity; name is optional. An authored definition identity alone is insufficient. A City-to-Location anchor is included only when both IDs and required Location kind are available.                                                                  |
| Location        | `PARTIALLY_SUPPORTED` | Requires stable identity and public kind; name is optional. City and parent references require projectable endpoints and approved relation semantics.                                                                                                                                                        |
| Organization    | `DEFERRED`            | No source method or mapper exists. `organizations` is empty and marked `UNSUPPORTED` by the prototype. Legacy/local records, jobs, faction membership, officeholding, and presence do not synthesize Organization entities.                                                                                  |
| Institution     | `PARTIALLY_SUPPORTED` | Requires stable Institution identity and supplied type; name is optional. The canonical mock has identity but no type, so it is omitted. Office incumbency is not treated as general membership.                                                                                                             |
| Faction         | `READY_TO_PROJECT`    | Maps stable identity with an optional name. Active affiliation endpoints are included only when both Person and Faction map. They populate direct `Person.factionIds` and `Faction.memberIds`; no generic Relationship is emitted.                                                                           |
| Item            | `PARTIALLY_SUPPORTED` | Item definition candidates are always omitted because the exchange does not define whether Item means a catalog definition, unique object, or stack. The collection is `UNSUPPORTED`; quantity is never copied from aggregate stock. Required `type` is not established.                                     |
| HistoricalEvent | `PARTIALLY_SUPPORTED` | No event reader is defined; the collection is `UNSUPPORTED` and the result records the missing generic source contract, stable ID, lifecycle/retention rule, and time mapping. Current state, choices, chronicles, snapshots, and diffs are not converted into events.                                       |
| Relationship    | `PARTIALLY_SUPPORTED` | No generic relationship rows are emitted and the collection is `UNSUPPORTED`. Active Faction affiliation uses direct membership IDs. Parentage and office links wait for public type, direction, multiplicity, identity, and lifecycle decisions; directed appraisal/Knowledge remains perspective-specific. |

The complete entity-by-entity authority, stable identity, safe facts, derivable relations, presentation-only data, Knowledge risks, gaps, and future adapter needs are documented in [Simulation Entity Mapping](SIMULATION_ENTITY_MAPPING.md).

## Factual world truth and Knowledge

Only source-owned objective facts can populate World Exchange fields. The port has no actor Knowledge member and the mapper serializes only explicit fields it reads. The mocks carry deliberately out-of-contract Knowledge sidecars so tests can verify that beliefs cannot leak through structural object data.

Political Knowledge, spatial beliefs, route estimates, commercial observations, decision evidence, SocialReaction, and perceived attribution stay outside the factual exchange. The adapter does not aggregate perspectives or convert them into global world claims.

Current facts and retained history also remain distinct. The prototype does not create historical events from a current location, affiliation, office state, decision, outcome presentation, observed change, or snapshot. A future event mapping needs a source-owned durable identity and explicit retained-record, causal/time, participant, and visibility rules.

## Item and relationship semantics

`ItemDefinitionCandidate` represents catalog identity only. Aggregate inventory quantity is an unrelated mock sidecar and is not present in `ProjectionSource`. No quantity becomes an Item count, unique object, owner, or location.

An active Faction affiliation is a directed domain fact from Faction to Person. The direct membership fields retained from v1 are sufficient for this prototype's compatibility check. It is not duplicated into `relationships`. No edge ID is created from endpoint hashes. Faction affiliation does not imply political support, loyalty, shared Knowledge, or any other social tie.

## Schema tensions and unsupported mappings

- World Exchange v1 and v2 require a `world` scope object and `world.id`; `world.name` is optional. Simulation's promoted WI-A architecture provides a stable `WorldId`, but no approved read port or mapping into `world.id` exists, so this disconnected prototype still cannot produce a Simulation-backed payload. V2 also requires whole-World collection authorities and a compatible source-consistent read cut.
- Display names are optional for World, Person, City, Location, Organization, Institution, Faction, and Item. Required domain semantics remain: Location kind; Organization, Institution, and Item type; HistoricalEvent title and time; Relationship endpoint IDs and type. A source-owned label may be included, but no label is synthesized.
- City has no generally approved stable instance identity. Authored City definition identity and bounded P14 settlement identity do not automatically identify every City instance.
- Location identity is stable, but its required public kind taxonomy is not established.
- Institution office and incumbent records do not define general members, and neither v1 nor v2 has an Office entity.
- Item definition, unique instance, stack, quantity, ownership, and market custody do not fit one proven Item mapping.
- Historical record identity and lifetime differ by domain; no common calendar mapping to `year` or `occurredAt` exists.
- Generic Relationship ID, type vocabulary, direction/cardinality, and temporal rules are open. Direct membership fields may represent a known relation without promoting it to a generic edge.
- V2 cannot label partial fixture rows as a complete collection. A producer must either provide the complete collection, deliberately omit it with an empty array, or fail export; no Simulation-backed exchange can be promised while approved WorldId exposure/mapping and collection authority remain unresolved.

The prototype does not relax World Exchange validation or add a parallel entity schema.

## Future adapter responsibilities

A real exporter, after approval, would need to:

1. Read a Simulation-approved, read-only and internally consistent domain view with complete whole-World enumeration for every collection it marks `INCLUDED` or `KNOWN_EMPTY`.
2. Join only source-owned stable IDs and explicitly approved crosswalks; keep semantic identity separate from presentation.
3. Select the factual-world-truth policy and exclude holder-scoped Knowledge.
4. Apply per-entity required-field and omission rules without generated labels.
5. Preserve current state, lifecycle history, retained outcomes, and actor decisions as distinct source concepts.
6. Map current references and active memberships only when both endpoints are stable and included.
7. Use a Simulation-approved World identity and an explicit as-of/calendar convention.
8. Require one compatible source-consistent cut across included collections and their references; `Unavailable` or inconsistent reads block export.
9. Validate the final v2 payload with `world-schema`, report structured omissions, and expose only World Exchange values.
10. Leave authoring/import, persistence, transport, synchronization, and mutation outside this read boundary.

## Exact prerequisites for a real exporter

Before a Simulation-backed exporter can be designed as an implementation task, all of these are required:

1. Simulation maintainer approval of an owner-reviewed, read-only projection port and its source lifecycle/versioning.
2. An approved read-port exposure and External mapping for WI-A `WorldId`, compatibility rules for older or migrated Worlds without that identity, full-collection authorities, and a compatible as-of/read-consistency rule. A World display name is optional.
3. Explicit stable identity and required-field policies for each concept claimed as exportable, including City instance crosswalk, Location kind, Institution type, and Item meaning/type. Optional labels must be source-owned when present.
4. Approved source-to-World-Exchange ID namespace, encoding, uniqueness, and rename/lifecycle behavior.
5. Relationship semantics for every projected edge: authority, direction, multiplicity, stable ID, and temporal validity. Direct fields must not be duplicated as generic edges without a decision.
6. An approved full-World retained-history authority (or explicit empty proof) and source-owned event rules for stable identity, retention, causal outcome, time/calendar, participants, Locations, and visibility. V2 cannot label a partial history window complete.
7. An explicit factual-truth versus actor-Knowledge policy and tests proving Knowledge is absent.
8. Versioned omission/error behavior and conformance tests against schema validation and the Web/Markdown consumers.
9. A separately coordinated implementation plan. This prototype grants no authorization for IPC, REST, sockets, P12 data, runtime mutation, import, live synchronization, or Mod API behavior.

## Open architecture questions

- Which Simulation-owned record defines a World, and how does its stable ID survive profile changes and repeated runs?
- What population of Persons is in projection scope, including dormant, unnamed, dead, or not-yet-materialized identities?
- Which authored display names may be exposed for Persons and City instances, and how do renames affect the displayed value independently of identity?
- How should a residence that currently resolves through a runtime settlement reference be joined to a durable public City identity?
- What is the public kind authority for Location, and how are Hex, Location, Crossing, Site, and local topology distinguished? A display name is optional.
- Should a future World Exchange version gain an Office entity, or should office/incumbency remain outside the shared contract?
- Does an Item represent a catalog definition or a unique held object, and where do type, quantity, ownership, and custody belong?
- Which retained outcomes qualify as HistoricalEvent, and how are custom Simulation calendars represented without inventing Gregorian dates?
- Which objective relations are eligible for the current contract, and what IDs/lifecycle rules apply to genealogy and office links?
- Which package boundary owns an approved source port and integration conformance suite while keeping consumer packages independent?

## Verification performed by the prototype

The deterministic tests cover omission behavior, type-scoped stable ID mapping, active faction affiliation direction, Knowledge and inventory sidecar exclusion, Organization deferral, and direct compatibility with the existing Web data helpers and shared Markdown renderer. The consumer compatibility values are fixture-owned and do not establish Simulation source readiness.
