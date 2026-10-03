# World Exchange Contract Pressure Review

## Decision summary

This Stage D.1 review evaluates the World Exchange v1 entity fields against
the Simulation evidence available at that review's source baseline. Its World
identity finding predates the later §91A/WI-A decision and is superseded by the
current evidence in the [projection study](SIMULATION_PROJECTION_STUDY.md) and
[entity mapping](SIMULATION_ENTITY_MAPPING.md). The historical field decisions
remain useful for the v1 schema pressure analysis; current readiness must follow
the corrected Stage D study. It changes only Simulation-External. It does not
authorize or implement a Simulation exporter, transport, persistence reader,
authoring/import path, or runtime mutation.

**World decision: B.** Keep the `world` envelope object and its stable `id`
required. Make `world.name` optional. The required World object is the
World Exchange payload's scope anchor. Without the ID, entity IDs and
references have no durable world scope, and Obsidian cannot associate notes
with a world. A display label does not supply that identity. The current Web
and Markdown consumers already render a fallback when a label is absent. This
review's source snapshot had no source-owned World ID; promoted WI-A now
provides stable `WorldId`. The remaining blockers are approved read-port
exposure, External mapping, and compatibility for older or migrated Worlds.

**Display labels:** Make the World and entity `name` properties optional, while
requiring a non-empty value whenever one is supplied. Stable IDs remain
mandatory. These labels can be useful source-owned facts, but they do not
establish entity identity or validity; consumers have ID-based or generic
fallbacks. `HistoricalEvent.title` remains required because v1 has no separate
event-type/summary fact, and title is currently the minimum field that tells a
consumer what the recorded occurrence means. This distinction is semantic,
not based on whether a Simulation source happens to populate a field.

No schema version bump is needed: this is a backward-compatible loosening of
requiredness. Existing v1 payloads remain valid. Required IDs, domain types,
relationship endpoints, event title, and the event-time invariant remain
unchanged. The schema rejects blank labels when present.

## Classification and recommendation vocabulary

Classifications use the seven categories requested for this review. The
recommendation column uses `KEEP_REQUIRED`, `MAKE_OPTIONAL`,
`MOVE_TO_PRESENTATION`, `DERIVE_IN_CONSUMER`, and `DEFER_DECISION`. For a field
that is already optional, `DEFER_DECISION` means leave its v1 optionality
unchanged and do not project it until its source authority/semantics are
approved. “Simulation evidence” points to the specific authority or gap
documented in [Simulation Entity Mapping](SIMULATION_ENTITY_MAPPING.md); the
canonical refs and source paths are listed in the [Stage D study](SIMULATION_PROJECTION_STUDY.md).

`WorldExchange` below means the payload type in
`packages/world-schema/src/index.ts`. “All entities” means World metadata and
each of the nine entity collections.

## Field-by-field matrix

### Exchange envelope and common entity fields

| Entity        | Field              | Current requirement       | Classification    | Simulation evidence                                                                                                                       | Recommendation       | Compatibility impact                                                                                                    |
| ------------- | ------------------ | ------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| WorldExchange | `schemaVersion`    | Required; literal `1`     | UNRESOLVED        | This identifies the External contract, not a Simulation fact.                                                                             | KEEP_REQUIRED        | No change; consumers continue to reject unsupported versions.                                                           |
| WorldExchange | `world`            | Required object           | IDENTITY_REQUIRED | The Exchange needs one explicit world scope; WI-A now defines stable `WorldId`, but an External read port and mapping are not approved.   | KEEP_REQUIRED        | No alternate envelope is introduced.                                                                                    |
| WorldExchange | `people`           | Required array            | UNRESOLVED        | The Simulation projection cohort/completeness rule is open.                                                                               | KEEP_REQUIRED        | Preserve v1 shape; an empty array must not be interpreted as proof that an unsupported source has no people.            |
| WorldExchange | `cities`           | Required array            | UNRESOLVED        | City instance identity and exchange completeness are open.                                                                                | KEEP_REQUIRED        | Same v1 shape; completeness semantics remain an exporter prerequisite.                                                  |
| WorldExchange | `locations`        | Required array            | UNRESOLVED        | Hex, Location, Crossing, Site, and topology scope are not interchangeable.                                                                | KEEP_REQUIRED        | Same v1 shape; do not equate an unsupported source with an empty factual collection.                                    |
| WorldExchange | `organizations`    | Required array            | UNRESOLVED        | Generic Organization is explicitly deferred by Simulation architecture.                                                                   | KEEP_REQUIRED        | Preserve compatibility; empty does not mean Simulation has no organization-like records.                                |
| WorldExchange | `institutions`     | Required array            | UNRESOLVED        | World-owned Institutions exist, but v1 mapping fields and collection coverage are incomplete.                                             | KEEP_REQUIRED        | Same v1 shape; no completeness claim is added.                                                                          |
| WorldExchange | `factions`         | Required array            | UNRESOLVED        | FactionStore is authoritative for registered Factions; source/port coverage still needs approval.                                         | KEEP_REQUIRED        | Same v1 shape.                                                                                                          |
| WorldExchange | `items`            | Required array            | UNRESOLVED        | Definition, unique instance, stack, and quantity scope are not decided.                                                                   | KEEP_REQUIRED        | Same v1 shape; do not treat unsupported Item source as confirmed absence.                                               |
| WorldExchange | `historicalEvents` | Required array            | UNRESOLVED        | There is no single retained public event catalog or exporter scope.                                                                       | KEEP_REQUIRED        | Same v1 shape; history coverage must be explicit before consumer interpretation.                                        |
| WorldExchange | `relationships`    | Required array            | UNRESOLVED        | Generic Relationship projection and coverage are deferred/undefined.                                                                      | KEEP_REQUIRED        | Same v1 shape; direct entity references remain separate from generic edges.                                             |
| All entities  | `id`               | Required non-empty string | IDENTITY_REQUIRED | PersonId, InstitutionId, FactionId, LocationId, and other domain IDs have distinct scopes; some concepts still lack an approved identity. | KEEP_REQUIRED        | No change. Names, filenames, runtime IDs, row order, and authored definition IDs do not replace stable domain identity. |
| All entities  | `tags`             | Optional string array     | CONSUMER_SPECIFIC | No shared Simulation tag vocabulary or ownership policy is established.                                                                   | MOVE_TO_PRESENTATION | Keep the v1 field for compatibility, but do not project Simulation values without a shared taxonomy.                    |
| All entities  | `metadata`         | Optional JSON object      | UNRESOLVED        | It has no Simulation-owned public field contract and could become an internal-state escape hatch.                                         | DEFER_DECISION       | Keep v1 compatibility; no runtime, Store, persistence, Unity, or arbitrary Knowledge payloads may be placed here.       |

### World

| Entity | Field         | Current requirement | Classification    | Simulation evidence                                                                                                | Recommendation | Compatibility impact                                                                                            |
| ------ | ------------- | ------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------- |
| World  | `id`          | Required            | IDENTITY_REQUIRED | At this review's source snapshot no canonical WorldId was present; promoted WI-A later established `WorldId`.      | KEEP_REQUIRED  | Remains the payload scope key; read-port exposure, External mapping, and older-World compatibility remain open. |
| World  | `name`        | Required → optional | PRESENTATION_ONLY | `simulationName` and authored profile labels describe configuration/authoring unless Simulation defines otherwise. | MAKE_OPTIONAL  | Backward-compatible v1 loosening; Web/Markdown fallback is already implemented.                                 |
| World  | `description` | Optional            | PRESENTATION_ONLY | No canonical World description owner; profile/UI prose is not automatically World truth.                           | DEFER_DECISION | No change; omit unless an approved source owns the text.                                                        |
| World  | `era`         | Optional            | OPTIONAL_FACT     | No general Simulation World-era mapping or calendar convention is established.                                     | DEFER_DECISION | No change; do not infer from profile or current year.                                                           |

### Person

| Entity | Field                            | Current requirement       | Classification    | Simulation evidence                                                                                                                | Recommendation     | Compatibility impact                                                                                                          |
| ------ | -------------------------------- | ------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Person | `name`                           | Required → optional       | OPTIONAL_FACT     | `NpcData` can supply a name for a named individual, but Person identity can exist without a materialized NPC or a public name.     | MAKE_OPTIONAL      | Existing named fixtures remain valid; unnamed Persons retain stable-ID navigation and consumer fallback labels.               |
| Person | `age`                            | Optional                  | DERIVED_DISPLAY   | Age depends on birth day, Simulation calendar, and selected as-of day; v1 carries no as-of/calendar context.                       | DEFER_DECISION     | No change; do not publish an age as timeless fact.                                                                            |
| Person | `gender`                         | Optional                  | UNRESOLVED        | No canonical source was established in the corrected study.                                                                        | DEFER_DECISION     | No change; do not infer or synthesize.                                                                                        |
| Person | `occupation`                     | Optional                  | UNRESOLVED        | A current job is not yet confirmed to mean a stable/public occupation.                                                             | DEFER_DECISION     | No change; source semantics must be approved.                                                                                 |
| Person | `residenceId`                    | Optional City ID          | OPTIONAL_FACT     | Residence is distinct from presence but currently resolves through a runtime settlement identity without a general City crosswalk. | DEFER_DECISION     | No change; include only after stable City resolution.                                                                         |
| Person | `locationId`                     | Optional Location ID      | OPTIONAL_FACT     | Phase 8 owns factual Person position; it is distinct from spatial Knowledge, but Hex-only and InTransit cases need rules.          | DEFER_DECISION     | No change; map only an approved current factual LocationId.                                                                   |
| Person | `organizationIds`                | Optional Organization IDs | UNRESOLVED        | Generic Organization is deferred; jobs, officeholding, faction affiliation, and presence do not establish generic membership.      | DEFER_DECISION     | No change; do not derive generic organizations from adjacent concepts.                                                        |
| Person | `institutionIds`                 | Optional Institution IDs  | UNRESOLVED        | Office incumbency does not establish general Institution membership.                                                               | DEFER_DECISION     | No change; v1 field remains unused absent an approved membership rule.                                                        |
| Person | `factionIds`                     | Optional Faction IDs      | OPTIONAL_FACT     | Active FactionAffiliationRecord endpoints identify current affiliation; ended records are historical.                              | DEFER_DECISION     | No change; derive consistently from the same active affiliation source as `Faction.memberIds`, not from Knowledge or support. |
| Person | `relationshipIds`                | Optional Relationship IDs | CONSUMER_SPECIFIC | It duplicates an index derivable from the `relationships` collection.                                                              | DERIVE_IN_CONSUMER | No schema change; consumers can build the index from source/target IDs.                                                       |
| Person | `biography`                      | Optional text             | UNRESOLVED        | No canonical biography source; chronicle text is a derived Person-oriented presentation.                                           | DEFER_DECISION     | No change; do not convert chronicles or diagnostics into biography.                                                           |
| Person | birth representation (not in v1) | Not represented           | UNRESOLVED        | BirthAbsoluteDay is factual, but v1 has no birth field or calendar/as-of context.                                                  | DEFER_DECISION     | No field added; decide a versioned time model only with a concrete cross-consumer need.                                       |

### City

| Entity | Field                          | Current requirement                           | Classification    | Simulation evidence                                                                                              | Recommendation       | Compatibility impact                                                                          |
| ------ | ------------------------------ | --------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------- |
| City   | `name`                         | Required → optional                           | OPTIONAL_FACT     | Authored `cityName` is a candidate label, but it does not resolve City instance identity or rename lifecycle.    | MAKE_OPTIONAL        | Existing payloads remain valid; stable City ID remains required.                              |
| City   | `region`                       | Optional                                      | OPTIONAL_FACT     | No general public region authority/mapping is established.                                                       | DEFER_DECISION       | No change.                                                                                    |
| City   | `populationSummary`            | Optional text                                 | DERIVED_DISPLAY   | Simulation has aggregate population, not a complete individual census; wording and as-of meaning are unresolved. | MOVE_TO_PRESENTATION | Keep v1 for compatibility; do not stringify counts or market observations into a shared fact. |
| City   | `foundedYear`                  | Optional                                      | UNRESOLVED        | No general founded-year authority or conversion from Simulation custom calendars is established.                 | DEFER_DECISION       | No change.                                                                                    |
| City   | `locationId`                   | Optional Location ID                          | OPTIONAL_FACT     | City/Site anchors can relate a City owner to stable LocationId after approved identity joins.                    | DEFER_DECISION       | No change; require both public endpoint IDs and preserve City-vs-Location semantics.          |
| City   | `organizationIds`              | Optional Organization IDs                     | UNRESOLVED        | Generic Organization is deferred.                                                                                | DEFER_DECISION       | No change; do not infer from jobs, presence, offices, or faction affiliation.                 |
| City   | `importantPersonIds`           | Optional Person IDs                           | CONSUMER_SPECIFIC | A bounded “important NPC” list is not a complete census and no shared importance policy exists.                  | MOVE_TO_PRESENTATION | Keep v1 compatibility; consumer curation must not be stated as world truth.                   |
| City   | `description`                  | Optional text                                 | PRESENTATION_ONLY | No general City description owner; UI/market summaries are not City facts.                                       | DEFER_DECISION       | No change; accept only source-owned approved prose.                                           |
| City   | numeric population (not in v1) | Not represented; only a summary string exists | OPTIONAL_FACT     | Aggregate population is factual but is not an individually represented census.                                   | DEFER_DECISION       | No numeric field added; define scope and as-of semantics before schema evolution.             |

### Location

| Entity   | Field              | Current requirement  | Classification    | Simulation evidence                                                                                                       | Recommendation | Compatibility impact                                                                       |
| -------- | ------------------ | -------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| Location | `name`             | Required → optional  | OPTIONAL_FACT     | Stable LocationId exists, but no general public name authority was established; runtime/ruin labels are derived.          | MAKE_OPTIONAL  | Stable ID remains required; consumers use a fallback, never a fabricated Simulation label. |
| Location | `kind`             | Required             | DOMAIN_REQUIRED   | A public place category is needed to distinguish Location semantics; Simulation has not approved a general kind taxonomy. | KEEP_REQUIRED  | No weakening; absence of an approved kind still blocks that Location row.                  |
| Location | `parentLocationId` | Optional Location ID | UNRESOLVED        | LocalTopology containment does not establish a general World Exchange parent relation.                                    | DEFER_DECISION | No change; do not infer hierarchy from topology.                                           |
| Location | `cityId`           | Optional City ID     | OPTIONAL_FACT     | City/Site anchors exist, but City instance identity and owner join are open.                                              | DEFER_DECISION | No change; include only with stable endpoint mapping.                                      |
| Location | `description`      | Optional text        | PRESENTATION_ONLY | No general Location description source; renderer/diagnostic labels are not authoritative.                                 | DEFER_DECISION | No change.                                                                                 |

### Organization and Institution

| Entity       | Field         | Current requirement  | Classification    | Simulation evidence                                                                                     | Recommendation | Compatibility impact                                                        |
| ------------ | ------------- | -------------------- | ----------------- | ------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| Organization | `name`        | Required → optional  | OPTIONAL_FACT     | Legacy display labels do not promote generic Organization authority; a label is not identity.           | MAKE_OPTIONAL  | Does not change Organization's `DEFERRED` Simulation status.                |
| Organization | `type`        | Required             | DOMAIN_REQUIRED   | No promoted generic Organization type/owner exists.                                                     | KEEP_REQUIRED  | No change; the deferred entity cannot be synthesized to satisfy this field. |
| Organization | `cityId`      | Optional City ID     | UNRESOLVED        | No canonical generic Organization-to-City source.                                                       | DEFER_DECISION | No change.                                                                  |
| Organization | `locationId`  | Optional Location ID | UNRESOLVED        | No canonical generic Organization-to-Location source.                                                   | DEFER_DECISION | No change.                                                                  |
| Organization | `memberIds`   | Optional Person IDs  | UNRESOLVED        | Jobs, faction affiliation, officeholding, and spatial presence are not generic Organization membership. | DEFER_DECISION | No change.                                                                  |
| Organization | `factionIds`  | Optional Faction IDs | UNRESOLVED        | No generic Organization/Faction association authority.                                                  | DEFER_DECISION | No change.                                                                  |
| Organization | `description` | Optional text        | UNRESOLVED        | No approved domain source.                                                                              | DEFER_DECISION | No change.                                                                  |
| Institution  | `name`        | Required → optional  | OPTIONAL_FACT     | InstitutionRecord owns an ID and DisplayName, but a label is not the Institution identity.              | MAKE_OPTIONAL  | Existing named payloads remain valid; type stays required.                  |
| Institution  | `type`        | Required             | DOMAIN_REQUIRED   | Institution and Office records establish identity/incumbency, not a general Institution type.           | KEEP_REQUIRED  | No change; this missing required domain fact remains an exporter gap.       |
| Institution  | `cityId`      | Optional City ID     | UNRESOLVED        | No general Institution-to-City mapping is established.                                                  | DEFER_DECISION | No change.                                                                  |
| Institution  | `locationId`  | Optional Location ID | UNRESOLVED        | No general Institution-to-Location mapping is established.                                              | DEFER_DECISION | No change.                                                                  |
| Institution  | `memberIds`   | Optional Person IDs  | UNRESOLVED        | Office incumbent and tenure are not general membership.                                                 | DEFER_DECISION | No change; no officeholders are placed in this field by assumption.         |
| Institution  | `description` | Optional text        | PRESENTATION_ONLY | No general Institution description source.                                                              | DEFER_DECISION | No change.                                                                  |

### Faction

| Entity  | Field             | Current requirement       | Classification    | Simulation evidence                                                               | Recommendation | Compatibility impact                                                                                                      |
| ------- | ----------------- | ------------------------- | ----------------- | --------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Faction | `name`            | Required → optional       | OPTIONAL_FACT     | FactionStore requires stable FactionId but not a non-empty DisplayName.           | MAKE_OPTIONAL  | Allows an unnamed registered Faction to retain identity; does not create a name or alter World identity.                  |
| Faction | `ideology`        | Optional text             | UNRESOLVED        | Registration/active affiliation does not establish ideology.                      | DEFER_DECISION | No change; membership and Knowledge do not imply ideology.                                                                |
| Faction | `memberIds`       | Optional Person IDs       | OPTIONAL_FACT     | Active FactionAffiliationRecord facts identify current Faction→Person membership. | DEFER_DECISION | Keep optional; produce only from active records and resolve endpoints. Do not include ended tenure as current membership. |
| Faction | `cityIds`         | Optional City IDs         | UNRESOLVED        | No general Faction-to-City association source.                                    | DEFER_DECISION | No change.                                                                                                                |
| Faction | `organizationIds` | Optional Organization IDs | UNRESOLVED        | Generic Organization is deferred.                                                 | DEFER_DECISION | No change.                                                                                                                |
| Faction | `description`     | Optional text             | PRESENTATION_ONLY | No approved description source; political Knowledge is holder-scoped.             | DEFER_DECISION | No change; Knowledge must not become public description.                                                                  |

### Item

| Entity | Field                | Current requirement    | Classification    | Simulation evidence                                                                                  | Recommendation | Compatibility impact                                                         |
| ------ | -------------------- | ---------------------- | ----------------- | ---------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------- |
| Item   | `name`               | Required → optional    | OPTIONAL_FACT     | `ItemData.itemName` labels a definition, but definition identity is not a unique held Item identity. | MAKE_OPTIONAL  | Does not decide whether Item means definition, instance, or stack.           |
| Item   | `type`               | Required               | DOMAIN_REQUIRED   | Canonical ItemData does not establish the required public Item type.                                 | KEEP_REQUIRED  | No change; an Item row remains blocked without an approved type and meaning. |
| Item   | `ownerId`            | Optional any-entity ID | UNRESOLVED        | Stock, ownership, market custody, and merchant Knowledge are distinct.                               | DEFER_DECISION | No change; do not assign one definition a single owner.                      |
| Item   | `locationId`         | Optional Location ID   | UNRESOLVED        | Aggregate stock/custody does not establish a unique Item location.                                   | DEFER_DECISION | No change.                                                                   |
| Item   | `description`        | Optional text          | PRESENTATION_ONLY | No approved Item description source; resolved labels and market prose are presentation.              | DEFER_DECISION | No change.                                                                   |
| Item   | quantity (not in v1) | Not represented        | UNRESOLVED        | Aggregate stock is mutable quantity by definition/settlement/custodian, not an Item instance.        | DEFER_DECISION | No quantity field added; decide Item meaning and ownership/custody first.    |

### HistoricalEvent

| Entity          | Field                               | Current requirement                                             | Classification    | Simulation evidence                                                                                                                | Recommendation | Compatibility impact                                                                                      |
| --------------- | ----------------------------------- | --------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| HistoricalEvent | `title`                             | Required non-empty string                                       | DOMAIN_REQUIRED   | v1 has no separate event type/summary field; an ID and time alone do not say what the occurrence was.                              | KEEP_REQUIRED  | No change; a retained record without an approved title/semantic summary is not emitted as this v1 entity. |
| HistoricalEvent | `year`                              | Optional individually; at least `year` or `occurredAt` required | DOMAIN_REQUIRED   | Simulation uses absolute days/custom calendars and finer logical order; no generic mapping is approved.                            | KEEP_REQUIRED  | Preserve the conditional time invariant; do not label an absolute day as Gregorian year.                  |
| HistoricalEvent | `occurredAt`                        | Optional individually; at least `year` or `occurredAt` required | DOMAIN_REQUIRED   | Same custom-calendar, precision, and time-zone/format gap.                                                                         | KEEP_REQUIRED  | Preserve conditional invariant; a non-empty string is not itself a calendar contract.                     |
| HistoricalEvent | `description`                       | Optional text                                                   | UNRESOLVED        | Retained outcomes may provide source-owned facts; chronicles, decisions, and diagnostic prose are derived or perspective-specific. | DEFER_DECISION | No change; only approved retained outcome/history records may supply it.                                  |
| HistoricalEvent | `participantIds`                    | Optional Person IDs                                             | OPTIONAL_FACT     | Event actor, target, decision evidence, or chronicle role alone does not prove participation.                                      | DEFER_DECISION | No change; map only explicit participants from an approved retained record.                               |
| HistoricalEvent | `locationIds`                       | Optional Location IDs                                           | OPTIONAL_FACT     | A retained event's Location needs stable event and Location identities; current position is not historical participation.          | DEFER_DECISION | No change.                                                                                                |
| HistoricalEvent | `relatedEntityIds`                  | Optional any-entity IDs                                         | UNRESOLVED        | No general event/entity link or retention semantics.                                                                               | DEFER_DECISION | No change; validate all refs if eventually supplied.                                                      |
| HistoricalEvent | stable event identity source        | `id` required; generic Simulation identity absent               | IDENTITY_REQUIRED | Some domain records have scoped IDs; EventId/RecordSequence are not proven cross-run public identities.                            | KEEP_REQUIRED  | Do not hash fields or reuse runtime/session event sequences.                                              |
| HistoricalEvent | event type (not in v1)              | Not represented                                                 | UNRESOLVED        | There is no generic public event catalog.                                                                                          | DEFER_DECISION | No field added; `title` remains required until event semantics are deliberately evolved.                  |
| HistoricalEvent | as-of/retention context (not in v1) | Not represented                                                 | UNRESOLVED        | DomainEventStore and HistoryStore have separate lifetime/retention; v1 has no payload timestamp.                                   | DEFER_DECISION | No field added; a future source and coverage contract is required.                                        |

### Relationship

| Entity       | Field                              | Current requirement                                                         | Classification    | Simulation evidence                                                                                          | Recommendation       | Compatibility impact                                                                                             |
| ------------ | ---------------------------------- | --------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Relationship | `sourceId`                         | Required any-entity ID                                                      | DOMAIN_REQUIRED   | Objective relations have different authorities; endpoint order can encode a directed relation.               | KEEP_REQUIRED        | No change; endpoint must resolve in the same payload.                                                            |
| Relationship | `targetId`                         | Required any-entity ID                                                      | DOMAIN_REQUIRED   | Same as `sourceId`; no recursive endpoint objects.                                                           | KEEP_REQUIRED        | No change.                                                                                                       |
| Relationship | `type`                             | Required non-empty string                                                   | DOMAIN_REQUIRED   | Faction affiliation, parentage, office incumbency, and appraisal are not one relation type system.           | KEEP_REQUIRED        | No change; only approved public relation vocabulary may be emitted.                                              |
| Relationship | `label`                            | Optional text                                                               | PRESENTATION_ONLY | A renderer label does not establish relation semantics or direction.                                         | MOVE_TO_PRESENTATION | Keep v1 compatibility; derive labels from approved type in consumers where useful.                               |
| Relationship | `description`                      | Optional text                                                               | UNRESOLVED        | No common objective description source; directed NPC appraisals and SocialReaction are perspective-specific. | DEFER_DECISION       | No change; no free-text interpretation becomes a relation fact.                                                  |
| Relationship | `sinceYear`                        | Optional number                                                             | OPTIONAL_FACT     | Temporal validity exists for some domain relationships, but calendars and edge lifecycles differ.            | DEFER_DECISION       | No change; do not map custom absolute days to this field without a rule.                                         |
| Relationship | directionality (no separate field) | Encoded, if applicable, by ordered `sourceId`/`targetId`; no symmetric flag | UNRESOLVED        | Simulation has directed affiliations and appraisals plus other relation types with distinct meaning.         | DEFER_DECISION       | No new flag; approve type-specific direction, cardinality, and inverse semantics before generic edge projection. |

## Tension recommendations

| Tension                                                | Recommendation                                                                                                               | Decision                                                                                                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| World root and display name                            | `KEEP_REQUIRED` for the World object and `world.id`; `MAKE_OPTIONAL` for `world.name`                                        | Select option B. Keep one World scope anchor. This is an External payload rule, not a claim that Simulation owns a World aggregate.                          |
| Person identity and display name                       | `KEEP_REQUIRED` for stable identity; `MAKE_OPTIONAL` for `name`                                                              | PersonId remains the identity. Age/birth and source cohort remain unresolved.                                                                                |
| Person residence and current Location                  | `DEFER_DECISION`                                                                                                             | Keep the fields optional and separate. Residence needs a City crosswalk; current Location must be factual `At` state, never actor Knowledge or a route plan. |
| City identity, name, population, and Location          | `KEEP_REQUIRED` for City ID; `MAKE_OPTIONAL` for `name`; `MOVE_TO_PRESENTATION` for `populationSummary`; defer Location join | City instance identity and population/as-of semantics remain open. No census is inferred from aggregate counts.                                              |
| Location identity, name, and kind                      | `KEEP_REQUIRED` for ID and `kind`; `MAKE_OPTIONAL` for `name`                                                                | LocationId is stable. Keep a factual public kind requirement; its taxonomy/authority remains a Simulation-side question.                                     |
| Institution identity, name, and type                   | `KEEP_REQUIRED` for ID and type; `MAKE_OPTIONAL` for `name`                                                                  | InstitutionId and DisplayName exist; type, membership, City, and Location rules remain open.                                                                 |
| Faction identity, display name, and affiliation        | `KEEP_REQUIRED` for ID; `MAKE_OPTIONAL` for `name`; `DEFER_DECISION` on duplicated affiliation fields                        | FactionId is stable and active affiliation endpoints are facts. Do not imply support, loyalty, or shared Knowledge.                                          |
| Item definition/instance, owner/Location, and quantity | `KEEP_REQUIRED` for selected Item ID and type; `DEFER_DECISION` for what the ID means and related fields                     | No quantity or ownership/custody schema is added. A definition ID is not a unique held Item.                                                                 |
| HistoricalEvent ID/title/time/participants             | `KEEP_REQUIRED` for ID, title, and one time value; `DEFER_DECISION` on source/lifecycle/calendar/participant rules           | Current facts and choices are not history. No generic event identity or calendar mapping is established.                                                     |
| Relationship ID/endpoints/type/direction               | `KEEP_REQUIRED` for ID, endpoints, and type; `DEFER_DECISION` on relation vocabulary and direction/cardinality rules         | Do not hash endpoints or flatten appraisals into objective relations. Direct affiliation fields are not duplicated as generic edges.                         |
| Organization                                           | `DEFER_DECISION`                                                                                                             | Keep Simulation's generic Organization status deferred. Optionalizing a label changes no source authority or abstraction.                                    |

## Factual-world-truth and Knowledge policy

Optional labels are omitted when no source-owned label exists. Consumers may
render a generic or ID-derived label, but that value is presentation and never
flows back into World Exchange as Simulation truth. Stable IDs are never
derived from names, filenames, labels, or consumer paths.

Only facts read from the owning Simulation authority may be projected.
Faction membership may use active affiliation records; ended affiliations are
history. A Person's factual current position is distinct from residence and
from actor-held spatial Knowledge. Political beliefs, market observations,
appraisals, route estimates, decision evidence, SocialReaction, and perceived
attribution stay outside factual World Exchange. A source-authoritative event
record is distinct from current state, a choice, an activity, a chronicle, a
snapshot, or a diff.

P12 save/persistence data is not a World Exchange source. Read projection
does not imply authoring/import, conflict handling, or runtime mutation.
The External schema remains a public read model and must not expose Simulation
classes, Stores, Unity types, or persistence internals.

## Unsupported and ambiguous areas

- A canonical Simulation World ID and lifecycle do not exist in the inspected
  evidence. Making the World label optional does not unblock a full payload.
- Person projection scope remains open, including dormant, unnamed, dead, and
  non-materialized identities; birth and age need time/calendar semantics.
- City instance identity and residence crosswalk are not generally approved.
- Location kind/type taxonomy remains required by v1 and has no general public
  Simulation authority. Location names are optional and must not be synthesized.
- Institution type and general membership are absent; office incumbency is not
  membership.
- Generic Organization remains explicitly deferred.
- Item definition/instance/stack meaning, type, quantity, owner, location, and
  custody remain unresolved.
- Historical event identity, source subset, retention, title semantics,
  participant rules, visibility, calendar, and as-of ordering remain unresolved.
- Generic Relationship identity, type vocabulary, direction, multiplicity,
  inverse semantics, and validity remain unresolved.
- Required entity arrays have no completeness/capability marker. The prototype's
  out-of-band omission list is not part of World Exchange; consumers must not
  read an unsupported empty collection as proof of factual absence. Define
  coverage semantics before treating a real exchange as a complete world view.
- `tags`, arbitrary `metadata`, population summaries, importance rankings, and
  display prose must not become channels for consumer preferences or internal
  Simulation state.

## Future adapter responsibilities

A real adapter, after separate Simulation approval, must:

1. Read a Simulation-approved immutable, read-only domain view at a coherent
   point without starting, advancing, mutating, hydrating, or saving Simulation.
2. Select an explicit and documented World ID. A label, profile, seed, config,
   asset, or runtime object cannot substitute for it.
3. Encode source-owned stable IDs using an approved, versioned, type-scoped map;
   preserve identity independently from optional labels and presentation paths.
4. Include only source-owned labels and facts. Do not create fallback names,
   inferred descriptions, or consumer curation in the exchange.
5. Keep current truth, actor Knowledge, derived displays, and retained history
   separate; exclude actor-specific Knowledge from the factual payload.
6. Resolve City, Location, membership, owner, participant, and relationship
   references only when their source meaning and stable endpoints are approved.
7. Emit HistoricalEvents only from an approved retained-record subset with
   stable IDs, explicit time/calendar and retention semantics, and proven
   participants/Locations.
8. Define whether each collection is complete or partial and how unsupported
   concepts differ from factual emptiness. Report omissions without implying
   unsupported arrays are complete.
9. Validate the public payload with `world-schema`; expose no Simulation
   runtime class, Store, Unity type, P12 structure, or consumer model.
10. Keep read projection separate from future authoring/import. No IPC, REST,
    sockets, in-Simulation server, save reading, mutation, or Mod API is in
    scope here.

## Exact prerequisites for a real exporter

1. Simulation maintainers approve the owning read-only projection port, its
   immutable result shape, coherent read point, lifecycle/versioning, and
   repository/assembly ownership.
2. Simulation defines a durable World ID and its lifecycle. World display name
   is optional in v1 and is not a prerequisite.
3. The producer defines Person projection scope and approved City instance IDs;
   City/residence and Person-position/Location/Hex/InTransit joins preserve
   their distinct meanings.
4. Source authorities and semantics are approved for every required field
   still present: Location.kind, Institution.type, Item.type, HistoricalEvent
   title/time, and Relationship endpoints/type. Optional labels are included
   only when source-owned and non-empty.
5. An approved source-to-World-Exchange ID map defines type scoping, encoding,
   uniqueness, rename/reuse/deletion behavior, and cross-run stability. No IDs
   derive from names, filenames, array order, runtime allocation, or hashes of
   ambiguous relation endpoints.
6. Faction affiliation field ownership and redundancy are settled; only active
   affiliation facts populate current membership. Generic Organization,
   Institution membership, and any generic relationship edges have explicit
   source/type/direction/cardinality/lifecycle decisions.
7. Item meaning (definition, unique instance, stack), owner versus custodian,
   location, quantity, and type are resolved before any Item mapping.
8. An approved retained-event subset defines event IDs, title/meaning, time and
   calendar conversion, retention, visibility, participants, Locations, and
   as-of/order behavior.
9. Exchange completeness semantics distinguish factual empty collections from
   unsupported/partial source coverage. Omission behavior and consumer handling
   are versioned and tested.
10. Conformance checks cover repeated-export ID stability, no fabricated labels,
    dangling/duplicate IDs, Knowledge exclusion, history boundaries, consistent
    reads, Web/Markdown fallbacks, and no runtime mutation/advance.
11. A separate coordinated implementation plan is approved. This review
    authorizes no transport, persistence access, runtime coupling, authoring,
    import, mutation, or Mod API behavior.

## Open architecture questions

- How will an approved read port expose WI-A `WorldId`, how will it map to
  `world.id`, and what compatibility applies to older or migrated Worlds?
- What is the intended Person projection cohort, including unnamed and dormant
  Persons, and who owns the read-consistent scope cut?
- How does P14-A's bounded settlement identity relate, if at all, to a general
  City instance ID and Person residence?
- Which Person positions map to a Location, and how are Hex-only and InTransit
  represented without turning Knowledge into truth?
- What is the public Location kind taxonomy? Are Hex, Location, Crossing, Site,
  and LocalTopology distinct exchange concepts?
- What is the required Institution type, and should Office/incumbency be
  represented by a future entity, a typed edge, or remain outside v1?
- Does an Item represent a definition, stack, or unique object, and where do
  quantity, owner, market custody, and Location belong?
- Which retained records are HistoricalEvents, and how do custom calendars,
  retention, visibility, and stable IDs survive reinitialization?
- Which objective relationships belong in v1, and what type, direction,
  cardinality, ID, and temporal validity rules apply?
- Does World Exchange describe a complete world or a declared partial
  projection, and how should unsupported collections be represented?
- Which boundary owns the approved source port and conformance suite without
  importing Simulation runtime or consumer packages?

## Review outcome

The External contract change is limited to optional, non-empty-if-present
display names on World and the seven entity types with a `name` field. World metadata and all
collections remain required; stable IDs, Location kind, Organization and
Institution types, Item type, HistoricalEvent title/time, and Relationship
endpoints/type remain required. No Simulation files, runtime exporter, schema
version bump, transport, persistence path, or mutation behavior is introduced.
