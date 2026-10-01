import { describe, expect, it } from "vitest";
import {
  buildWorldExchangeIndex,
  validateWorldExchange,
} from "@simulation-external/world-schema";
import { worldFixture, validatedWorldFixture } from "../src/index.js";

describe("world fixture", () => {
  it("exports the same fixture after schema validation", () => {
    expect(worldFixture).toBe(validatedWorldFixture);
    expect(validateWorldExchange(worldFixture).valid).toBe(true);
  });

  it("includes a connected world with three cities and at least ten people", () => {
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
    expect(
      index.relationshipsByEntityId.get("person-sora")?.length,
    ).toBeGreaterThan(0);
    expect(index.historicalEvents.get("event-north-chart")?.title).toBe(
      "The North Passage Charting",
    );
  });
});
