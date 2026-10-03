# Simulation Entity Mapping

This document maps the World Exchange v1 entity fields against promoted Simulation architecture after the [Stage D.1 contract pressure review](WORLD_EXCHANGE_CONTRACT_PRESSURE_REVIEW.md). The previous mapping used Simulation main at 002a55859544d1e26247c274e6d52590fa671a90. Its findings are superseded by the canonical refs listed in [the projection study](SIMULATION_PROJECTION_STUDY.md). Classifications describe concept mapping, not exporter readiness.

World Exchange v2 keeps these entity fields and adds whole-World collection
coverage. These source-readiness classifications do not establish complete
enumeration or a compatible cross-collection read cut. A real producer must
meet the additional [coverage contract and exporter prerequisites](WORLD_EXCHANGE_COLLECTION_COVERAGE.md).

## World — PARTIALLY_SUPPORTED

- Authoritative sources: Promoted WI-A defines and allocates a `WorldId` for a newly composed causal World before publication. `SimulationBootstrapComposition` and `SimulationRuntime` share that typed identity. Authored profiles and `SimulationConfigData` remain bootstrap/configuration inputs, not World identity owners.
- Stable identity: `WorldId.Value` is canonical `world:<32 lowercase hexadecimal digits>`, constructed from a non-empty GUID. It identifies a causal World continuation; it is not a profile, seed, content fingerprint, save file, or runtime instance ID.
- Safe facts: `WorldId` is the only currently established World fact that maps to the required World Exchange `world.id`, subject to an approved External ID mapping. World `name`, `era`, `description`, and tags are optional in the contract but have no approved Simulation source here; omit them.
- Derivable relationships: World scope anchors its collections, but no universal World-to-City relationship list or recursive World graph is established. Do not derive one from profile composition.
- Derived/presentation-only: `SimulationConfigData.simulationName`, profile names, seed, module configuration, diagnostics, and logging describe authoring or execution; they are not automatically World metadata.
- Knowledge: World identity is not an aggregate of Person, Institution, or Faction Knowledge. Do not promote actor-held beliefs or derived views into World truth.
- Missing/ambiguous: Simulation has a stable identity, but External has no approved read port or public ID mapping to expose it. Compatibility for older/migrated Worlds without WI-A identity, display-name authority, and any as-of/freshness contract remain unresolved. V2 whole-World collection coverage also requires separate enumeration/read-cut proof.
- Adapter: Required. After Simulation approves a read path, it must map the source-owned `WorldId` deterministically to `world.id`; it must not infer identity from a profile, name, seed, or persistence record.

## Person — PARTIALLY_SUPPORTED

- Authoritative sources: Phase 5 PersonId, PersonRuntime, and PersonStore own individual identity and birth/death/residence facts. A Person may exist without a materialized NpcRuntime. NpcData supplies authored names for NPC definitions; NpcRuntime represents a materialized actor. Phase 8 adds explicit Person spatial position. Phase 11 actor choice uses PersonId.
- Stable identity: PersonId is a stable semantic identity for one individual in a Simulation world and survives dormancy/death. NpcRuntimeId is execution lookup identity; NpcData.DefinitionId is authored definition identity and may not distinguish multiple people based on one definition.
- Safe facts: A non-empty authored NpcData name is an optional candidate Person.name for that named individual. PersonId remains identity when no public label exists. BirthAbsoluteDay and DeathAbsoluteDay are factual Simulation time values but v1 has no birth/death fields. Age is derived from birth, calendar, and as-of day. Job/occupation is safe only if Simulation confirms the field denotes current occupation. No canonical gender or biography source was established.
- Derivable relationships: Current active Faction affiliation resolves through PersonId/FactionId. Person position may resolve to stable LocationId when At that Location. Residence is separate but currently refers to a runtime settlement identity; it needs a stable City crosswalk. Genealogy has explicit PersonId endpoints, but public Relationship vocabulary/edge ID is undefined. Office incumbent does not automatically mean Institution member.
- Derived/presentation-only: Age is time-dependent. NpcName fallbacks, chronicle prose, current action, decision utility, inventories, money, and diagnostics do not define Person identity or biography.
- Knowledge: Exclude spatial location/route beliefs, market observations, political Knowledge, decision evidence, and SocialReaction. These are actor-held or interpreted information, not shared world facts.
- Missing/ambiguous: Which Persons are in scope, especially non-materialized/unnamed records; residence-to-City identity; age/as-of rule; Hex-only and InTransit mapping; gender/biography. A name is optional and must not be synthesized.
- Adapter: Required. It must map PersonId, include only approved authored names when present, calculate optional age only with an agreed time basis, and resolve residence and location separately without publishing runtime IDs.

## City — PARTIALLY_SUPPORTED

- Authoritative sources: CityData supplies authored DefinitionId and cityName; CityRuntime and settlement population authority expose current aggregate state; Phase 8 binds City owners to stable Locations; Phase 14 adds bounded settlement/material-flow facts.
- Stable identity: CityRuntime.RuntimeId is runtime allocated. CityData.DefinitionId identifies authored City content, not a generally approved instance. P14-A CityData.settlementSemanticId is a stable semantic owner key for that bounded material-flow profile, not a universal CityId.
- Safe facts: Authored cityName is an optional candidate City.name. Current aggregate population may become populationSummary only with agreed wording and as-of definition; it is not an individually represented census. P14-A LocationId is a candidate City.locationId after identity joins are approved. initialPopulation is not current population.
- Derivable relationships: City-to-Location anchor can be joined from the Phase 8 City/Site anchor authority through the current City owner and stable LocationId, then remapped through approved City identity. Important-NPC lists are not a complete census and do not establish a general “important” policy. CityConnection routes/durations are not City or generic Relationship edges.
- Derived/presentation-only: CityName fallback strings, market display values, prices, liquidity, production logs, and UI summaries are not City description or identity.
- Knowledge: Commercial observations for a market remain observer-scoped and may be stale or second-hand. Do not use them as City population, price, stock, or trade facts.
- Missing/ambiguous: General stable City/Settlement instance identity; repeated-definition behavior; population count/wording; region/founded year/description; P14 settlement identity outside its bounded profile. City name is optional and cannot stand in for instance identity.
- Adapter: Required. It needs Simulation-approved City identity and must resolve City, residence, and Location references without RuntimeId as a cross-run key; an absent name is not an omission reason.

## Location — PARTIALLY_SUPPORTED

- Authoritative sources: Phase 7 spatial authority and Phase 8 factual geography own stable Hex/Location records, anchors, authored geometry, City/Site bindings, Person position, and separate route Knowledge. Phase 9-B composes one authored Hex and anchored Location. Phase 10 consumes Location for a bounded Ruin/LocalTopology seam.
- Stable identity: LocationId and HexId are stable typed semantic identities. SpatialLocationRuntime.RuntimeId belongs to the legacy runtime graph and is not interchangeable with LocationId.
- Safe facts: Location existence, LocationId, and anchored Hex reference are factual. Authored Hex coordinates, scale, and terrain references are source facts, but v1 Location has no coordinate or terrain fields. The Location authority has no general public kind; `name` is optional in v1.
- Derivable relationships: City/Site anchor binding can connect an owner to LocationId after the owner has a stable public ID. Anchored Hex is not a World Exchange Location by implication. LocalTopology containment does not establish generic parentLocationId.
- Derived/presentation-only: A runtime node label resolved from its City, a Ruin label, renderer coordinates, diagnostic formatting, and LocalTopology labels do not populate Location.name or kind.
- Knowledge: Known locations/routes, estimated crossing availability, route plans, and observation freshness are Knowledge or plan data. They do not determine factual Location existence.
- Missing/ambiguous: Required v1 kind; public place taxonomy; which authored facts belong in v1; mapping of Hex, Location, Crossing, Site, and LocalTopology; stable City owner mapping. A human-readable Location name is optional.
- Adapter: Required. It may map LocationId after the required public kind and City relation semantics are approved; include a source-owned name only when available.

## Organization — DEFERRED

- Authoritative sources: Legacy OrganizationData, OrganizationRuntime, and OrganizationStore types exist, but canonical architecture identifies them as legacy/local and explicitly defers a generic Organization domain. No current general world-owned Organization authority/configuration path was found.
- Stable identity: OrganizationData.DefinitionId is authored definition identity; OrganizationRuntime identity and membership endpoints are runtime-scoped. No promoted general Organization instance ID exists.
- Safe facts: None under an approved generic Organization contract. Legacy DisplayName alone does not promote the concept.
- Derivable relationships: Do not infer membership from jobs, faction affiliation, spatial presence, office occupancy, or a legacy store outside canonical ownership.
- Derived/presentation-only: Legacy display helpers and UI labels do not prove a durable organization type or fact.
- Knowledge: No Knowledge can establish Organization existence or membership.
- Missing/ambiguous: Canonical owner, definition/instance identity, required v1 type, active membership/roles, and City/Location/Faction relations.
- Adapter: Not until Simulation promotes or approves generic Organization authority and its identity/membership contract. This is a Simulation architecture question.

## Institution — PARTIALLY_SUPPORTED

- Authoritative sources: Phase 5 InstitutionStore and OfficeStore are world-owned. InstitutionRecord owns InstitutionId and DisplayName; OfficeRecord owns OfficeId and InstitutionId; current OfficeIncumbency references PersonId. Factual death and institutional vacancy recognition are distinct.
- Stable identity: InstitutionId and OfficeId are typed semantic identities. OfficeId is not an Institution ID; PersonId remains the incumbent identity.
- Safe facts: Institution DisplayName is an optional candidate Institution.name. Registered Institution existence and current office records/incumbencies are authoritative in that domain. Current records do not provide Institution type, City, Location, or a general member list.
- Derivable relationships: Institution-to-Office and Office-to-current-incumbent follow explicit records. World Exchange has no Office entity. Incumbency does not mean general Institution membership, so do not put officeholders in Institution.memberIds without approved semantics.
- Derived/presentation-only: Vacancy recognition is explicit institutional state, separate from factual death. Tenure history is not current membership or Institution description.
- Knowledge: Political observations held by an Institution are holder-scoped Knowledge; they do not establish Institution type, membership, or universal political truth.
- Missing/ambiguous: Required v1 Institution.type; public role/member semantics; City/Location relation; whether offices need their own entity or typed Relationship. Institution name is optional.
- Adapter: Required after Simulation defines the missing required field and whether office facts belong in v1. Preserve incumbent and tenure boundaries.

## Faction — READY_TO_PROJECT

- Authoritative sources: Phase 6 FactionRecord and FactionStore own registered Faction facts. FactionAffiliationRecord records explicit PersonId membership tenure and active/ended state. Faction Knowledge is separately holder-scoped.
- Stable identity: FactionId is stable semantic identity; FactionAffiliationId identifies an affiliation tenure; PersonId identifies the member. Use FactionId for Faction and only active affiliations for current member references.
- Safe facts: FactionRecord.DisplayName is an optional candidate Faction.name. FactionStore registration requires a stable FactionId but does not require a non-empty display name; v1 no longer makes that presentation label mandatory. FactionId maps to entity ID through the approved type-scoped map. Active affiliation endpoints map to optional memberIds. Ideology, City/Organization association, and description are not established by these records.
- Derivable relationships: Current affiliation derives Faction.memberIds and matching Person.factionIds. Ended records are historical, not current membership. Membership does not imply support, loyalty, Knowledge, or Knowledge propagation.
- Derived/presentation-only: Membership policy, expulsion permission, legitimacy, support, recognition, political position, and diagnostic ordering are not Faction ideology or description.
- Knowledge: Faction-held political Knowledge is an independent Faction perspective, not membership truth and not copied to Persons.
- Missing/ambiguous: Optional ideology and City/Organization associations are absent but v1 does not require them. The read port, reciprocal membership-field policy, WorldId-to-External-ID mapping, compatible source cut, and v2 collection coverage remain cross-cutting prerequisites for a complete exchange.
- Adapter: Required. It maps stable FactionId even when no display name exists, includes a source-owned name only when supplied, and reads current membership only from active affiliation facts. It must not fabricate a fallback.

## Item — PARTIALLY_SUPPORTED

- Authoritative sources: ItemData is an authored item definition with DefinitionId, itemName, basePrice, and capability modifiers. InventoryRuntime and City market stock aggregate quantities by ItemDefinitionId. Phase 14 adds bounded material source and explicit settlement-owner/market-custodian facts.
- Stable identity: ItemData.DefinitionId identifies a definition subject to authored identity lifecycle rules; it is not a unique held Item or stack ID. NotableItemRuntimeId is runtime allocated. P14-A source/store/settlement keys identify those records/owners, not item instances.
- Safe facts: itemName is an optional name candidate for a catalog definition. Required World Exchange Item.type has no established ItemData source. basePrice is an economy setting, not inherent item truth. Quantities are mutable stock/holdings.
- Derivable relationships: Stock associates a definition with settlement and market custody, but one definition can exist in many holdings. P14-A separates settlement ownership from market custody. World Exchange Item has one optional owner/location and no quantity/custodian fields; do not assign the definition one owner or location.
- Derived/presentation-only: Resolved labels, market price displays, chronicle prose, and diagnostics are presentation/read-model output, not unique item identity.
- Knowledge: Merchant commercial observations are time-bound actor Knowledge and cannot set global price, owner, location, or stock.
- Missing/ambiguous: Required type; definition/instance meaning; definition lifecycle through content changes; quantity/title/custody/location model; whether unique artifacts are intended.
- Adapter: Required after Simulation chooses the Item meaning and provides type, or External approves a versioned representation of needed facts. Do not turn P12 or aggregate stock into Item entities.

## HistoricalEvent — PARTIALLY_SUPPORTED

- Authoritative sources: Bounded retained records include Phase 5 OfficeTenureRecord and explicit property/estate continuity; Phase 6 claim/recognition and faction affiliation histories; Phase 7 terminal Battle outcome/provenance and downstream BattleResolved evidence. DomainEventStore and HistoryStore have separate lifetime and retention rules.
- Stable identity: Some source records have domain IDs such as FactionAffiliationId. No universal HistoricalEventId or event stream exists. DomainEvent.EventId/RecordSequence are runtime/session-oriented and not proven stable across reinitialization.
- Safe facts: An explicitly retained and approved outcome record may provide title/type, time, participants, Location refs, and related IDs only when the source owns those facts. There is no generic conversion rule today.
- Derivable relationships: Participants/locations can be remapped only through stable PersonId/LocationId identities in the same payload. Decision actor, target, or evidence alone does not prove event participation.
- Derived/presentation-only: NpcChronicle and its formatter combine decisions and outcomes in a Person-oriented presentation. Diagnostics, snapshots, canonical text, and timelines are not a public event source.
- Knowledge: A Person's awareness, chronicle role, support, or perceived attribution is distinct from event outcome and actual participants.
- Missing/ambiguous: Retention scope, public event catalog, generic event ID, restart lifecycle, title/description owner, custom-calendar mapping to required year/occurredAt, visibility, and as-of consistency.
- Adapter: Required. Select only approved retained records, preserve source identity/outcome, map time explicitly, and never rebuild events from current facts, P12 snapshots, choices, or formatted chronicles.

## Relationship — PARTIALLY_SUPPORTED

- Authoritative sources: Objective domain relations include Person parentage/genealogy, active Faction affiliation, and Institution-Office incumbency. Phase 6 says generalized C3 persistent relationship projection remains deferred. NpcRelationRuntime holds directed actor appraisals; C1 SocialReaction is appraisal/history, not a general public social edge.
- Stable identity: No universal public RelationshipId/type contract. Some domains have their own IDs such as FactionAffiliationId. Do not relabel a domain ID as generic relationship identity without approval. Do not hash endpoints before direction, multiplicity, and lifecycle are defined.
- Safe facts: Only a named, typed relation with approved public semantics. Active Faction membership can use v1 direct member/faction fields. Parentage or incumbency might use a v1 Relationship only after type and identity rules are accepted. Trust/fear/affinity are not objective relationship facts.
- Derivable relationships: Current affiliation from active records; parent/child from genealogy; office/institution links from OfficeRecord and OfficeIncumbency. These differ and must not be duplicated when direct fields already represent membership.
- Derived/presentation-only: Kinship visualization, chronicle relation labels, derived support/legitimacy, social reaction summaries, and timeline text are not generic authoritative relationship records.
- Knowledge: Political Knowledge, beliefs, perceived attribution, and directed NPC appraisals are perspective-specific. Do not flatten them into objective or reciprocal Relationship facts.
- Missing/ambiguous: Public type vocabulary, direction/cardinality, stable edge ID, temporal validity, which family/office/social ties belong in v1, and deferred C3 scope.
- Adapter: Required for any approved subset. Preserve domain meanings, use direct entity fields for direct membership when appropriate, and omit unsupported generic edges.

## Cross-entity guardrails

- World Exchange IDs are globally unique in a payload, including the World entity; all refs must resolve within the payload.
- Keep semantic source identity separate from External ID encoding. Names, runtime IDs, filenames, Unity GUIDs, and array positions do not resolve ambiguity.
- Current Location, residence City, active affiliation, historical tenure, and recorded outcome are distinct concepts.
- Only publish descriptive fields supplied by the owning Simulation authority. A missing required v1 field blocks mapping; do not fabricate a label.
- A projection read cannot mutate Simulation or publish changes back into it.
