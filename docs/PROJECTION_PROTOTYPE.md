# Fixture-backed Projection Boundary Prototype

## Purpose and limit

This prototype exercises a future read-only boundary entirely inside Simulation-External:

```text
Simulation-like read source
        ↓
world-projection adapter
        ↓
World Exchange v1
        ↓
Web / Obsidian
```

It does not implement or imply a Simulation-owned exporter contract. The source port and mocks are External prototype artifacts. The corrected canonical evidence and readiness classifications remain [the Stage D study](SIMULATION_PROJECTION_STUDY.md) and [entity mapping](SIMULATION_ENTITY_MAPPING.md). No Simulation files are changed.

The package `@simulation-external/world-projection` owns the prototype adapter and its read-only source interface. `@simulation-external/world-schema` remains the sole owner of World Exchange entity contracts and validation. The adapter returns either a schema-validated `WorldExchange` or `exchange: null` with structured omissions. It never fabricates required fields to force a payload.

## Boundary and source shape

`ProjectionSource` is a narrow synchronous read port. Its methods expose only candidate facts needed by this adapter: semantic source IDs, supplied public names/kinds/types, direct City and Location references, active Faction affiliation endpoints, and Item definition candidates. It has no HistoricalEvent read method because no generic retained-event source contract is established. It is not a copied Simulation model and has no Store/runtime/Unity/P12 types. Arrays and records are treated as read-only inputs. There are no write methods.

This interface is not a proposed Simulation contract. Every source implementation would still require Simulation owner review. A future adapter should read only through a Simulation-approved domain read port and translate approved facts into this seam; it must not expose runtime objects or Stores.

The canonical-capability mock leaves World identity unavailable and populates known gaps from the Stage D mapping. Therefore it produces no `WorldExchange`. HistoricalEvent is represented as an unavailable source capability rather than a fabricated event candidate. A separate consumer compatibility mock explicitly owns its `fixture-*` identities and presentation values. It exists only to prove that a complete source can pass through the mapper into the existing Web data helpers and Markdown renderer. None of those fixture values claims to be available from Simulation.

## Identity policy

For concepts with a prototype ID mapper (World, Person, City, Location, Institution, and Faction), the adapter encodes explicit source IDs as:

```text
simulation-external:projection-v1:<entity-kind>:<encodeURIComponent(source-id)>
```

The kind prefix prevents collisions between entity categories. The versioned namespace leaves room for a deliberate mapping migration. Names, filenames, array position, runtime identity, authored-definition identity, and presentation fallbacks are not used as IDs. Identity values must be stable in the source domain and unique within the projected collection. `world-schema` performs final uniqueness and reference validation.

A City authored definition ID is carried separately in the candidate type and is never substituted for a City instance ID. Item definition IDs are not treated as unique held Item IDs. No ID mapping is currently provided for generic Organization, Item, HistoricalEvent, or Relationship records.

## Mapping by World Exchange concept

The status labels below are the corrected Stage D classifications. They describe Simulation concept readiness, not whether a fixture can be made to satisfy the v1 schema.

| Concept         | Stage D status                    | Prototype behavior                                                                                                                                                                                                                                                             |
| --------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| World           | `BLOCKED_BY_CURRENT_ARCHITECTURE` | Requires an explicit source-owned stable ID and name. The canonical-capability mock supplies neither ID nor an exchange. No profile, seed, config, or fixture identity is promoted into Simulation truth.                                                                      |
| Person          | `PARTIALLY_SUPPORTED`             | Maps stable Person identity and a supplied non-empty public name. Current residence and Location references are included only when their referenced City/Location is also projectable. No age, biography, occupation, or authored fallback name is inferred.                   |
| City            | `PARTIALLY_SUPPORTED`             | Maps only an explicitly supplied stable City instance identity and name. An authored definition identity alone is insufficient. A City-to-Location anchor is included only when both rows pass required-field checks.                                                          |
| Location        | `PARTIALLY_SUPPORTED`             | Requires stable identity plus supplied non-empty public name and kind. A stable LocationId alone is omitted because v1 requires both presentation fields. City and parent references require projectable endpoints.                                                            |
| Organization    | `DEFERRED`                        | No source method or mapper exists. `organizations` is empty, and the result records the canonical deferral. Legacy/local records, jobs, faction membership, officeholding, and presence do not synthesize Organization entities.                                               |
| Institution     | `PARTIALLY_SUPPORTED`             | Requires stable Institution identity, supplied name, and supplied type. The canonical mock has identity and display name but no type, so it is omitted. Office incumbency is not treated as general membership.                                                                |
| Faction         | `PARTIALLY_SUPPORTED`             | Requires stable identity and a supplied name. Active affiliation endpoints are included only when both Person and Faction map. They populate direct `Person.factionIds` and `Faction.memberIds`; no generic Relationship is emitted.                                           |
| Item            | `PARTIALLY_SUPPORTED`             | Item definition candidates are always omitted because World Exchange v1 does not define whether Item means a catalog definition, unique object, or stack. Quantity is never copied from aggregate stock. Required `type` is also not established by the canonical Item source. |
| HistoricalEvent | `PARTIALLY_SUPPORTED`             | No event reader is defined; the result records the missing generic source contract, stable ID, lifecycle/retention rule, and time mapping. Current state, choices, chronicles, snapshots, and diffs are not converted into events.                                             |
| Relationship    | `PARTIALLY_SUPPORTED`             | No generic relationship rows are emitted. Active Faction affiliation uses direct v1 membership IDs. Parentage and office links wait for public type, direction, multiplicity, identity, and lifecycle decisions; directed appraisal/Knowledge remains perspective-specific.    |

The complete entity-by-entity authority, stable identity, safe facts, derivable relations, presentation-only data, Knowledge risks, gaps, and future adapter needs are documented in [Simulation Entity Mapping](SIMULATION_ENTITY_MAPPING.md).

## Factual world truth and Knowledge

Only source-owned objective facts can populate World Exchange fields. The port has no actor Knowledge member and the mapper serializes only explicit fields it reads. The mocks carry deliberately out-of-contract Knowledge sidecars so tests can verify that beliefs cannot leak through structural object data.

Political Knowledge, spatial beliefs, route estimates, commercial observations, decision evidence, SocialReaction, and perceived attribution stay outside the factual exchange. The adapter does not aggregate perspectives or convert them into global world claims.

Current facts and retained history also remain distinct. The prototype does not create historical events from a current location, affiliation, office state, decision, outcome presentation, observed change, or snapshot. A future event mapping needs a source-owned durable identity and explicit retained-record, causal/time, participant, and visibility rules.

## Item and relationship semantics

`ItemDefinitionCandidate` represents catalog identity only. Aggregate inventory quantity is an unrelated mock sidecar and is not present in `ProjectionSource`. No quantity becomes an Item count, unique object, owner, or location.

An active Faction affiliation is a directed domain fact from Faction to Person. V1's direct membership fields are sufficient for this prototype's compatibility check. It is not duplicated into `relationships`. No edge ID is created from endpoint hashes. Faction affiliation does not imply political support, loyalty, shared Knowledge, or any other social tie.

## Schema tensions and unsupported mappings

- World Exchange v1 requires `world.id` and `world.name`. Current Simulation architecture has no canonical World identity or name contract. Without both, a valid v1 payload is impossible even if some entities are otherwise projectable.
- Required display fields constrain projection. Person and City need names; Location needs name and kind; Institution needs name and type; Faction needs a name; Item needs name and type; HistoricalEvent needs title and time; Relationship needs endpoint IDs and type. If a source cannot guarantee a field, the adapter omits that entity or relationship.
- City has no generally approved stable instance identity. Authored City definition identity and bounded P14 settlement identity do not automatically identify every City instance.
- Location identity is stable, but its general public name and kind taxonomy are not established.
- Institution office and incumbent records do not define general members, and v1 has no Office entity.
- Item definition, unique instance, stack, quantity, ownership, and market custody do not fit one proven v1 Item mapping.
- Historical record identity and lifetime differ by domain; no common calendar mapping to v1 `year` or `occurredAt` exists.
- Generic Relationship ID, type vocabulary, direction/cardinality, and temporal rules are open. Direct v1 fields may represent a known relation without promoting it to a generic edge.
- Partial fixture projections are useful for consumer verification, but no complete Simulation exchange can be promised until the World blocker is resolved.

The prototype does not relax World Exchange v1 validation or add a parallel entity schema.

## Future adapter responsibilities

A real exporter, after approval, would need to:

1. Read a Simulation-approved, read-only and internally consistent domain view.
2. Join only source-owned stable IDs and explicitly approved crosswalks; keep semantic identity separate from presentation.
3. Select the factual-world-truth policy and exclude holder-scoped Knowledge.
4. Apply per-entity required-field and omission rules without generated labels.
5. Preserve current state, lifecycle history, retained outcomes, and actor decisions as distinct source concepts.
6. Map current references and active memberships only when both endpoints are stable and included.
7. Use a Simulation-approved World identity and an explicit as-of/calendar convention.
8. Validate the final payload with `world-schema`, report structured omissions, and expose only World Exchange values.
9. Leave authoring/import, persistence, transport, synchronization, and mutation outside this read boundary.

## Exact prerequisites for a real exporter

Before a Simulation-backed exporter can be designed as an implementation task, all of these are required:

1. Simulation maintainer approval of an owner-reviewed, read-only projection port and its source lifecycle/versioning.
2. A canonical stable World ID, World name owner, World lifecycle, and as-of/read-consistency rule.
3. Explicit stable identity and required-field policies for each concept claimed as exportable, including City instance crosswalk, Location name/kind, Institution type, Faction name, and Item meaning/type.
4. Approved source-to-World-Exchange ID namespace, encoding, uniqueness, and rename/lifecycle behavior.
5. Relationship semantics for every projected edge: authority, direction, multiplicity, stable ID, and temporal validity. Direct fields must not be duplicated as generic edges without a decision.
6. A selected source-owned retained-event subset with stable identity, retention, causal outcome, time/calendar, participant, Location, and visibility rules.
7. An explicit factual-truth versus actor-Knowledge policy and tests proving Knowledge is absent.
8. Versioned omission/error behavior and conformance tests against schema validation and the Web/Markdown consumers.
9. A separately coordinated implementation plan. This prototype grants no authorization for IPC, REST, sockets, P12 data, runtime mutation, import, live synchronization, or Mod API behavior.

## Open architecture questions

- Which Simulation-owned record defines a World, and how does its stable ID survive profile changes and repeated runs?
- What population of Persons is in projection scope, including dormant, unnamed, dead, or not-yet-materialized identities?
- Which authored names are approved for individual Persons and City instances, and how do renames affect identity?
- How should a residence that currently resolves through a runtime settlement reference be joined to a durable public City identity?
- What are the public name and kind authorities for Location, and how are Hex, Location, Crossing, Site, and local topology distinguished?
- Should World Exchange gain an Office entity, or should office/incumbency remain outside v1?
- Does an Item represent a catalog definition or a unique held object, and where do type, quantity, ownership, and custody belong?
- Which retained outcomes qualify as HistoricalEvent, and how are custom Simulation calendars represented without inventing Gregorian dates?
- Which objective relations are eligible for v1, and what IDs/lifecycle rules apply to genealogy and office links?
- Which package boundary owns an approved source port and integration conformance suite while keeping consumer packages independent?

## Verification performed by the prototype

The deterministic tests cover omission behavior, type-scoped stable ID mapping, active faction affiliation direction, Knowledge and inventory sidecar exclusion, Organization deferral, and direct compatibility with the existing Web data helpers and shared Markdown renderer. The consumer compatibility values are fixture-owned and do not establish Simulation source readiness.
