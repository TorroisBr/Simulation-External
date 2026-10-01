# Simulation Entity Mapping

Evidence in this document is from Simulation `main` at `002a55859544d1e26247c274e6d52590fa671a90`. Paths are relative to the Simulation repository. Field names below are candidates for discussion, not approval to export. The classification meanings are defined in [the projection study](SIMULATION_PROJECTION_STUDY.md).

## World — `BLOCKED_BY_CURRENT_ARCHITECTURE`

- **Authoritative sources:** `Assets/_Project/Scripts/SimulationConfigData.cs` (`simulationName`, configured cities and NPCs), `Assets/_Project/Scripts/SimulationRuntime.cs` (active `Cities`, `NpcRuntimes`, and `CurrentDay`), and the scene setup in `Assets/_Project/Scripts/TesteSimulacao.cs`.
- **Identity:** No stable World ID was found. `simulationName` is a display label. A Unity asset ID, asset filename, or runtime object identity is not an approved public ID.
- **Safe factual fields:** The configured label can be a candidate `world.name` after deciding that one SimulationConfig is one World. There is no authored `era` or world description contract in this source.
- **Derivable relationships:** The configured City set is enumerable from the active runtime, subject to stable City IDs.
- **Derived/presentation-only:** Enabled modules, random seed, logging, economy settings, calendar dimensions, and scenario diagnostics describe setup or execution and are not World metadata by default.
- **Knowledge:** Do not aggregate NPC Spatial or Commercial Knowledge into World metadata.
- **Missing/ambiguous:** World versus scenario versus runtime-instance semantics; stable World ID; payload observation time.
- **Adapter:** Yes, through the future common projection boundary after Simulation defines the World identity and ownership.

## Person — `PARTIALLY_SUPPORTED`

- **Authoritative sources:** `Assets/_Project/Scripts/Data/NpcData.cs` supplies authored `id` and `name`; `Assets/_Project/Scripts/Data/NpcJobData.cs` supplies a configured job label/type. `Assets/_Project/Scripts/NpcRuntime.cs` supplies current runtime state. `SimulationRuntime.NpcRuntimes` enumerates active NPCs; `TesteSimulacao.CreateNpcRuntimes` shows each configured NPC entry creates a runtime instance.
- **Identity:** `NpcData.DefinitionId` is a candidate definition key, not always an instance key: the same `NpcData` can be configured more than once. `NpcRuntime.RuntimeId` distinguishes active instances but comes from a resettable sequence allocator. Neither is yet a durable public Person ID contract.
- **Safe factual fields:** Authored `name`; a job/occupation label only if Simulation confirms the job definition means current occupation. Current city presence can be read when `CurrentCity` is non-null, but it is not a permanent residence. Inventory, status, current action, money, and travel-plan fields need separate public-domain decisions and do not map to existing Person v1 fields.
- **Derivable relationships:** A current City/Location reference may be possible after the Location and in-transit rules are resolved. Organization membership may be derivable from an active, authoritative organization source once integrated. Event participants can be linked only through durable Person IDs.
- **Derived/presentation-only:** `NpcName` fallback text and chronicle text are display helpers. Simulation status and chosen action are runtime mechanics, not Person biography.
- **Knowledge:** Exclude `SpatialKnowledgeRuntime` and `CommercialKnowledgeRuntime`. A person’s known routes, locations, or market observations do not establish world truth.
- **Missing/ambiguous:** Stable instance key; age, gender, biography; residence distinct from current presence; what population of persons is in scope; exact state while in transit. Core guidance says ordinary city population is abstract and only relevant NPCs have full `NpcRuntime` state.
- **Adapter:** Yes, once person-instance identity, field meanings, scope, and current-location rules are approved.

## City — `PARTIALLY_SUPPORTED`

- **Authoritative sources:** `Assets/_Project/Scripts/Data/CityData.cs` supplies `id`, `cityName`, and `initialPopulation`; `Assets/_Project/Scripts/CityRuntime.cs` supplies the active city, `CurrentPopulation`, `Location`, and `ImportantNpcs`. `SimulationRuntime.Cities` exposes active City runtimes.
- **Identity:** `CityData.DefinitionId` is a candidate authored key, but a configured city definition may be instantiated more than once. `CityRuntime.RuntimeId` is runtime allocated and not stable across initialization.
- **Safe factual fields:** Authored city name. Current aggregate population can be considered for `populationSummary` only if labeled as abstract Simulation population; v1 offers text, not a typed count. `initialPopulation` is configured starting state, not a substitute for current population.
- **Derivable relationships:** City to its associated spatial graph node is derivable from `CityRuntime.Location`, and its important-NPC list is available. The node’s public Location semantics and IDs are unresolved. `ImportantNpcs` is not a complete census. City connections produce directed travel routes and durations, not an existing World Exchange city relation.
- **Derived/presentation-only:** `CityName` fallback string is presentation. Market stock, price, liquidity, consumption, and production are Simulation economy state and have no direct City v1 fields.
- **Knowledge:** Merchant market observations for a city/location remain actor Knowledge, not City facts. Use the authoritative `CityRuntime` source if current market facts are ever approved separately.
- **Missing/ambiguous:** Stable City instance key; region, founded year, and descriptive content; population meaning/precision; distinction among City, Location, and route node.
- **Adapter:** Yes, after identity and aggregate/Location semantics are approved.

## Location — `BLOCKED_BY_CURRENT_ARCHITECTURE`

- **Authoritative sources:** `Assets/_Project/Scripts/SpatialRuntime.cs` defines `SpatialLocationRuntime` and `SpatialRouteRuntime`; `TesteSimulacao.CreateCityRuntimes` creates one spatial node for each runtime City and `CreateSpatialRoutes` connects nodes based on `CityData.connections`.
- **Identity:** `SpatialLocationRuntime.RuntimeId` is allocated from `RuntimeIdAllocator` per initialization. No authored location key exists in the inspected source.
- **Safe factual fields:** Route endpoints and configured travel-day duration exist, but World Exchange Location has no route-duration field. The location runtime itself exposes only its runtime ID.
- **Derivable relationships:** A node can be associated with the City whose `CityRuntime.Location` is that exact object. This supports a possible one-node-per-city projection only if Simulation confirms a transport node is also a public Location entity.
- **Derived/presentation-only:** `Assets/_Project/Scripts/TesteSimulacao.cs` (`ResolveLocationDisplayName`) resolves a node through a separate location-to-city dictionary and returns a City display name. That presentation mapping does not give `SpatialLocationRuntime` an authored name or kind.
- **Knowledge:** `SpatialKnowledgeRuntime` is owned by an NPC and records known node/route runtime IDs. Never use it to decide which locations exist in the factual exchange.
- **Missing/ambiguous:** Stable location identity, required v1 `name` and `kind`, authored description/containment, exact positions, and whether graph nodes are canonical places or only navigation topology.
- **Adapter:** Yes only after Simulation resolves that model and provides stable public location facts. Until then omit Location entities and dependent refs rather than synthesizing them from names.

## Organization — `PARTIALLY_SUPPORTED`

- **Authoritative sources:** `Assets/_Project/Scripts/Data/OrganizationData.cs` supplies authored `id` and `displayName`; `Assets/_Project/Scripts/OrganizationRuntime.cs` models members and `Member`/`Leader` roles; `Assets/_Project/Scripts/OrganizationStore.cs` indexes current organization runtimes and memberships.
- **Identity:** `OrganizationData.DefinitionId` is a candidate definition key. `OrganizationRuntime.RuntimeId` is runtime allocated. Membership references currently use NPC runtime IDs.
- **Safe factual fields:** Authored display name and membership/role are present in these source types. The role cannot be represented in `Organization.memberIds` or `Person.organizationIds`; project membership only if role loss is accepted. World Exchange requires `Organization.type`, for which no source field exists.
- **Derivable relationships:** Organization members can be remapped to Person IDs if a canonical active organization source and stable Person mapping are established. V1 direct member references are more appropriate than a generic Relationship for simple membership.
- **Derived/presentation-only:** `DisplayName` is authored display content; filenames and Unity asset labels are not IDs.
- **Knowledge:** No organization-specific Knowledge contract was found. Do not infer affiliations from NPC decisions, job type, trade knowledge, or presence in a city.
- **Missing/ambiguous:** Required organization type, city/location/faction association, durable identity, membership lifecycle/role visibility, and active scenario wiring. `Assets/_Project/Scripts/SimulationConfigData.cs` has no organization list, and the inspected `Assets/_Project/Scripts/TesteSimulacao.cs` (`InitializeSimulation`) path does not construct or attach an `OrganizationStore`.
- **Adapter:** Yes after Simulation makes organizations part of the owned projection source and defines type/membership semantics.

## Institution — `DEFERRED`

- **Authoritative sources:** No Institution type, data, runtime, or configuration source was found in the tracked Simulation source at the inspected ref.
- **Identity:** None defined.
- **Safe factual fields:** None established.
- **Derivable relationships:** Do not infer institutions from Organizations, jobs, guards, or enabled modules.
- **Derived/presentation-only:** None established.
- **Knowledge:** No Knowledge source can create an Institution fact.
- **Missing/ambiguous:** Domain meaning, owner, identity, lifecycle, and membership/location rules.
- **Adapter:** Not until Simulation defines and owns an Institution concept; then map it through the shared adapter under an approved contract.

## Faction — `DEFERRED`

- **Authoritative sources:** No Faction type, data, runtime, or configuration source was found in the tracked Simulation source at the inspected ref. `OrganizationData` has no faction association.
- **Identity:** None defined.
- **Safe factual fields:** None established.
- **Derivable relationships:** Do not infer factions from directed NPC relations, organization membership, jobs, or crime/guard modules.
- **Derived/presentation-only:** None established.
- **Knowledge:** No Knowledge source can create a Faction fact.
- **Missing/ambiguous:** Domain meaning, stable identity, members, city/organization ties, and lifecycle.
- **Adapter:** Not until Simulation defines and owns a Faction concept; then map it through the shared adapter under an approved contract.

## Item — `BLOCKED_BY_CURRENT_ARCHITECTURE`

- **Authoritative sources:** `Assets/_Project/Scripts/Data/ItemData.cs` contains item definition `id`, `itemName`, and `basePrice`. `Assets/_Project/Scripts/InventoryRuntime.cs` stores aggregated quantities and average cost per `ItemData`; City market state is keyed by the same definitions.
- **Identity:** `ItemData.DefinitionId` identifies a catalog definition candidate, not an individual held object or inventory stack. Aggregated inventory entries have no independent stable ID.
- **Safe factual fields:** Authored item name. Base price is a configured economy value, not an inherent world fact. Actual amounts and market values are mutable and are not fields in World Exchange v1 Item.
- **Derivable relationships:** An NPC inventory associates an aggregate quantity with an NPC; city market stock associates a quantity with a City. Since Item v1 has an optional single `ownerId` and no quantity field, these associations cannot faithfully describe fungible holdings. Do not assign the item definition one owner or location.
- **Derived/presentation-only:** Item labels resolved for chronicle/market presentation do not identify stack instances.
- **Knowledge:** Per-merchant commercial observations are actor-scoped, time-bound Knowledge and cannot set the factual Item price, owner, or location.
- **Missing/ambiguous:** Required `type`, definition-versus-instance meaning, quantity/stack model, multiple owners/locations, and stable IDs for unique artifacts if those are intended.
- **Adapter:** Yes only after Simulation and External agree the entity semantics and, if needed, evolve the versioned schema.

## HistoricalEvent — `PARTIALLY_SUPPORTED`

- **Authoritative sources:** `Assets/_Project/Scripts/DomainEvents.cs` records outcome types and participant IDs; `DomainEventStore` holds the current runtime event list; `HistoryStore` retains events selected by `HistoryPolicy`. `Assets/_Project/Scripts/SimulationTime.cs` and `Assets/_Project/Scripts/Data/CalendarDefinition.cs` provide absolute day and a custom calendar. `Assets/_Project/Scripts/DecisionRecords.cs` records decisions; `Assets/_Project/Scripts/NpcChronicle.cs` combines decisions and events for a person-centric view.
- **Identity:** `DomainEvent.EventId` is sequence allocated by `RuntimeIdAllocator`. `RecordSequence` orders records but is not a durable event identity. Neither is documented to survive reinitialization.
- **Safe factual fields:** Approved outcome event kind, event day, actual actor/target/participants, and location references can be candidates when the corresponding stable IDs and public semantics exist. The event set currently includes travel start/arrival, arrest, escape, and party travel start/arrival. `HistoryPolicy` currently retains only escape events in `HistoryStore`, while all domain events are held in the runtime session store.
- **Derivable relationships:** Participants and locations can be mapped only with the approved identity map. A travel-party ID or route ID is not a supported World Exchange entity ID by itself.
- **Derived/presentation-only:** Decision records describe chosen actions, not outcomes. `NpcChronicleFormatter` creates presentation prose that changes by perspective; do not use the chronicle as event fact or external description.
- **Knowledge:** An NPC’s chronicle relation (actor, affected target, support, participant) is a personal view/index, not public event truth. Export event participants from approved event data, not from inferred Knowledge.
- **Missing/ambiguous:** Cross-run event identity, durable retention/window, approved event vocabulary/titles, actor visibility/privacy, event time mapping from custom calendar to v1 `year`/`occurredAt`, and a source snapshot/as-of rule.
- **Adapter:** Yes after event retention, public fields, IDs, and custom calendar mapping are defined. Do not reconstruct the event list from P12 or decisions.

## Relationship — `BLOCKED_BY_CURRENT_ARCHITECTURE`

- **Authoritative sources:** `Assets/_Project/Scripts/NpcRelationRuntime.cs` and `Assets/_Project/Scripts/NpcRelationStore.cs` define directed NPC-to-NPC affinity, trust, and fear values. The inspected Simulation runtime setup does not instantiate or attach `NpcRelationStore`. `Assets/_Project/Scripts/OrganizationRuntime.cs` separately records membership edges, but simple membership already has direct references in World Exchange Organization/Person.
- **Identity:** NPC runtime IDs are used as endpoints; no durable edge ID or public relation type is defined. A deterministic edge ID is possible only after type, direction, multiplicity, and lifecycle are approved.
- **Safe factual fields:** No current source establishes an objective, public relationship type or label. Affinity/trust/fear are evaluations by the source NPC, not mutually agreed world facts.
- **Derivable relationships:** Future organization membership may populate `Organization.memberIds` and `Person.organizationIds` if the store becomes an authoritative world source. Do not encode it twice as a general Relationship unless a consumer need and meaning are approved. City route edges need resolved Location semantics and a public representation of direction/duration.
- **Derived/presentation-only:** `NpcChronicleRelation` values categorize a person’s role in a chronicle; they are view semantics, not relationship facts.
- **Knowledge:** Although `NpcRelationRuntime` is not a Knowledge store, its direction makes its values actor-specific. Do not flatten it into objective world truth or map its numeric values into undocumented labels.
- **Missing/ambiguous:** Meaning of World Exchange Relationship, public versus actor-specific scope, value/observer/time semantics, stable edge ID, active source wiring, and any supported family/social/political relation types.
- **Adapter:** Yes only after Simulation and External define which directed facts are public and how identity/value/perspective are represented. Omit current affinity/trust/fear from v1 by default.
