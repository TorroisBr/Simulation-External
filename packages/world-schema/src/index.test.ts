import { describe, expect, it } from "vitest";
import {
  buildWorldExchangeIndex,
  getWorldEntityById,
  validateWorldExchange,
  type WorldExchange,
} from "./index.js";

const emptyExchange = (): WorldExchange => ({
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

  it("reports schema, duplicate ID, and dangling reference errors", () => {
    const exchange = emptyExchange();
    (exchange as unknown as { schemaVersion: number }).schemaVersion = 2;
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
