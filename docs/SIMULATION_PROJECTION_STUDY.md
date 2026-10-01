# Simulation → World Exchange Projection Study

## Purpose and disposition

This is a Stage D architecture study for a future, read-only projection from Simulation into World Exchange v1. It proposes a boundary and records the evidence and decisions needed before an exporter can be implemented. It does not authorize or implement a runtime exporter, a transport, persistence access, or authoring/import.

No World Exchange entity is classified `READY_TO_PROJECT` at the inspected Simulation revision. Some Simulation concepts have useful source data, but stable instance identity, public semantics, or access through a dedicated read boundary remain unresolved. The entity-by-entity evidence is in [Simulation Entity Mapping](SIMULATION_ENTITY_MAPPING.md).

## Inspected repository state

| Repository          | Ref inspected                                                                    | State                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Simulation-External | `main` at the starting inspection                                                | Clean, tracking `origin/main` before this study                                                                                  |
| Simulation          | `main`, commit `002a55859544d1e26247c274e6d52590fa671a90`, same as `origin/main` | Tracked tree has no reported changes; status reports an untracked `.worktrees/` directory, which was left unopened and untouched |

The Simulation commit is dated 2026-09-14 and titled `Add simulation runtime orchestration regressions`. Simulation was inspected read-only. The tracked Simulation Markdown inventory at this ref contains `AGENTS.md` only; no additional tracked architecture/domain design documents were available. Core source references below therefore name the path and relevant type/member at this exact commit.

External contract references: `docs/ARCHITECTURE.md`, `docs/WORLD_EXCHANGE.md`, `packages/world-schema/src/index.ts`, and `docs/ROADMAP.md`. World Exchange v1 requires a stable world ID, stable entity IDs unique across the payload, and explicit ID references. It is a read-oriented projection, not a persistence or transport format.

## Proposed projection boundary

```text
Simulation-owned domain authority
        ↓
dedicated, read-only projection port
        ↓
approved immutable projection data
        ↓
World Exchange v1 mapping and validation
        ↓
Web / Obsidian / other consumers
```

Simulation should own or explicitly review the read port because it defines which sources represent domain truth and when a consistent read can occur. The port should return a purpose-built, read-only projection shape; it must not publish Simulation runtime classes, Unity types, or Stores. An External-side mapping/validation component may translate that approved shape to `WorldExchange`, but must not reference the Simulation assembly. The location and ownership of those components, and how the two repositories share the versioned contract, remain open decisions.

The export is a point-in-time view of selected current facts plus a separately governed set of retained historical facts. It should read one coherent state at a defined simulation boundary. It must not mutate the world, start or advance a simulation, restore state, or read a P12 save. Transport and invocation are separate future decisions; no IPC, REST, sockets, or other live connection is proposed here.

## Identity mapping strategy

1. Simulation must define a stable world identity for the world represented by the export. `SimulationConfigData.simulationName` is a display label, not that identity. The open question is whether a world means a configuration, a runtime instance, or a larger authored setting.
2. Give every projected entity a stable, type-scoped public ID in the world namespace. A future encoding could combine a stable world key, an entity kind, and a Simulation-owned stable entity/instance key. The encoding and escaping rules require review; this study does not establish a Simulation ID contract.
3. Treat current `DefinitionId` properties (`NpcData`, `CityData`, `ItemData`, and `OrganizationData`) as candidate authored identifiers only. Their uniqueness, lifecycle, reuse, and cross-kind namespace rules are not established as a public integration contract. Repeated `NpcData` or `CityData` definitions can produce multiple runtimes, so a definition ID alone cannot identify every runtime Person or City.
4. Never use `RuntimeIdAllocator` values as cross-run IDs. It starts its sequences at one, and `TesteSimulacao.InitializeSimulation` creates a new allocator for each initialization. Runtime IDs, array positions, Unity asset GUIDs, asset/file names, display names, and filenames are not external identity.
5. Events and relationships also need identities that survive repeated exports. Current event IDs are sequence-allocated runtime IDs. A relationship ID cannot be inferred until its public type, direction, multiplicity, and lifecycle are defined.
6. Before writing any reference, the adapter must resolve it through the approved identity map and validate that the target is present in the same World Exchange payload. A missing or ambiguous source identity must fail or omit the entity/reference under a documented policy; it must never silently substitute a name.

## Factual-world-truth policy

- Project only fields whose source is the Simulation-owned authoritative world state at the export cut. Separate authored definitions from mutable current state and label their meaning accordingly.
- A current Simulation fact is not a fact that every NPC knows. Never turn what an NPC observed, inferred, received from another NPC, or believes into a global world fact.
- Do not infer unmodeled facts from display helpers, action text, logs, decision utility, default values, filenames, or consumer presentation.
- `NpcRuntime.CurrentCity` represents current city presence when set; it is not a permanent residence field. It is cleared during travel. Do not populate `Person.residenceId` from it. A current `locationId` also requires agreement that a city transit node is a public Location entity and a rule for people in transit.
- `CityRuntime.CurrentPopulation` is an aggregate Simulation population. Do not expand it into fictional Person records. World Exchange v1 has only a text `populationSummary`, so a clearly labeled abstract aggregate needs contract agreement before projection.
- Simulation statuses, action state, utility, money, inventories, trade plans, travel counters, justice internals, and scheduler directives are internal/current mechanics unless a specific public domain projection is approved. Their presence in a runtime class does not make them World Exchange facts.
- Do not copy private runtime implementation, stores, Unity serialization, P12 fields, or internal object graphs into `metadata`. World Exchange metadata is not an implementation escape hatch.

## Knowledge projection policy

World Exchange v1 has no actor-scoped Knowledge concept or observer/provenance model. Therefore the default policy is to omit Knowledge entirely from the factual World Exchange payload.

This specifically excludes `SpatialKnowledgeRuntime.KnownLocationRuntimeIds` and `KnownRouteRuntimeIds`, and `CommercialKnowledgeRuntime` observations. Commercial observations have an observing/receiving NPC, observation and receipt days, freshness, and sources such as direct observation, initial scenario knowledge, or sharing by another NPC. They may be stale or second-hand. They describe what one actor can use, not the current market as a whole. If a future product needs this material, it needs a separately reviewed actor-scoped contract with provenance and time semantics; it must not be projected into factual Location, City, Item, or Relationship fields.

`NpcRelationRuntime` is not the same data structure as the Knowledge stores, but its directed affinity/trust/fear values are source-NPC-specific assessments. They must not be labeled as objective social ties without an explicit Simulation and schema decision.

## Current state and historical records

The current state projection and historical-event projection must have distinct source rules:

- Current state comes from approved domain authorities at one read cut. It must not be reconstructed from a log, an NPC chronicle, or a save snapshot.
- `DomainEvent` instances represent recorded outcomes such as travel, arrival, arrest, escape, and travel-party start/arrival. `DomainEventStore` holds events for the current runtime session. `HistoryStore` is narrower: `HistoryPolicy.ShouldRetain` currently retains only `NpcEscapedEvent`. Both stores are initialized during `TesteSimulacao.InitializeSimulation`; they do not establish cross-run durable history.
- `NpcDecisionRecord` records that an action was chosen; it is not proof that the action succeeded. `NpcChronicleService` deliberately combines decisions and domain events for a person-oriented view, while `NpcChronicleFormatter` produces perspective-sensitive presentation text. Neither is a direct HistoricalEvent source.
- If Simulation approves selected domain events for World Exchange, the adapter needs stable event identity, an explicit retained-history scope, approved event titles/types and participants, and a calendar mapping. `DomainEvent.AbsoluteDay` can be interpreted through `CalendarDefinition.GetDate`, but World Exchange v1 does not define how a custom Simulation calendar maps to `year` or `occurredAt`. Do not format a Gregorian date or export a runtime `EventId` by assumption.
- Never synthesize historical events from current status, current location, an action decision, or a derived UI timeline.

## Mapping summary

| World Exchange concept | Classification                    | Main reason                                                                                                                    |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| World                  | `BLOCKED_BY_CURRENT_ARCHITECTURE` | No stable World ID or agreed distinction between configured scenario and world                                                 |
| Person                 | `PARTIALLY_SUPPORTED`             | Authored person fields and current runtime exist; a stable ID per instantiated person and residence/location semantics do not  |
| City                   | `PARTIALLY_SUPPORTED`             | Authored name and runtime population/location exist; runtime instance identity and public Location relation are unresolved     |
| Location               | `BLOCKED_BY_CURRENT_ARCHITECTURE` | Current spatial node is an opaque runtime route node without stable identity or authored name/kind                             |
| Organization           | `PARTIALLY_SUPPORTED`             | Definition/name and membership types exist, but required type and active world wiring are missing                              |
| Institution            | `DEFERRED`                        | No corresponding Simulation domain/configuration concept was found at the inspected ref                                        |
| Faction                | `DEFERRED`                        | No corresponding Simulation domain/configuration concept was found at the inspected ref                                        |
| Item                   | `BLOCKED_BY_CURRENT_ARCHITECTURE` | Simulation models item definitions and aggregated quantities; World Exchange Item identity/type/owner semantics are unresolved |
| HistoricalEvent        | `PARTIALLY_SUPPORTED`             | Some outcome event records exist, but retention is runtime-local/narrow and event identity/time projection is unresolved       |
| Relationship           | `BLOCKED_BY_CURRENT_ARCHITECTURE` | Existing NPC relation values are directed actor assessments, while public relationship semantics and IDs are undefined         |

No category is ready for implementation without the cross-cutting identity and read-boundary decisions below. This status does not claim that Simulation concepts can never map to World Exchange.

## Unsupported and ambiguous areas

- Stable world identity; stable per-instance Person/City IDs; identity lifecycle, aliasing, deletion, and duplicate-definition behavior.
- A public read port and snapshot consistency point. `SimulationRuntime` exposes city and NPC runtime lists, while the scene-facing `TesteSimulacao` owns other services/stores. No single public projection contract covers the whole world.
- Whether named NPCs are the only projected Persons. Simulation instructions say common city population is abstract and only relevant NPCs have complete `NpcRuntime` state.
- Whether a city’s spatial graph node is a public `Location`, and how exact position, residence, in-transit state, routes, and city containment differ.
- A type vocabulary for Organization; the current organization membership role is not represented by `WorldExchange.Organization.memberIds`.
- Institution and Faction domain sources.
- Whether World Exchange `Item` means an item definition, a fungible stack/quantity, or an individual artifact, and how owner/location/quantity are represented.
- Which DomainEvents are durable public history, how event IDs survive restarts, and how custom calendar dates map to World Exchange event time.
- Whether Relationship is an objective social/political edge, an actor’s directed evaluation, or a generic connection. Current schema has no observer or affinity/trust/fear values.
- Whether the payload needs an explicit `asOf`/simulation day. World Exchange v1 currently has no top-level snapshot time; this cannot be hidden in undocumented metadata.
- How schema versions are shared between repositories and which side owns conformance tests for the producer boundary.

## Future adapter responsibilities

Once the prerequisites are approved, a dedicated adapter should:

1. Read only from the reviewed Simulation projection port at its documented consistency point.
2. Convert approved authored definitions and current domain state into World Exchange public values; never expose Simulation or Unity types.
3. Apply stable, type-scoped IDs and remap every entity/event/reference consistently; reject duplicate IDs and dangling references.
4. Keep current facts, retained outcome events, and actor Knowledge separate. Apply explicit omission rules to unsupported, private, stale, or ambiguous fields.
5. Produce only fields that World Exchange v1 defines. Request a separately reviewed schema revision for missing public concepts; do not stuff them into `metadata`.
6. Validate the payload using the shared `@simulation-external/world-schema` contract and make a deterministic output for the same approved source state.
7. Have no mutation, persistence loading, P12 dependency, or consumer-specific rendering responsibility. Invocation and transport remain outside this study.

## Exact prerequisites for a real exporter

1. Simulation architecture owners accept or revise this study and identify the domain owner for every exported concept.
2. Simulation defines a durable World ID and durable IDs for each projected instance, including duplicate-definition, rename, reuse, deletion, and migration rules. It defines event identity and, if public relationships are supported, relationship identity too.
3. Simulation defines which data is authoritative current truth, what is only actor Knowledge, what is presentation/derived state, and which event types/retention window are public.
4. Simulation owners approve a read-only projection port, its assembly/repository ownership, and a coherent snapshot boundary. The port returns approved projection data rather than runtime classes, Stores, or Unity objects.
5. Simulation and External owners agree the exact World Exchange version, field meanings, ID encoding, missing-data behavior, date/calendar mapping, population summary semantics, and payload as-of semantics. Any necessary schema changes must be separately reviewed and versioned.
6. Resolve the World/Scenario, Person/Residence, City/Location/Route, Organization type/roles, Item definition/stack/instance, HistoricalEvent retention/time, and Relationship perspective questions in the mapping document. Keep Institutions/Factions deferred until Simulation defines their domain sources.
7. Provide representative approved source states and producer-side validation covering stable repeat exports, duplicate and missing IDs, dangling references, event inclusion, actor Knowledge exclusion, and proof that export does not mutate state.
8. Choose invocation and transport only after the boundary is agreed. This prerequisite does not authorize IPC, REST, sockets, save reading, or live mutation.

## Open architecture questions

1. Is an exported World a `SimulationConfigData`, one initialized runtime based on it, or a broader authored world that can have multiple scenarios?
2. Where should the read port and serializer live, and how will Simulation consume or validate the separately owned World Exchange v1 schema without importing consumer packages or duplicating types?
3. Does Simulation intend `NpcData.DefinitionId` and `CityData.DefinitionId` to identify authored definitions only, or durable people/cities? What additional instance IDs are needed when a definition is instantiated more than once?
4. Which NPCs qualify as World Exchange Persons, and should a traveling NPC have an omitted location, a route location, or another explicitly modeled state?
5. Is the current spatial network a geographic/location model or only a travel graph? If both, what public identifiers and authored names/kinds distinguish those uses?
6. Should abstract current population be exposed as a summary, and what wording/precision prevents consumers treating it as individually represented citizens?
7. What are the public Organization type vocabulary and membership semantics? Are leader/member roles public facts, and should Simulation configure Organization instances in the world runtime?
8. Should Item represent catalog definitions, fungible stock, personal holdings, or unique artifacts? Does World Exchange need quantity or inventory/ownership semantics before this concept can be exported?
9. Which domain events constitute shareable historical facts, how long are they retained, and which Simulation calendar fields map into World Exchange v1 `year` or `occurredAt`?
10. Is an NPC’s directed affinity/trust/fear an internal actor assessment or a public relationship fact? If public, what observer, value, and temporal semantics must the contract carry?
11. Which Simulation read boundary can guarantee a coherent as-of snapshot, and should that snapshot day be added to a future World Exchange version or an agreed envelope?

## Decision boundary

This study can guide a Simulation-side architecture discussion. It cannot establish Simulation domain contracts, decide their canonical owners, or make missing Simulation concepts appear in the External schema. Until those decisions are approved, fixtures remain the External consumers’ source.
