# World Exchange v1

## Purpose and philosophy

World Exchange is a renderer-agnostic, read-oriented projection for external tools. V1 was first proven with fixtures and can now be carried as a portable JSON artifact; it is not a save format or runtime snapshot. It must not expose Unity objects, runtime classes, internal Stores, persistence receipts, mutation epochs, hydration details, or continuation state.

## Versioning and compatibility

Every payload carries `schemaVersion: 1`. Changes that preserve the meaning of existing fields may be additive and optional; changes that alter meanings or required structure need a new schema version and a deliberate migration or coexistence strategy. Consumers should reject unsupported major versions and should not assume that optional fields are present. Validation belongs in `world-schema` and runs at runtime for fixture/import boundaries.

## IDs and references

Every entity has a stable, non-empty string `id`, unique within one world payload. Relationships use IDs rather than embedding complete entity objects. A file name, display name, array position, or renderer-specific URL is never an identity. World metadata is a required scope object with a stable `id`; its `name` is optional presentation metadata. Entity `name` labels are also optional and, when present, must be non-empty. Consumers provide an ID-based or generic display fallback rather than writing a generated label back into the exchange. Reference validation reports IDs that do not resolve in the payload. Public `metadata`, when present, contains only documented external values and must not become a tunnel for internal runtime state.

## V1 shape

A payload contains schema version, required World scope metadata, and collections for people, cities, locations, organizations, institutions, factions, items, historical events, and relationships. World metadata has a stable ID and may include a display name, era, description, tags, and JSON metadata. Every entity has a stable ID and may include tags and JSON metadata. Person, City, Location, Organization, Institution, Faction, and Item have optional display names. Location also requires a `kind`; Organization, Institution, and Item require a `type`. HistoricalEvent requires a `title` and a time value. Relationship requires source/target IDs and a type. These domain fields remain separate from optional presentation labels.

V1 supports:

- People with optional display name, residence and location references, age where useful, organization/faction memberships, and relationship references.
- Cities with optional display name, location, population summary, organization references, and important people.
- Locations with optional display name and parent/city references and a required public kind.
- Organizations and institutions with optional display names and city/location/member references; each requires a domain `type`.
- Factions with optional display name and member references.
- Items with optional display name, owner, and location references. `ownerId` may reference any supported entity type; `type` remains required.
- Historical events with a title, a required finite `year` or non-empty `occurredAt` date/time string, optional description, participant IDs, location IDs, and related entity IDs.
- General relationships with source and target IDs, a type, and optional description/public metadata. Endpoints may be any supported entity type, not only people.

See exported TypeScript contracts for exact optionality and validation behavior.

## Portable JSON artifacts

The `world-io` package reads and writes normal UTF-8 JSON World Exchange v1
documents using the `*.world.json` convention. It delegates entity validation
to this schema, rejects malformed or unsupported input without repair, and
does not generate missing identity or labels. Serialization sorts object keys
recursively while preserving array order. The file is a potentially stale
exchange artifact, not persistence or a mutable canonical database. See
[Portable World Exchange](PORTABLE_WORLD_EXCHANGE.md) for the API, consumer
flows, and compatibility behavior.

## Relationship rules

Domain entities expose convenient explicit ID fields for common navigation. The `relationships` collection represents typed edges that do not fit a single entity's direct fields, including family, social, or political ties. All IDs in such fields must resolve to entities in the same exchange, except references explicitly documented as optional external references in future versions. Relationships do not recursively embed endpoints.

## Future evolution

Keep v1 focused. Add new domain fields only when a consumer need is concrete; do not pre-model the entire Simulation domain. Do not silently reuse this contract for persistence or live commands. A future exporter must map internal data into this public projection under a separately reviewed integration contract.

Web Explorer and Obsidian are reference consumers, not schema authorities. A
consumer request must first be classified as a shared external domain fact,
reusable integration capability, presentation concern, or consumer-specific
convenience. Only approved cross-consumer domain facts should pressure this
contract; presentation and consumer convenience stay out of mandatory schema.
See [External Platform Surface](EXTERNAL_PLATFORM_SURFACE.md) for the review
rule and compatibility layers.
