import {
  getWorldExchangeCollectionCoverage,
  type EffectiveCollectionCoverage,
  type WorldEntity,
  type WorldExchange,
} from "@simulation-external/world-schema";

export const COLLECTIONS = [
  {
    key: "people",
    label: "People",
    singular: "Person",
    icon: "person",
    color: "blue",
  },
  {
    key: "cities",
    label: "Cities",
    singular: "City",
    icon: "city",
    color: "orange",
  },
  {
    key: "locations",
    label: "Locations",
    singular: "Location",
    icon: "location",
    color: "green",
  },
  {
    key: "organizations",
    label: "Organizations",
    singular: "Organization",
    icon: "organization",
    color: "violet",
  },
  {
    key: "institutions",
    label: "Institutions",
    singular: "Institution",
    icon: "institution",
    color: "yellow",
  },
  {
    key: "factions",
    label: "Factions",
    singular: "Faction",
    icon: "faction",
    color: "red",
  },
  {
    key: "items",
    label: "Items",
    singular: "Item",
    icon: "item",
    color: "teal",
  },
  {
    key: "historicalEvents",
    label: "History",
    singular: "Event",
    icon: "history",
    color: "pink",
  },
  {
    key: "relationships",
    label: "Relationships",
    singular: "Relationship",
    icon: "relationship",
    color: "slate",
  },
] as const;

export type CollectionKey = (typeof COLLECTIONS)[number]["key"];

export type EntityEntry = {
  collection: CollectionKey;
  entity: WorldEntity;
};

export function readField(entity: WorldEntity | object, key: string): unknown {
  return Reflect.get(entity, key);
}

export function asText(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

export function entityId(entity: WorldEntity): string {
  return asText(readField(entity, "id")) ?? "";
}

export function entityName(entity: WorldEntity): string {
  return (
    asText(readField(entity, "name")) ??
    asText(readField(entity, "title")) ??
    (entityId(entity) || "Unnamed entity")
  );
}

export function worldName(world: WorldExchange): string {
  const metadata = readField(world, "world");
  return metadata && typeof metadata === "object"
    ? (asText(readField(metadata, "name")) ?? "Untitled world")
    : "Untitled world";
}

export function worldDescription(world: WorldExchange): string {
  const metadata = readField(world, "world");
  return metadata && typeof metadata === "object"
    ? (asText(readField(metadata, "description")) ??
        "A connected world of people, places, and events.")
    : "A connected world of people, places, and events.";
}

export function collectionEntries(
  world: WorldExchange,
  collection: CollectionKey,
): EntityEntry[] {
  const value = readField(world, collection);
  if (!Array.isArray(value)) return [];
  return (value as WorldEntity[]).map((entity) => ({ collection, entity }));
}

export function collectionCoverage(
  world: WorldExchange,
  collection: CollectionKey,
): EffectiveCollectionCoverage {
  return getWorldExchangeCollectionCoverage(world, collection);
}

/** Counts supplied rows without presenting an undeclared zero as factual. */
export function collectionCountLabel(
  world: WorldExchange,
  collection: CollectionKey,
): string {
  const count = collectionEntries(world, collection).length;
  const coverage = collectionCoverage(world, collection);
  if (count > 0) return coverage === "INCLUDED" ? String(count) : `${count}+`;
  return coverage === "KNOWN_EMPTY" ? "0" : "—";
}

export function collectionCoverageDescription(
  coverage: EffectiveCollectionCoverage,
): string {
  switch (coverage) {
    case "INCLUDED":
      return "The complete collection is included in this artifact.";
    case "KNOWN_EMPTY":
      return "The producer confirms that this collection is empty in this World.";
    case "UNSUPPORTED":
      return "This producer cannot provide the collection; the World may still contain entries.";
    case "NOT_INCLUDED":
      return "This artifact deliberately omits the collection; the World may still contain entries.";
    case "LEGACY_UNKNOWN":
      return "This v1 artifact does not declare collection coverage.";
  }
}

export function collectionEmptyMessage(
  world: WorldExchange,
  collection: CollectionKey,
): string {
  switch (collectionCoverage(world, collection)) {
    case "INCLUDED":
      return "The artifact marks this collection as included but supplies no rows.";
    case "KNOWN_EMPTY":
      return "The producer confirms that this collection is empty in this World.";
    case "UNSUPPORTED":
      return "This producer cannot provide the collection; its absence does not mean the World has none.";
    case "NOT_INCLUDED":
      return "This artifact deliberately omits the collection; its absence does not mean the World has none.";
    case "LEGACY_UNKNOWN":
      return "This v1 artifact does not declare collection coverage, so an empty list does not confirm that the World has none.";
  }
}

export function allEntities(world: WorldExchange): EntityEntry[] {
  return COLLECTIONS.flatMap(({ key }) => collectionEntries(world, key));
}

export function collectionMeta(key: CollectionKey) {
  return COLLECTIONS.find((collection) => collection.key === key)!;
}

export function entityDescription(entity: WorldEntity): string | undefined {
  return (
    asText(readField(entity, "description")) ??
    asText(readField(entity, "biography"))
  );
}

export function getWorldIndex(
  world: WorldExchange,
): Map<string, EntityEntry[]> {
  const index = new Map<string, EntityEntry[]>();
  for (const entry of allEntities(world)) {
    const id = entityId(entry.entity);
    if (!id) continue;
    const current = index.get(id) ?? [];
    current.push(entry);
    index.set(id, current);
  }
  return index;
}

export function searchEntities(
  world: WorldExchange,
  query: string,
): EntityEntry[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  return allEntities(world).filter(({ entity, collection }) => {
    const values = [
      entityName(entity),
      entityId(entity),
      entityDescription(entity),
      collectionMeta(collection).singular,
      JSON.stringify(entity),
    ];
    return values.some((value) => value?.toLocaleLowerCase().includes(needle));
  });
}

export function humanizeField(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/Id(s)?$/i, " id$1")
    .replace(/^./, (character) => character.toLocaleUpperCase());
}

export function formatValue(value: unknown): string {
  if (value === null) return "None";
  if (value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value))
    return value.length ? value.map(formatValue).join(", ") : "—";
  if (typeof value === "object")
    return Object.entries(value)
      .map(([key, item]) => `${humanizeField(key)}: ${formatValue(item)}`)
      .join(" · ");
  return String(value);
}

export function entityFields(entity: WorldEntity): Array<[string, unknown]> {
  return Object.entries(entity).filter(
    ([key, value]) =>
      key !== "id" &&
      key !== "name" &&
      key !== "title" &&
      value !== undefined &&
      value !== null &&
      value !== "",
  );
}

function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object")
    return Object.values(value).flatMap(stringsIn);
  return [];
}

export type RelatedEntity = EntityEntry & { relationLabel: string };

export function relatedEntities(
  world: WorldExchange,
  entry: EntityEntry,
): RelatedEntity[] {
  const index = getWorldIndex(world);
  const currentId = entityId(entry.entity);
  const seen = new Set<string>();
  const related: RelatedEntity[] = [];

  const addById = (id: string, relationLabel: string) => {
    if (!id || id === currentId) return;
    for (const target of index.get(id) ?? []) {
      const key = `${target.collection}:${entityId(target.entity)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      related.push({ ...target, relationLabel });
    }
  };

  for (const [key, value] of Object.entries(entry.entity)) {
    if (key === "id" || key === "name") continue;
    const isReferenceField =
      /(?:Id|Ids)$/i.test(key) || /^(from|to|source|target)/i.test(key);
    if (!isReferenceField) continue;
    for (const id of stringsIn(value)) addById(id, humanizeField(key));
  }

  // Relationship rows are also the source of navigable links for the people they connect.
  if (entry.collection !== "relationships") {
    for (const relation of collectionEntries(world, "relationships")) {
      const sourceId = asText(readField(relation.entity, "sourceId"));
      const targetId = asText(readField(relation.entity, "targetId"));
      if (sourceId !== currentId && targetId !== currentId) continue;
      const kind =
        asText(readField(relation.entity, "label")) ??
        asText(readField(relation.entity, "type")) ??
        "Relationship";
      addById(entityId(relation.entity), kind);
      if (sourceId !== currentId && sourceId) addById(sourceId, kind);
      if (targetId !== currentId && targetId) addById(targetId, kind);
    }
  }

  return related;
}

export function eventYear(entity: WorldEntity): number | undefined {
  const year = readField(entity, "year");
  if (typeof year === "number" && Number.isFinite(year)) return year;
  const date =
    asText(readField(entity, "occurredAt")) ??
    asText(readField(entity, "date"));
  if (!date) return undefined;
  const parsed = Date.parse(date);
  if (Number.isFinite(parsed)) return new Date(parsed).getUTCFullYear();
  const match = date.match(/-?\d{1,4}/);
  return match ? Number(match[0]) : undefined;
}

export function sortEvents(entries: EntityEntry[]): EntityEntry[] {
  return [...entries].sort((left, right) => {
    const leftYear = eventYear(left.entity);
    const rightYear = eventYear(right.entity);
    if (leftYear === undefined && rightYear === undefined)
      return entityName(left.entity).localeCompare(entityName(right.entity));
    if (leftYear === undefined) return 1;
    if (rightYear === undefined) return -1;
    return leftYear - rightYear;
  });
}
