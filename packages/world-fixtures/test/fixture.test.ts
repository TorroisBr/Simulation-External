import { describe, expect, it } from "vitest";
import {
  buildWorldExchangeIndex,
  getWorldExchangeCollectionCoverage,
  validateWorldExchange,
} from "@simulation-external/world-schema";
import {
  collectionCoverageFixture,
  legacyWorldFixture,
  worldFixture,
  validatedWorldFixture,
} from "../src/index.js";

describe("world fixture", () => {
  it("exports the same fixture after schema validation", () => {
    expect(worldFixture).toBe(validatedWorldFixture);
    expect(validateWorldExchange(worldFixture).valid).toBe(true);
    expect(validateWorldExchange(legacyWorldFixture).valid).toBe(true);
    expect(
      getWorldExchangeCollectionCoverage(legacyWorldFixture, "people"),
    ).toBe("LEGACY_UNKNOWN");
  });

  it("includes a connected world with three cities and at least ten people", () => {
    expect(worldFixture.schemaVersion).toBe(2);
    expect(worldFixture.collectionCoverage).toEqual({
      people: "INCLUDED",
      cities: "INCLUDED",
      locations: "INCLUDED",
      organizations: "INCLUDED",
      institutions: "INCLUDED",
      factions: "INCLUDED",
      items: "INCLUDED",
      historicalEvents: "INCLUDED",
      relationships: "INCLUDED",
    });
    expect(worldFixture.cities).toHaveLength(3);
    expect(worldFixture.people.length).toBeGreaterThanOrEqual(10);
    expect(worldFixture.organizations.length).toBeGreaterThanOrEqual(3);
    expect(worldFixture.institutions.length).toBeGreaterThanOrEqual(3);
    expect(worldFixture.historicalEvents.length).toBeGreaterThanOrEqual(2);
    expect(
      worldFixture.historicalEvents.every(
        (event) =>
          Number.isFinite(event.year) || Boolean(event.occurredAt?.trim()),
      ),
    ).toBe(true);

    const index = buildWorldExchangeIndex(worldFixture);
    expect(index.people.get("person-lyra")?.residenceId).toBe("city-aurora");
    expect(index.organizations.get("org-navigators")?.memberIds).toHaveLength(
      3,
    );
    const charterRelationship = worldFixture.relationships.find(
      ({ id }) => id === "rel-navigators-aurora",
    );
    expect(charterRelationship?.sourceId).toBe("org-navigators");
    expect(charterRelationship?.targetId).toBe("city-aurora");
    expect(index.relationshipsByEntityId.get("city-aurora")).toContain(
      charterRelationship,
    );
    expect(
      index.relationshipsByEntityId.get("person-sora")?.length,
    ).toBeGreaterThan(0);
    expect(index.historicalEvents.get("event-north-chart")?.title).toBe(
      "The North Passage Charting",
    );
  });

  it("shows distinct meanings for known-empty, unsupported, and omitted arrays", () => {
    expect(validateWorldExchange(collectionCoverageFixture).valid).toBe(true);
    expect(collectionCoverageFixture.people).toHaveLength(1);
    expect(collectionCoverageFixture.collectionCoverage.cities).toBe(
      "KNOWN_EMPTY",
    );
    expect(collectionCoverageFixture.collectionCoverage.locations).toBe(
      "UNSUPPORTED",
    );
    expect(collectionCoverageFixture.collectionCoverage.organizations).toBe(
      "NOT_INCLUDED",
    );
    expect(collectionCoverageFixture.cities).toEqual([]);
    expect(collectionCoverageFixture.locations).toEqual([]);
    expect(collectionCoverageFixture.organizations).toEqual([]);
  });
});
