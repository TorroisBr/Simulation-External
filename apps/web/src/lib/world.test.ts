import { describe, expect, it } from "vitest";
import { worldFixture } from "@simulation-external/world-fixtures";
import type { WorldExchange } from "@simulation-external/world-schema";
import {
  collectionEntries,
  entityId,
  eventYear,
  relatedEntities,
  searchEntities,
  sortEvents,
  worldName,
} from "./world";

const world: WorldExchange = worldFixture;

describe("World Explorer data helpers", () => {
  it("reads metadata and collection rows from the shared World Exchange fixture", () => {
    expect(worldName(world)).toBe("The Lyran Reach");
    expect(
      collectionEntries(world, "cities").map(({ entity }) => entityId(entity)),
    ).toContain("city-aurora");
  });

  it("searches across entity collections by name and ID without case sensitivity", () => {
    expect(
      searchEntities(world, "stormglass").map(({ entity }) => entityId(entity)),
    ).toContain("item-stormglass-sextant");
    expect(
      searchEntities(world, "PERSON-LYRA").map(({ entity }) =>
        entityId(entity),
      ),
    ).toContain("person-lyra");
    expect(searchEntities(world, "no such entry")).toEqual([]);
  });

  it("resolves connected IDs into navigable entries", () => {
    const city = collectionEntries(world, "cities").find(
      ({ entity }) => entityId(entity) === "city-aurora",
    );
    expect(city).toBeDefined();
    const relatedIds = relatedEntities(world, city!).map(({ entity }) =>
      entityId(entity),
    );
    expect(relatedIds).toContain("place-aurora");
    expect(relatedIds).toContain("person-lyra");
    expect(relatedIds).toContain("org-navigators");
  });

  it("does not treat free-text relationship descriptions as endpoints", () => {
    const worldWithMisleadingDescription = structuredClone(world);
    const unrelatedRelationship =
      worldWithMisleadingDescription.relationships.find(
        ({ id }) => id === "rel-dara-feo",
      );
    if (!unrelatedRelationship)
      throw new Error("Expected fixture relationship rel-dara-feo");
    unrelatedRelationship.description = "person-lyra";

    const lyra = collectionEntries(
      worldWithMisleadingDescription,
      "people",
    ).find(({ entity }) => entityId(entity) === "person-lyra");
    expect(lyra).toBeDefined();
    const relatedIds = relatedEntities(
      worldWithMisleadingDescription,
      lyra!,
    ).map(({ entity }) => entityId(entity));
    expect(relatedIds).not.toContain("rel-dara-feo");
    expect(relatedIds).not.toContain("person-dara");
    expect(relatedIds).not.toContain("person-feo");
  });

  it("orders historical events by year and extracts the fixture event year", () => {
    const events = collectionEntries(world, "historicalEvents");
    const ordered = sortEvents(events);
    expect(ordered.map(({ entity }) => eventYear(entity))).toEqual([
      612, 619, 625,
    ]);
  });
});
