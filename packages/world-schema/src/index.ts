export type JsonValue =
  string | number | boolean | null | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface BaseEntity {
  id: string;
  tags?: string[];
  metadata?: JsonObject;
}

export interface WorldMetadata extends BaseEntity {
  name?: string;
  description?: string;
  era?: string;
}

export interface Person extends BaseEntity {
  name?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  residenceId?: string;
  locationId?: string;
  organizationIds?: string[];
  institutionIds?: string[];
  factionIds?: string[];
  relationshipIds?: string[];
  biography?: string;
}

export interface City extends BaseEntity {
  name?: string;
  region?: string;
  populationSummary?: string;
  foundedYear?: number;
  locationId?: string;
  organizationIds?: string[];
  importantPersonIds?: string[];
  description?: string;
}

export interface Location extends BaseEntity {
  name?: string;
  kind: string;
  parentLocationId?: string;
  cityId?: string;
  description?: string;
}

export interface Organization extends BaseEntity {
  name?: string;
  type: string;
  cityId?: string;
  locationId?: string;
  memberIds?: string[];
  factionIds?: string[];
  description?: string;
}

export interface Institution extends BaseEntity {
  name?: string;
  type: string;
  cityId?: string;
  locationId?: string;
  memberIds?: string[];
  description?: string;
}

export interface Faction extends BaseEntity {
  name?: string;
  ideology?: string;
  memberIds?: string[];
  cityIds?: string[];
  organizationIds?: string[];
  description?: string;
}

export interface Item extends BaseEntity {
  name?: string;
  type: string;
  ownerId?: string;
  locationId?: string;
  description?: string;
}

export interface HistoricalEvent extends BaseEntity {
  title: string;
  year?: number;
  occurredAt?: string;
  description?: string;
  participantIds?: string[];
  locationIds?: string[];
  relatedEntityIds?: string[];
}

export interface Relationship extends BaseEntity {
  sourceId: string;
  targetId: string;
  type: string;
  label?: string;
  description?: string;
  sinceYear?: number;
}

export type WorldExchangeCollectionName =
  | "people"
  | "cities"
  | "locations"
  | "organizations"
  | "institutions"
  | "factions"
  | "items"
  | "historicalEvents"
  | "relationships";

export type WorldExchangeCollectionCoverageStatus =
  "INCLUDED" | "KNOWN_EMPTY" | "UNSUPPORTED" | "NOT_INCLUDED";

export type WorldExchangeCollectionCoverage = Record<
  WorldExchangeCollectionName,
  WorldExchangeCollectionCoverageStatus
>;

interface WorldExchangeCollections {
  world: WorldMetadata;
  people: Person[];
  cities: City[];
  locations: Location[];
  organizations: Organization[];
  institutions: Institution[];
  factions: Faction[];
  items: Item[];
  historicalEvents: HistoricalEvent[];
  relationships: Relationship[];
}

/** A portable, world-scoped read projection with ID-based references. */
export interface WorldExchangeV1 extends WorldExchangeCollections {
  schemaVersion: 1;
}

/** V2 makes whole-World collection coverage explicit for every array. */
export interface WorldExchangeV2 extends WorldExchangeCollections {
  schemaVersion: 2;
  collectionCoverage: WorldExchangeCollectionCoverage;
}

export type WorldExchange = WorldExchangeV1 | WorldExchangeV2;
export type EffectiveCollectionCoverage =
  WorldExchangeCollectionCoverageStatus | "LEGACY_UNKNOWN";

export type WorldEntity =
  | WorldMetadata
  | Person
  | City
  | Location
  | Organization
  | Institution
  | Faction
  | Item
  | HistoricalEvent
  | Relationship;

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}

export type ValidationResult =
  | { valid: true; value: WorldExchange; issues: [] }
  | { valid: false; issues: ValidationIssue[] };

export interface WorldExchangeIndex {
  world: WorldMetadata;
  byId: ReadonlyMap<string, WorldEntity>;
  people: ReadonlyMap<string, Person>;
  cities: ReadonlyMap<string, City>;
  locations: ReadonlyMap<string, Location>;
  organizations: ReadonlyMap<string, Organization>;
  institutions: ReadonlyMap<string, Institution>;
  factions: ReadonlyMap<string, Faction>;
  items: ReadonlyMap<string, Item>;
  historicalEvents: ReadonlyMap<string, HistoricalEvent>;
  relationships: ReadonlyMap<string, Relationship>;
  peopleByCityId: ReadonlyMap<string, readonly Person[]>;
  relationshipsByEntityId: ReadonlyMap<string, readonly Relationship[]>;
}

type CollectionName = WorldExchangeCollectionName;
type RefCollection = CollectionName | "*";

interface EntityDefinition {
  requiredStrings?: string[];
  optionalStrings?: string[];
  optionalNonEmptyStrings?: string[];
  optionalNumbers?: string[];
  scalarRefs?: Record<string, RefCollection>;
  arrayRefs?: Record<string, RefCollection>;
}

export const WORLD_EXCHANGE_COLLECTIONS: readonly CollectionName[] = [
  "people",
  "cities",
  "locations",
  "organizations",
  "institutions",
  "factions",
  "items",
  "historicalEvents",
  "relationships",
];

const collectionNames: CollectionName[] = [...WORLD_EXCHANGE_COLLECTIONS];

const definitions: Record<CollectionName, EntityDefinition> = {
  people: {
    optionalNonEmptyStrings: ["name"],
    optionalStrings: ["gender", "occupation", "biography"],
    optionalNumbers: ["age"],
    scalarRefs: { residenceId: "cities", locationId: "locations" },
    arrayRefs: {
      organizationIds: "organizations",
      institutionIds: "institutions",
      factionIds: "factions",
      relationshipIds: "relationships",
    },
  },
  cities: {
    optionalNonEmptyStrings: ["name"],
    optionalStrings: ["region", "description", "populationSummary"],
    optionalNumbers: ["foundedYear"],
    scalarRefs: { locationId: "locations" },
    arrayRefs: {
      organizationIds: "organizations",
      importantPersonIds: "people",
    },
  },
  locations: {
    requiredStrings: ["kind"],
    optionalNonEmptyStrings: ["name"],
    optionalStrings: ["description"],
    scalarRefs: { parentLocationId: "locations", cityId: "cities" },
  },
  organizations: {
    requiredStrings: ["type"],
    optionalNonEmptyStrings: ["name"],
    optionalStrings: ["description"],
    scalarRefs: { cityId: "cities", locationId: "locations" },
    arrayRefs: { memberIds: "people", factionIds: "factions" },
  },
  institutions: {
    requiredStrings: ["type"],
    optionalNonEmptyStrings: ["name"],
    optionalStrings: ["description"],
    scalarRefs: { cityId: "cities", locationId: "locations" },
    arrayRefs: { memberIds: "people" },
  },
  factions: {
    optionalNonEmptyStrings: ["name"],
    optionalStrings: ["ideology", "description"],
    arrayRefs: {
      memberIds: "people",
      cityIds: "cities",
      organizationIds: "organizations",
    },
  },
  items: {
    requiredStrings: ["type"],
    optionalNonEmptyStrings: ["name"],
    optionalStrings: ["description"],
    scalarRefs: { ownerId: "*", locationId: "locations" },
  },
  historicalEvents: {
    requiredStrings: ["title"],
    optionalStrings: ["occurredAt", "description"],
    optionalNumbers: ["year"],
    arrayRefs: {
      participantIds: "people",
      locationIds: "locations",
      relatedEntityIds: "*",
    },
  },
  relationships: {
    requiredStrings: ["type"],
    optionalStrings: ["label", "description"],
    optionalNumbers: ["sinceYear"],
    scalarRefs: { sourceId: "*", targetId: "*" },
  },
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isJsonValue(
  value: unknown,
  ancestors = new WeakSet<object>(),
): value is JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (ancestors.has(value)) return false;
  ancestors.add(value);
  let valid: boolean;
  if (Array.isArray(value)) {
    valid = value.every((entry) => isJsonValue(entry, ancestors));
  } else {
    const prototype = Object.getPrototypeOf(value);
    valid =
      (prototype === Object.prototype || prototype === null) &&
      Object.values(value).every((entry) => isJsonValue(entry, ancestors));
  }
  ancestors.delete(value);
  return valid;
}

function isJsonObject(value: unknown): value is JsonObject {
  return isRecord(value) && isJsonValue(value);
}

interface Reference {
  id: string;
  targetCollection: RefCollection;
  path: string;
}

/** Validate the portable world exchange structure and its entity references. */
export function validateWorldExchange(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  const knownIds = new Map<string, string>();
  const entitiesByCollection = new Map<CollectionName, unknown[]>();
  const references: Reference[] = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      issues: [
        {
          path: "$",
          code: "invalid-type",
          message: "Expected a world exchange object.",
        },
      ],
    };
  }

  if (input["schemaVersion"] !== 1 && input["schemaVersion"] !== 2) {
    issues.push({
      path: "$.schemaVersion",
      code: "unsupported-schema-version",
      message: "schemaVersion must be 1 or 2.",
    });
  }

  if (
    input["schemaVersion"] === 1 &&
    Object.prototype.hasOwnProperty.call(input, "collectionCoverage")
  ) {
    issues.push({
      path: "$.collectionCoverage",
      code: "unexpected-collection-coverage",
      message: "collectionCoverage is only valid when schemaVersion is 2.",
    });
  }

  const world = input["world"];
  if (!isRecord(world)) {
    issues.push({
      path: "$.world",
      code: "invalid-type",
      message: "Expected world metadata object.",
    });
  } else {
    validateEntity(
      world,
      "$.world",
      {
        requiredStrings: ["id"],
        optionalNonEmptyStrings: ["name"],
        optionalStrings: ["description", "era"],
      },
      issues,
    );
    const worldId = world["id"];
    if (nonEmptyString(worldId)) registerId(worldId, "$.world.id");
  }

  for (const collection of collectionNames) {
    const value = input[collection];
    if (!Array.isArray(value)) {
      issues.push({
        path: `$.${collection}`,
        code: "invalid-type",
        message: "Expected an array.",
      });
      entitiesByCollection.set(collection, []);
      continue;
    }

    entitiesByCollection.set(collection, value);
    value.forEach((entity: unknown, index: number) => {
      const path = `$.${collection}[${index}]`;
      if (!isRecord(entity)) {
        issues.push({
          path,
          code: "invalid-type",
          message: "Expected an entity object.",
        });
        return;
      }

      const definition = definitions[collection];
      validateEntity(entity, path, definition, issues);
      if (collection === "historicalEvents")
        validateHistoricalEventTime(entity, path, issues);
      const id = entity["id"];
      if (nonEmptyString(id)) registerId(id, `${path}.id`);

      for (const [field, targetCollection] of Object.entries(
        definition.scalarRefs ?? {},
      )) {
        const refId = entity[field];
        if (refId !== undefined && nonEmptyString(refId)) {
          references.push({
            id: refId,
            targetCollection,
            path: `${path}.${field}`,
          });
        }
      }
      for (const [field, targetCollection] of Object.entries(
        definition.arrayRefs ?? {},
      )) {
        const refIds = entity[field];
        if (Array.isArray(refIds)) {
          refIds.forEach((refId: unknown, refIndex: number) => {
            if (nonEmptyString(refId)) {
              references.push({
                id: refId,
                targetCollection,
                path: `${path}.${field}[${refIndex}]`,
              });
            }
          });
        }
      }
    });
  }

  if (input["schemaVersion"] === 2) {
    validateCollectionCoverage(
      input["collectionCoverage"],
      entitiesByCollection,
      issues,
    );
  }

  for (const reference of references) {
    if (reference.targetCollection === "*") {
      if (!knownIds.has(reference.id)) {
        issues.push({
          path: reference.path,
          code: "dangling-reference",
          message: `No world entity has id "${reference.id}".`,
        });
      }
      continue;
    }
    const targetEntities =
      entitiesByCollection.get(reference.targetCollection) ?? [];
    if (
      !targetEntities.some(
        (entity) => isRecord(entity) && entity["id"] === reference.id,
      )
    ) {
      issues.push({
        path: reference.path,
        code: "dangling-reference",
        message: `No ${reference.targetCollection} entity has id "${reference.id}".`,
      });
    }
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, issues: [], value: input as unknown as WorldExchange };

  function registerId(id: string, path: string): void {
    const firstPath = knownIds.get(id);
    if (firstPath !== undefined) {
      issues.push({
        path,
        code: "duplicate-id",
        message: `ID "${id}" is already used at ${firstPath}.`,
      });
    } else {
      knownIds.set(id, path);
    }
  }
}

function validateCollectionCoverage(
  input: unknown,
  entitiesByCollection: ReadonlyMap<CollectionName, unknown[]>,
  issues: ValidationIssue[],
): void {
  if (!isRecord(input)) {
    issues.push({
      path: "$.collectionCoverage",
      code: "invalid-type",
      message: "Expected a collection coverage object in schema version 2.",
    });
    return;
  }

  for (const key of Object.keys(input)) {
    if (!collectionNames.includes(key as CollectionName)) {
      issues.push({
        path: `$.collectionCoverage.${key}`,
        code: "unknown-collection",
        message: `Unknown collection coverage key "${key}".`,
      });
    }
  }

  for (const collection of collectionNames) {
    const path = `$.collectionCoverage.${collection}`;
    const status = input[collection];
    if (status === undefined) {
      issues.push({
        path,
        code: "missing-collection-coverage",
        message: "Every World Exchange collection requires a coverage status.",
      });
      continue;
    }
    if (
      status !== "INCLUDED" &&
      status !== "KNOWN_EMPTY" &&
      status !== "UNSUPPORTED" &&
      status !== "NOT_INCLUDED"
    ) {
      issues.push({
        path,
        code: "invalid-collection-coverage",
        message:
          "Expected INCLUDED, KNOWN_EMPTY, UNSUPPORTED, or NOT_INCLUDED.",
      });
      continue;
    }

    const entities = entitiesByCollection.get(collection) ?? [];
    const hasEntities = entities.length > 0;
    const consistent =
      (status === "INCLUDED" && hasEntities) ||
      (status !== "INCLUDED" && !hasEntities);
    if (!consistent) {
      issues.push({
        path,
        code: "contradictory-collection-coverage",
        message:
          status === "INCLUDED"
            ? "INCLUDED requires one or more entities in the collection."
            : `${status} requires an empty collection array.`,
      });
    }
  }
}

/** Return the declared status, or LEGACY_UNKNOWN for an unannotated v1 array. */
export function getWorldExchangeCollectionCoverage(
  exchange: WorldExchange,
  collection: WorldExchangeCollectionName,
): EffectiveCollectionCoverage {
  return exchange.schemaVersion === 2
    ? exchange.collectionCoverage[collection]
    : "LEGACY_UNKNOWN";
}

function validateEntity(
  entity: UnknownRecord,
  path: string,
  definition: EntityDefinition,
  issues: ValidationIssue[],
): void {
  const addIssue = (field: string, code: string, message: string): void => {
    issues.push({ path: `${path}.${field}`, code, message });
  };

  for (const field of ["id", ...(definition.requiredStrings ?? [])]) {
    if (!nonEmptyString(entity[field]))
      addIssue(field, "required-string", "Expected a non-empty string.");
  }
  if (entity["metadata"] !== undefined && !isJsonObject(entity["metadata"])) {
    addIssue(
      "metadata",
      "invalid-type",
      "Expected a JSON object when provided.",
    );
  }
  const tags = entity["tags"];
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      addIssue(
        "tags",
        "invalid-type",
        "Expected an array of strings when provided.",
      );
    } else {
      tags.forEach((tag: unknown, index: number) => {
        if (typeof tag !== "string") {
          issues.push({
            path: `${path}.tags[${index}]`,
            code: "invalid-type",
            message: "Expected a string tag.",
          });
        }
      });
    }
  }
  for (const field of definition.optionalStrings ?? []) {
    if (entity[field] !== undefined && typeof entity[field] !== "string") {
      addIssue(field, "invalid-type", "Expected a string when provided.");
    }
  }
  for (const field of definition.optionalNonEmptyStrings ?? []) {
    if (entity[field] !== undefined && !nonEmptyString(entity[field])) {
      addIssue(
        field,
        "invalid-non-empty-string",
        "Expected a non-empty string when provided.",
      );
    }
  }
  for (const field of definition.optionalNumbers ?? []) {
    const value = entity[field];
    if (
      value !== undefined &&
      (typeof value !== "number" || !Number.isFinite(value))
    ) {
      addIssue(
        field,
        "invalid-type",
        "Expected a finite number when provided.",
      );
    }
  }
  for (const field of Object.keys(definition.scalarRefs ?? {})) {
    const value = entity[field];
    if (value !== undefined && !nonEmptyString(value)) {
      addIssue(
        field,
        "invalid-reference",
        "Expected a non-empty string ID when provided.",
      );
    }
  }
  for (const field of Object.keys(definition.arrayRefs ?? {})) {
    const values = entity[field];
    if (values === undefined) continue;
    if (!Array.isArray(values)) {
      addIssue(
        field,
        "invalid-type",
        "Expected an array of string IDs when provided.",
      );
      continue;
    }
    values.forEach((value: unknown, index: number) => {
      if (!nonEmptyString(value)) {
        issues.push({
          path: `${path}.${field}[${index}]`,
          code: "invalid-reference",
          message: "Expected a non-empty string ID.",
        });
      }
    });
  }
}

function validateHistoricalEventTime(
  entity: UnknownRecord,
  path: string,
  issues: ValidationIssue[],
): void {
  const year = entity["year"];
  const occurredAt = entity["occurredAt"];
  const hasYear = typeof year === "number" && Number.isFinite(year);
  const hasOccurredAt = nonEmptyString(occurredAt);
  if (!hasYear && !hasOccurredAt) {
    issues.push({
      path: `${path}.occurredAt`,
      code: "missing-event-time",
      message: "Expected either a finite year or a non-empty occurredAt value.",
    });
  }
  if (occurredAt !== undefined && !hasOccurredAt) {
    issues.push({
      path: `${path}.occurredAt`,
      code: "invalid-type",
      message: "Expected a non-empty string when occurredAt is provided.",
    });
  }
}

function toMap<T extends { id: string }>(
  entities: readonly T[],
): Map<string, T> {
  return new Map(entities.map((entity) => [entity.id, entity]));
}

function appendToMap<T>(map: Map<string, T[]>, key: string, value: T): void {
  const values = map.get(key);
  if (values) values.push(value);
  else map.set(key, [value]);
}

/** Build typed lookup maps for a validated world exchange. */
export function buildWorldExchangeIndex(
  exchange: WorldExchange,
): WorldExchangeIndex {
  const people = toMap(exchange.people);
  const cities = toMap(exchange.cities);
  const locations = toMap(exchange.locations);
  const organizations = toMap(exchange.organizations);
  const institutions = toMap(exchange.institutions);
  const factions = toMap(exchange.factions);
  const items = toMap(exchange.items);
  const historicalEvents = toMap(exchange.historicalEvents);
  const relationships = toMap(exchange.relationships);
  const byId = new Map<string, WorldEntity>([
    [exchange.world.id, exchange.world],
  ]);
  for (const map of [
    people,
    cities,
    locations,
    organizations,
    institutions,
    factions,
    items,
    historicalEvents,
    relationships,
  ]) {
    for (const [id, entity] of map) byId.set(id, entity);
  }

  const peopleByCityId = new Map<string, Person[]>();
  for (const person of exchange.people) {
    if (person.residenceId)
      appendToMap(peopleByCityId, person.residenceId, person);
  }
  const relationshipsByEntityId = new Map<string, Relationship[]>();
  for (const relationship of exchange.relationships) {
    appendToMap(relationshipsByEntityId, relationship.sourceId, relationship);
    if (relationship.targetId !== relationship.sourceId) {
      appendToMap(relationshipsByEntityId, relationship.targetId, relationship);
    }
  }

  return {
    world: exchange.world,
    byId,
    people,
    cities,
    locations,
    organizations,
    institutions,
    factions,
    items,
    historicalEvents,
    relationships,
    peopleByCityId,
    relationshipsByEntityId,
  };
}

/** Resolve any entity, including world metadata, by its stable ID. */
export function getWorldEntityById(
  index: WorldExchangeIndex,
  id: string,
): WorldEntity | undefined {
  return index.byId.get(id);
}
