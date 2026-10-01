import { describe, expect, it } from "vitest";
import { projectWorldExchange, toWorldExchangeId } from "../src/index.js";
import {
  createCanonicalCapabilityMock,
  createConsumerCompatibilityMock,
} from "./fixtures/mock-source.js";

describe("read-only World Exchange projection prototype", () => {
  it("does not fabricate a World identity or unsupported domain fields", () => {
    const result = projectWorldExchange(createCanonicalCapabilityMock());

    expect(result.exchange).toBeNull();
    expect(result.omissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ concept: "World", field: "id" }),
        expect.objectContaining({ concept: "Person", field: "residenceId" }),
        expect.objectContaining({ concept: "Person", field: "locationId" }),
        expect.objectContaining({ concept: "City", field: "id" }),
        expect.objectContaining({ concept: "Location", field: "kind" }),
        expect.objectContaining({ concept: "Institution", field: "type" }),
        expect.objectContaining({
          concept: "Item",
          code: "item-instance-semantics-unresolved",
        }),
        expect.objectContaining({
          concept: "HistoricalEvent",
          code: "historical-event-contract-unavailable",
        }),
        expect.objectContaining({
          concept: "Organization",
          code: "generic-organization-deferred",
        }),
        expect.objectContaining({
          concept: "Relationship",
          code: "generic-relationship-contract-unavailable",
        }),
      ]),
    );
    expect(
      result.omissions.find(
        ({ concept, code }) =>
          concept === "City" && code === "stable-identity-unavailable",
      )?.message,
    ).toContain(
      "authored City definition is not a stable City instance identity",
    );
  });

  it("projects stable identities when optional display labels are absent", () => {
    const result = projectWorldExchange(
      createConsumerCompatibilityMock({
        includeDisplayNames: false,
        includeWorldName: false,
      }),
    );
    const exchange = result.exchange;
    if (!exchange)
      throw new Error("Expected the fixture World ID to form an exchange");

    expect(exchange.world).toEqual({
      id: toWorldExchangeId("World", "fixture-world:projection-consumer-check"),
    });
    expect(exchange.people.map(({ id, name }) => [id, name])).toEqual([
      [toWorldExchangeId("Person", "fixture-person:lyra"), undefined],
      [toWorldExchangeId("Person", "fixture-person:tomas"), undefined],
    ]);
    expect(exchange.cities[0]?.name).toBeUndefined();
    expect(exchange.locations[0]?.name).toBeUndefined();
    expect(exchange.factions[0]?.name).toBeUndefined();
    expect(exchange.factions[0]?.memberIds).toHaveLength(2);
    expect(result.omissions).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "name" })]),
    );
  });

  it("uses stable type-scoped IDs independent of names and source row order", () => {
    const first = projectWorldExchange(createConsumerCompatibilityMock());
    const reordered = projectWorldExchange(
      createConsumerCompatibilityMock({ reverseRows: true }),
    );
    const renamed = projectWorldExchange(
      createConsumerCompatibilityMock({
        personName: "Lyra with a new display name",
      }),
    );

    expect(first.exchange).not.toBeNull();
    expect(reordered.exchange).toEqual(first.exchange);
    expect(renamed.exchange?.people[0]?.id).toBe(first.exchange?.people[0]?.id);
    expect(toWorldExchangeId("Person", "fixture-person:lyra")).toBe(
      first.exchange?.people[0]?.id,
    );
    expect(toWorldExchangeId("Person", "same-key")).not.toBe(
      toWorldExchangeId("Faction", "same-key"),
    );
  });

  it("omits duplicate source identities instead of selecting an arbitrary row", () => {
    const source = createConsumerCompatibilityMock();
    const person = source.readPeople()[0]!;
    const duplicate = {
      ...source,
      readPeople: () => [
        person,
        ...source.readPeople().slice(1),
        { ...person, publicName: "Conflicting name" },
      ],
    };
    const result = projectWorldExchange(duplicate);

    expect(result.exchange?.people.map(({ id }) => id)).toEqual([
      toWorldExchangeId("Person", "fixture-person:tomas"),
    ]);
    expect(result.omissions).toContainEqual(
      expect.objectContaining({
        concept: "Person",
        code: "duplicate-source-identity",
        sourceId: "fixture-person:lyra",
      }),
    );
  });

  it("keeps active faction affiliation directed and omits generic organizations", () => {
    const result = projectWorldExchange(createConsumerCompatibilityMock());
    const exchange = result.exchange;
    if (!exchange)
      throw new Error(
        "Expected the explicit fixture source to include World identity",
      );

    const person = exchange.people[0]!;
    const faction = exchange.factions[0]!;
    expect(person.factionIds).toEqual([faction.id]);
    expect(faction.memberIds).toEqual(
      exchange.people.map(({ id }) => id).sort(),
    );
    expect(exchange.relationships).toEqual([]);
    expect(exchange.organizations).toEqual([]);
  });

  it("does not expose actor Knowledge or aggregate inventory quantities", () => {
    const source = createConsumerCompatibilityMock();
    const result = projectWorldExchange(source);

    expect(result.exchange).not.toBeNull();
    const serialized = JSON.stringify(result.exchange);
    expect(serialized).not.toContain("actorKnowledgeByPerson");
    expect(serialized).not.toContain("believedFaction");
    expect(serialized).not.toContain("inventoryQuantities");
    expect(serialized).not.toContain("fixture-item-definition:chart");
    expect(result.exchange?.items).toEqual([]);
    expect(result.omissions).toContainEqual(
      expect.objectContaining({
        concept: "Item",
        code: "item-instance-semantics-unresolved",
      }),
    );
    expect(source.inventoryQuantities[0]?.quantity).toBe(14);
  });

  it("keeps item definitions and current state separate from instances and history", () => {
    const result = projectWorldExchange(createCanonicalCapabilityMock());

    expect(result.omissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          concept: "Item",
          code: "item-instance-semantics-unresolved",
        }),
        expect.objectContaining({
          concept: "HistoricalEvent",
          code: "historical-event-contract-unavailable",
        }),
      ]),
    );
  });
});
