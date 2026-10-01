# World Exchange v1

## Purpose and philosophy

World Exchange is a renderer-agnostic, read-oriented projection for external tools. V1 proves the boundary with fixtures; it is not a save format, a runtime snapshot, or a transport protocol. It must not expose Unity objects, runtime classes, internal Stores, persistence receipts, mutation epochs, hydration details, or continuation state.

## Versioning and compatibility

Every payload carries `schemaVersion: 1`. Changes that preserve the meaning of existing fields may be additive and optional; changes that alter meanings or required structure need a new schema version and a deliberate migration or coexistence strategy. Consumers should reject unsupported major versions and should not assume that optional fields are present. Validation belongs in `world-schema` and runs at runtime for fixture/import boundaries.

## IDs and references

Every entity has a stable, non-empty string `id`, unique within one world payload. Relationships use IDs rather than embedding complete entity objects. A file name, display name, array position, or renderer-specific URL is never an identity. Reference validation reports IDs that do not resolve in the payload. Public `metadata`, when present, contains only documented external values and must not become a tunnel for internal runtime state.

## V1 shape

A payload contains schema version, world metadata, and collections for people, cities, locations, organizations, institutions, factions, items, historical events, and relationships. World metadata has a stable ID and name, and may include era, description, tags, and JSON metadata. Every entity has a stable ID and may include tags and JSON metadata; each entity type adds its own display name or title and optional descriptive fields.

V1 supports:

- People with optional residence and location references, age where useful, organization/faction memberships, and relationship references.
- Cities with location, population summary, organization references, and important people.
- Locations with optional parent/city references and a kind suitable for display.
- Organizations and institutions with optional city/location and member references.
- Factions with member references.
- Items with optional owner and location references. `ownerId` may reference any supported entity type.
- Historical events with a title, a required finite `year` or non-empty `occurredAt` date/time string, optional description, participant IDs, location IDs, and related entity IDs.
- General relationships with source and target IDs, a type, and optional description/public metadata. Endpoints may be any supported entity type, not only people.

See exported TypeScript contracts for exact optionality and validation behavior.

## Relationship rules

Domain entities expose convenient explicit ID fields for common navigation. The `relationships` collection represents typed edges that do not fit a single entity's direct fields, including family, social, or political ties. All IDs in such fields must resolve to entities in the same exchange, except references explicitly documented as optional external references in future versions. Relationships do not recursively embed endpoints.

## Future evolution

Keep v1 focused. Add new domain fields only when a consumer need is concrete; do not pre-model the entire Simulation domain. Do not silently reuse this contract for persistence or live commands. A future exporter must map internal data into this public projection under a separately reviewed integration contract.
