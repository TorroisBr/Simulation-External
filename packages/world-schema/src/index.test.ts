import { describe, expect, it } from "vitest";
import {
  buildWorldExchangeIndex,
  getWorldExchangeCollectionCoverage,
  getWorldEntityById,
  validateWorldExchange,
  type WorldExchangeCollectionCoverage,
  type WorldExchangeV1,
  type WorldExchangeV2,
} from "./index.js";

const emptyExchange = (): WorldExchangeV1 => ({
  schemaVersion: 1,
  world: { id: "world-test", name: "Test World" },
  people: [],
  cities: [],
  locations: [],
  organizations: [],
  institutions: [],
  factions: [],
  items: [],
  historicalEvents: [],
  relationships: [],
});

const allKnownEmptyCoverage: WorldExchangeCollectionCoverage = {
  people: "KNOWN_EMPTY",
  cities: "KNOWN_EMPTY",
  locations: "KNOWN_EMPTY",
  organizations: "KNOWN_EMPTY",
  institutions: "KNOWN_EMPTY",
  factions: "KNOWN_EMPTY",
  items: "KNOWN_EMPTY",
  historicalEvents: "KNOWN_EMPTY",
  relationships: "KNOWN_EMPTY",
};

function asV2(
  exchange: WorldExchangeV1,
  collectionCoverage: WorldExchangeCollectionCoverage,
): WorldExchangeV2 {
  return { ...exchange, schemaVersion: 2, collectionCoverage };
}

describe("world exchange schema", () => {
  it("accepts a well-formed exchange", () => {
    const exchange = emptyExchange();
    exchange.cities.push({ id: "city-one", name: "One" });
    exchange.people.push({
      id: "person-one",
      name: "Ada",
      residenceId: "city-one",
    });

    const result = validateWorldExchange(exchange);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value).toBe(exchange);
  });

  it("accepts v2 coverage for all four states and exposes legacy v1 as unknown", () => {
    const v1 = emptyExchange();
    expect(getWorldExchangeCollectionCoverage(v1, "people")).toBe(
      "LEGACY_UNKNOWN",
    );

    const v2 = asV2(v1, {
      ...allKnownEmptyCoverage,
      people: "INCLUDED",
      cities: "UNSUPPORTED",
      locations: "NOT_INCLUDED",
    });
    v2.people.push({ id: "person-one" });

    const result = validateWorldExchange(v2);
    expect(result.valid).toBe(true);
    expect(getWorldExchangeCollectionCoverage(v2, "people")).toBe("INCLUDED");
    expect(getWorldExchangeCollectionCoverage(v2, "cities")).toBe(
      "UNSUPPORTED",
    );
    expect(getWorldExchangeCollectionCoverage(v2, "locations")).toBe(
      "NOT_INCLUDED",
    );
  });

  it("rejects missing, unknown, and contradictory v2 coverage declarations", () => {
    const missing = asV2(emptyExchange(), allKnownEmptyCoverage);
    delete (
      missing.collectionCoverage as Partial<WorldExchangeCollectionCoverage>
    ).people;
    const unknown = asV2(emptyExchange(), allKnownEmptyCoverage);
    (unknown.collectionCoverage as Record<string, unknown>)["planets"] =
      "UNSUPPORTED";
    const contradictory = asV2(emptyExchange(), {
      ...allKnownEmptyCoverage,
      people: "INCLUDED",
    });

    for (const exchange of [missing, unknown, contradictory]) {
      const result = validateWorldExchange(exchange);
      expect(result.valid).toBe(false);
      if (!result.valid)
        expect(
          result.issues.some((issue) =>
            issue.path.startsWith("$.collectionCoverage"),
          ),
        ).toBe(true);
    }
  });

  it("rejects v1 coverage metadata instead of changing legacy array meaning", () => {
    const exchange = {
      ...emptyExchange(),
      collectionCoverage: allKnownEmptyCoverage,
    };
    const result = validateWorldExchange(exchange);
    expect(result.valid).toBe(false);
    if (!result.valid)
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          path: "$.collectionCoverage",
          code: "unexpected-collection-coverage",
        }),
      );
  });

  it("accepts stable identities without optional display labels", () => {
    const exchange = emptyExchange();
    delete exchange.world.name;
    exchange.people.push({ id: "person-one" });
    exchange.cities.push({ id: "city-one" });
    exchange.locations.push({ id: "location-one", kind: "landmark" });
    exchange.organizations.push({ id: "organization-one", type: "guild" });
    exchange.institutions.push({ id: "institution-one", type: "archive" });
    exchange.factions.push({ id: "faction-one" });
    exchange.items.push({ id: "item-one", type: "document" });
    exchange.historicalEvents.push({
      id: "event-one",
      title: "A recorded event",
      year: 12,
    });
    exchange.relationships.push({
      id: "relationship-one",
      sourceId: "person-one",
      targetId: "faction-one",
      type: "member-of",
    });

    expect(validateWorldExchange(exchange).valid).toBe(true);
  });

  it("rejects blank display labels when a label is supplied", () => {
    const exchange = emptyExchange();
    exchange.world.name = "  ";
    exchange.people.push({ id: "person-one", name: "" });

    const result = validateWorldExchange(exchange);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "$.world.name",
            code: "invalid-non-empty-string",
          }),
          expect.objectContaining({
            path: "$.people[0].name",
            code: "invalid-non-empty-string",
          }),
        ]),
      );
    }
  });

  it("reports schema, duplicate ID, and dangling reference errors", () => {
    const exchange = emptyExchange();
    (exchange as unknown as { schemaVersion: number }).schemaVersion = 3;
    exchange.people.push({
      id: "same",
      name: "Ada",
      residenceId: "missing-city",
    });
    exchange.cities.push({ id: "same", name: "Duplicate" });

    const result = validateWorldExchange(exchange);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.map((issue) => issue.code)).toEqual(
        expect.arrayContaining([
          "unsupported-schema-version",
          "duplicate-id",
          "dangling-reference",
        ]),
      );
    }
  });

  it("indexes entities and people by their residence city", () => {
    const exchange = emptyExchange();
    exchange.cities.push({ id: "city-one", name: "One" });
    exchange.people.push({
      id: "person-one",
      name: "Ada",
      residenceId: "city-one",
    });
    const result = validateWorldExchange(exchange);
    expect(result.valid).toBe(true);
    if (!result.valid) return;

    const index = buildWorldExchangeIndex(result.value);
    expect(index.people.get("person-one")?.name).toBe("Ada");
    expect(getWorldEntityById(index, "person-one")?.id).toBe("person-one");
    expect(
      index.peopleByCityId.get("city-one")?.map((person) => person.id),
    ).toEqual(["person-one"]);
  });

  it("allows relationship edges between any supported entity types", () => {
    const exchange = emptyExchange();
    exchange.cities.push({ id: "city-one", name: "One" });
    exchange.locations.push({
      id: "place-one",
      name: "Square",
      kind: "landmark",
      cityId: "city-one",
    });
    exchange.relationships.push({
      id: "edge-one",
      sourceId: "city-one",
      targetId: "place-one",
      type: "contains",
    });
    exchange.world.metadata = {
      notes: "A small JSON metadata object",
      weight: 3,
    };

    const result = validateWorldExchange(exchange);
    expect(result.valid).toBe(true);
    if (result.valid) {
      const index = buildWorldExchangeIndex(result.value);
      expect(index.relationshipsByEntityId.get("city-one")).toEqual([
        exchange.relationships[0],
      ]);
      expect(index.relationshipsByEntityId.get("place-one")).toEqual([
        exchange.relationships[0],
      ]);
    }
  });

  it("rejects non-JSON runtime metadata values", () => {
    const exchange = emptyExchange();
    exchange.world.metadata = { value: Number.NaN };
    const result = validateWorldExchange(exchange);
    expect(result.valid).toBe(false);
    if (!result.valid)
      expect(
        result.issues.some((issue) => issue.path === "$.world.metadata"),
      ).toBe(true);
  });

  it("validates optional tags on shared entities", () => {
    const input = {
      ...emptyExchange(),
      people: [{ id: "person-one", name: "Ada", tags: ["scholar", 7] }],
    };
    const result = validateWorldExchange(input);
    expect(result.valid).toBe(false);
    if (!result.valid)
      expect(
        result.issues.some((issue) => issue.path === "$.people[0].tags[1]"),
      ).toBe(true);
  });

  it("requires historical events to have a year or occurredAt value", () => {
    const exchange = emptyExchange();
    exchange.historicalEvents.push({
      id: "event-untimed",
      title: "An Untimed Event",
    });

    const result = validateWorldExchange(exchange);
    expect(result.valid).toBe(false);
    if (!result.valid)
      expect(
        result.issues.some((issue) => issue.code === "missing-event-time"),
      ).toBe(true);
  });

  it("allows an item owner to be any supported entity", () => {
    const exchange = emptyExchange();
    exchange.cities.push({ id: "city-one", name: "One" });
    exchange.items.push({
      id: "item-one",
      name: "Charter",
      type: "document",
      ownerId: "city-one",
    });

    expect(validateWorldExchange(exchange).valid).toBe(true);
  });
});
