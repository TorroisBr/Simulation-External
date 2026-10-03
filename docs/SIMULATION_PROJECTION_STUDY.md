# Simulation to World Exchange Read Projection Study

## Purpose and decision

This Stage D study records canonical source evidence, entity-field mapping limits, identity rules, and decisions required before an exporter can be built. Its original field analysis targets the World Exchange v1 entity shape. World Exchange v2 now adds whole-World collection coverage; that External-owned completeness contract is documented in [Collection Coverage](WORLD_EXCHANGE_COLLECTION_COVERAGE.md) and is an additional prerequisite, not a new Simulation source capability. This study authorizes no runtime integration, transport, persistence reading, authoring, or import.

The previous study used Simulation main at 002a55859544d1e26247c274e6d52590fa671a90 as its source baseline. That ref did not contain the promoted phase architecture and States listed below. Its claims that durable Person, Institution, Faction, and stable Location authorities were absent are superseded. They described that inspected main tree, not current canonical architecture. The previous study also treated a legacy Organization runtime as current authority; canonical architecture explicitly defers generic Organization. The mapping document corrects those conclusions and retains questions that still apply.

Preferred flow: Simulation-owned domain authority → Simulation-approved read-only projection port → External World Exchange mapper and validator → Web, Obsidian, and future tools.

World Exchange remains the external read model. P12 remains a separate persistence and continuation effort. This study does not establish a Simulation exporter contract or declare a complete World Exchange payload ready.

## Canonical Simulation evidence inspected

Simulation source inspection was read-only and used only the ignored `.references/Simulation` mirror. It did not inspect the sibling checkout. The current canonical Phase 12 State is `6b30d86c3214a98603bea809154e2dc06047d6a3`; the approved architecture baseline and promoted implementation refs below are recorded separately.

| Evidence                              | Canonical ref                            | Relevance                                                                                                                                       |
| ------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture baseline                 | 451340c56e9b676bf6ea43412bcb856b9ccde3de | Current approved §§91A–91B: durable WorldId semantics and factual-projection direction; design authority, not by itself implementation evidence |
| Current Phase 12 State                | 6b30d86c3214a98603bea809154e2dc06047d6a3 | Current canonical delivery record for promoted WI-A identity, FR-B factual reads, FR-C Faction facts, and their explicit limitations            |
| WI-A WorldId implementation           | 3b39e0d89858dce517ad72cbb76da621eb954bad | Typed `WorldId` source and bootstrap integration; stable ID exists in Simulation, but no World Exchange exporter/read port is established       |
| WI-A current-base revalidation        | 242ae6bf81c2f4da832be1e7948bbaac004a620b | Promoted current-base bootstrap/admission revalidation; does not add a World Exchange producer or factual read cut                              |
| FR-B core factual-read implementation | 0ad19ecd9633e01d358a9ff826ca3ca5f8e3627c | Bounded, capability-scoped factual reads; no general whole-World collection guarantee                                                           |
| FR-B live read implementation         | aeb76c687d00a49f505ab264a58a508a20e4923b | Promoted live factual-read boundary; its selected cut does not establish collection coverage for an External artifact                           |
| FR-C Faction facts                    | ec042b30b1c0a390f611c47cb22b75631cfb9556 | Promoted copied Faction facts and active affiliations; does not supply Person collection enumeration or World Exchange output                   |
| Phase 5                               | 3c3a5a7fa5bac8f301b98ec92307eadb19af25ff | PersonId and PersonStore; aggregate population; residence; genealogy; world-owned Institutions and Offices; mortality and continuity            |
| Phase 6                               | 77b139437407a92e52e08b40f885c8d1b606dee2 | Faction identity/affiliation; holder-scoped political Knowledge; generic Organization and C3 relationship projection explicitly deferred        |
| Phase 7                               | 1f4651e99db2c357dd3be3c6b9284d104379f706 | Stable HexId/LocationId authority; battle outcome and downstream event distinction                                                              |
| Phase 8                               | 470667d37863384edadb3d93ef64d8004aff46a3 | Factual geography, City/Site anchors, Person position and actor Knowledge boundaries                                                            |
| Phase 9                               | 82396ae7ffaf407fda278928da456b06dc5394d4 | Historical phase scope: authored bootstrap and a bounded Hex/Location source; its lack of WorldId predates the later §91A/WI-A decision         |
| Phase 10                              | 252ad6b9a507f1c001c05a1e19c2546ebd0707a2 | Ruin/LocalTopology is a bounded Location consumer, not a replacement Location authority                                                         |
| Phase 11                              | 308e24d0744112e8f2b741521b8b3e4acb51ebbf | Actor choice uses PersonId; choice/intent is separate from outcome                                                                              |
| Phase 14                              | 4caecbbfb0464c965811402b3c11d8717605114a | Bounded material flow; settlement ownership, market custody, item definition and authored P14 identities                                        |
| Phase 18                              | 8ac2d7885ea1f00d544d88a64bf918a411934f7f | Logical time, causal order, and activity identity boundaries                                                                                    |
| Phase 20                              | 7a81cc0ecbc511dd36c248ec62c7b20f7e477f53 | ActivityInstanceId, definition, and participant identities are distinct; activity is not automatically a HistoricalEvent                        |

Reviewed source/document paths include the exact-ref Simulation `AGENTS.md`, `docs/SIMULATION_ARCHITECTURE.md`, current `docs/PHASE12_STATE.md`, relevant Phase 5–20 State/design records, `WorldIdentity.cs`, `SimulationBootstrapComposition.cs`, `SimulationRuntime.cs`, `PersonId.cs` and `PersonRuntime.cs`, `InstitutionContracts.cs`, `FactionContracts.cs`, `CityData.cs` and `CityRuntime.cs`, `ItemData.cs`, `SpatialAuthority.cs`, `FactualRead/FactionFactualReader.cs`, and the P14-A, P11, P18, and P20 checkpoint records. Phase 12 State was read as delivery evidence, not as a data source. No P12 snapshot, persistence, receipt, hydration, save, or continuation structure is used as a projection source.

## Classification meanings and result

These labels apply to each World Exchange entity mapping, not to complete-payload or exporter readiness.

- READY_TO_PROJECT: Canonical Simulation authority has stable identity and required entity facts for a bounded mapping. A shared port, ID encoding, collection-coverage proof, and mapper remain future work.
- PARTIALLY_SUPPORTED: Facts exist, but at least one required field, identity, lifecycle, or relationship meaning is missing or ambiguous.
- BLOCKED_BY_CURRENT_ARCHITECTURE: A required concept/authority is absent or conflicts with an explicit current ownership boundary.
- DEFERRED: Simulation architecture explicitly leaves the concept outside promoted scope.

| Concept         | Classification      |
| --------------- | ------------------- |
| World           | PARTIALLY_SUPPORTED |
| Person          | PARTIALLY_SUPPORTED |
| City            | PARTIALLY_SUPPORTED |
| Location        | PARTIALLY_SUPPORTED |
| Organization    | DEFERRED            |
| Institution     | PARTIALLY_SUPPORTED |
| Faction         | READY_TO_PROJECT    |
| Item            | PARTIALLY_SUPPORTED |
| HistoricalEvent | PARTIALLY_SUPPORTED |
| Relationship    | PARTIALLY_SUPPORTED |

The World classification changed after the earlier mapping: promoted WI-A now provides a typed, stable `WorldId`. This makes the required World identity fact available, but does not provide a Simulation-owned World Exchange read port, approve External ID encoding, define a display name, or prove whole-World collection coverage. Faction likewise has a bounded mapping: canonical Faction records have a stable FactionId, and current members are explicit PersonId-based affiliations. Stage D.1 made display names optional because they are not identity or domain validity; a missing label no longer blocks a Faction row. These classifications describe entity mapping only. A common read port, one compatible source cut, v2 collection-completeness proof, and reciprocal membership-field policy remain cross-cutting prerequisites. Per-entity evidence and all requested mapping dimensions are in [Simulation Entity Mapping](SIMULATION_ENTITY_MAPPING.md) and the [contract pressure review](WORLD_EXCHANGE_CONTRACT_PRESSURE_REVIEW.md).

## Proposed projection boundary

Simulation should own or approve the read port because Simulation owns the semantics separating fact, actor Knowledge, and derived views. WI-A supplies a stable `WorldId`, and FR-B/FR-C supply bounded factual-read capabilities; neither is a complete World Exchange port. The future port should read reviewed domain authorities at one documented coherent boundary and return purpose-built immutable projection data. It should not return public runtime classes, internal Stores, Unity objects, diagnostics snapshots, or persistence records.

External should own a separate mapper from that approved input to World Exchange v2 and validate the result with `@simulation-external/world-schema`. The mapper must not reference the Simulation assembly or make domain decisions. It may omit unsupported optional values and must fail closed on missing required facts, ambiguous IDs, incomplete included collections, duplicates, and dangling references. V2 coverage is an additional claim that requires complete whole-World source authority, not merely a successful bounded read.

Assembly/repository ownership, contract sharing, and invocation point remain open. Invocation and transport are separate decisions. No IPC, REST, socket, or in-Simulation server is proposed. A read must not start or advance Simulation, mutate domain state, hydrate state, or load a save.

A future input needs an explicitly selected World identity and coherent as-of boundary. World Exchange v1 and v2 have no snapshot timestamp. V2 requires included collections and their references to share one compatible source-consistent read boundary, but it does not publish freshness metadata. Do not hide snapshot time, source Stores, runtime classes, or continuation state in metadata.

### ID mapping strategy

Simulation semantic IDs and World Exchange string IDs are separate contracts. A mapper should use an explicit table keyed by entity kind and source identity, then encode a non-empty World Exchange ID unique across all entities in one payload. Type prefixes plus a defined escaping or length-prefix rule are candidates, not approved Simulation ID semantics.

Use canonical semantic IDs where available: PersonId, InstitutionId, FactionId, LocationId, and ItemData.DefinitionId only if the chosen World Exchange meaning is an item definition. Do not substitute names, filenames, Unity asset GUIDs, runtime allocator values, array positions, or consumer paths.

CityData.DefinitionId identifies authored City data, not a generally approved City instance. P14-A settlementSemanticId is for its bounded material-flow owner; it is not evidence of a universal CityId. Person residence currently refers through a runtime settlement identifier and needs an approved City crosswalk. Domain event and generic relationship IDs need their own lifecycle rules. If a source lacks stable semantic identity, omit or block it; do not hash names or invent source IDs.

Simulation now provides a stable typed `WorldId`, with canonical `Value` form `world:<32 lowercase hexadecimal digits>`, allocated for a new causal World continuation by the promoted WI-A bootstrap path. A configuration label, authored profile name, seed, Unity asset identity, scenario, or runtime instance is not interchangeable with that identity. External still needs an owner-reviewed mapping from that source identity to `world.id` and an approved read path; it must not read the identity from P12 persistence.

## Factual-world-truth policy

Project only facts from their owning Simulation authority at the selected read boundary. Preserve distinctions among authored definitions, current state, population aggregates, and retained history. Current membership, position, residence, and authority must come from their respective current sources.

An actor's observation, inference, received information, political position, or appraisal is not global truth. Execution may revalidate truth after a decision; decision evidence does not replace that truth. UI read models, logs, chronicle prose, action text, utility scores, diagnostics, and fallback strings do not become facts by being readable.

Specific v1 rules:

- Person.age is derived from factual birth day, the Simulation calendar, and an agreed as-of day.
- Person.locationId may reference a resolved LocationId only when a Person is At that Location. Hex-only positions and crossings are not World Exchange Locations by implication. InTransit needs an explicit rule.
- Person.residenceId is a City relation, not current presence. Residence currently uses a runtime settlement identifier and needs a stable City mapping.
- City.populationSummary may describe authoritative aggregate population only with agreed wording and as-of semantics. Never materialize aggregates as invented People.
- Stable LocationId and its Hex anchor do not supply a public Location kind. Location name is optional in v1. Do not synthesize either a label or kind from City names, runtime graph labels, Hex IDs, Ruin names, or filenames.
- Faction.memberIds may reflect active FactionAffiliationRecord facts. Ended affiliations are historical, not current membership.
- Institution office incumbency is not general Institution membership.

World Exchange metadata is not an escape hatch for Simulation internals.

## Knowledge projection policy

Neither World Exchange v1 nor v2 has an actor-scoped Knowledge, observer, belief, provenance, or freshness contract. Omit Knowledge from the factual payload.

This excludes spatially known Locations/routes, commercial observations, and political observations held by Person, Institution, or Faction. Political Knowledge is independently holder-scoped and does not flow to Faction members. A merchant observation is not current global stock or price.

NpcRelationRuntime affinity/trust/fear values are directed actor assessments, not objective reciprocal relationships. SocialReaction, support, recognition, interpretation, and legitimacy likewise must not be flattened into factual Relationship or Faction fields. A future need for perspective data requires a separate actor-scoped, provenance-aware contract.

## Current state and HistoricalEvent strategy

Current state and historical evidence have distinct source and inclusion rules. Do not reconstruct history from current truth, and do not use a domain event as the source of current truth.

Simulation has bounded authoritative histories: Phase 5 institutional tenure and explicit property/estate continuity; Phase 6 claim/recognition and affiliation records; Phase 7 terminal Battle outcome/provenance and downstream BattleResolved evidence. These are domain-owned records, not one universal public event stream. DomainEventStore and HistoryStore have different lifetime and retention rules. A current-runtime event sequence is not automatically cross-run public history. No general HistoricalEventId contract was found.

Only separately approved mappings from retained outcome/history records may become World Exchange HistoricalEvents. Actor choices, directives, activities, proposals, chronicle views, and diagnostics do not prove an outcome. ActivityInstanceId is an activity identity, not an event identity. Do not synthesize events from current death/status/location or decisions.

World Exchange v1 requires a title and either a finite year or non-empty occurredAt. Simulation uses absolute days and custom calendars, with finer logical time. The mapping needs an explicit calendar/version rule and precision. Do not treat an absolute day as Gregorian or a logical instant as occurredAt by assumption. Event scope, retention, identity across restart, participants, visibility, order, and time precision remain open.

## World Exchange and P12 persistence

World Exchange is a read-oriented external projection. P12 is a separate Simulation persistence/continuation architecture with its own completeness and lifecycle gates. The P12 State at f538a096bf4b2558566518483bc60f0129718a3 records P12-A waiting and P12-B incomplete. This was consulted only to confirm the boundary and not as a contract to copy.

The future projection reads approved domain authority through its own port. It must not consume P12 snapshots, persistence receipts, mutation epochs, hydration internals, save formats, or continuation state. Diagnostic snapshots and canonical writers also are not an exporter contract.

This study defines read-only projection only. Future authoring/import is a separate direction requiring its own Simulation-approved write contract, field ownership, validation, conflict policy, and authorization.

## Future adapter responsibilities

1. Simulation's port selects a coherent source cut and returns only approved immutable facts, semantic identities, and documented time context.
2. The External mapper converts those facts into defined v1 fields, applies the agreed public ID map, omits unsupported optional facts, resolves references, and validates the payload.
3. The adapter preserves ownership/lifecycle, keeps Knowledge separate, maps only approved retained history, avoids redundant graph edges when direct v1 membership fields apply, and produces deterministic output for equivalent source states.
4. It exposes no Simulation runtime class, Store, Unity type, persistence format, or consumer presentation. It has no mutation or authoring responsibility.

## Exact prerequisites for a real exporter

1. Simulation architecture owners accept or revise the mapping and name the owning source and meaning for every field.
2. Use the promoted WI-A WorldId and §91A continuation semantics. Simulation owners must approve how the read port exposes it, and resolve compatibility for older or migrated Worlds that may not have a WI-A identity. Do not replace WorldId with a profile, config name, or seed.
3. Simulation approves stable instance identity and duplicate/rename/reuse/deletion rules for each projected Person and City not covered by a suitable semantic ID. It defines residence, Location, Hex, and transit mapping.
4. Resolve missing required v1 facts: Location kind; Organization authority/type/membership; Institution type/membership/location; Item type and definition/instance/stack semantics. Display names are optional and must remain source-owned if supplied. Schema additions such as quantity, coordinates, office, birth representation, or snapshot-time fields require separate semantic review.
5. Approve public Faction, Organization, Institution, and Relationship semantics, including direct fields versus general edges and current versus historical membership.
6. Define retained HistoricalEvent sources, event IDs, retention/visibility, participants/locations, custom-calendar conversion, and as-of ordering/precision.
7. Approve the read port's owner, repository/assembly, immutable result shape, coherent read point, failure/omission behavior, and contract versioning. It must not use or expose P12 snapshot structures.
8. Agree producer conformance checks for repeated-export ID stability, WorldId-to-`world.id` mapping, whole-World collection enumeration, same-World source-cut consistency, missing/duplicate identity, dangling refs, Knowledge exclusion, complete-history authority, and read-only/no-advance behavior. `INCLUDED` and `KNOWN_EMPTY` must not be asserted from partial or selected views; read failure blocks export.
9. Select invocation only after the contract is agreed. Transport is a separate decision. This study authorizes no IPC, REST, sockets, server, persistence access, or live mutation.

## Open architecture questions

1. What Simulation concept does World represent, and which authority supplies its stable ID independent of configuration name, seed, Unity asset, authored profile, and runtime instance?
2. Which Persons are in scope, including non-materialized/unnamed people? Who owns any public display name, and what is the age time rule?
3. Will Simulation define a general City/Settlement ID? How does P14-A settlementSemanticId relate to City identity outside its bounded profile?
4. How should City-to-Location anchors, Person residence, At, and InTransit be represented without conflation?
5. What source supplies Location.kind, and are Hex, Location, Crossing, Site, and LocalTopology distinct public concepts? A Location display name is optional.
6. Is generic Organization intentionally deferred, and what future owner/type/member-role contract would make it projectable?
7. What are public Institution type, membership, and location semantics? Does office representation need its own concept?
8. Does Item mean definition, fungible stock, owned quantity, stack, or unique artifact? How do title, owner, custodian, location, and quantity relate?
9. Which retained domain records become public HistoricalEvents, how do IDs survive restart, and how does the custom calendar map to v1 event time?
10. Which relationship types belong in v1, and what direction, cardinality, ID, and validity rules apply? Are actor appraisals excluded?
11. What coherent read point and temporal value identify the projection when v1 has no as-of field and Simulation distinguishes day-level facts from logical instants?
12. Which repository owns the projection input contract/tests without depending on consumer packages or copying Simulation runtime types?

## Decision boundary

This study corrects External documentation against promoted Simulation architecture. It proposes an External mapper behind a Simulation-approved read port and identifies entity mappings complete only at the concept level. It does not redefine Simulation or decide its open architecture questions. Fixtures remain the External consumer source until the projection contract is approved.
