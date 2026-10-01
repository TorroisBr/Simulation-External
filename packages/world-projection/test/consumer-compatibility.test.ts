import { describe, expect, it } from "vitest";
import { worldFixture } from "@simulation-external/world-fixtures";
import { renderWorldMarkdownNotes } from "@simulation-external/world-markdown";
import {
  parseWorldExchange,
  serializeWorldExchange,
} from "@simulation-external/world-io";
import {
  collectionEntries,
  entityName,
  worldName,
} from "../../../apps/web/src/lib/world.js";
import { projectWorldExchange } from "../src/index.js";
import { createConsumerCompatibilityMock } from "./fixtures/mock-source.js";

describe("World Exchange consumer compatibility", () => {
  it("passes through the same Web data helpers used with fixtures", () => {
    const result = projectWorldExchange(createConsumerCompatibilityMock());
    if (!result.exchange)
      throw new Error("Expected a complete fixture-backed exchange");

    expect(worldName(result.exchange)).toBe(
      "Projection Consumer Check Fixture",
    );
    expect(worldName(worldFixture)).toBe("The Lyran Reach");
    expect(collectionEntries(result.exchange, "people")).toHaveLength(2);
    expect(collectionEntries(result.exchange, "cities")[0]?.entity.id).toBe(
      "simulation-external:projection-v1:city:fixture-city%3Aaurora",
    );
  });

  it("passes the projected value directly to the shared Markdown renderer", () => {
    const result = projectWorldExchange(createConsumerCompatibilityMock());
    if (!result.exchange)
      throw new Error("Expected a complete fixture-backed exchange");

    const projectedNotes = renderWorldMarkdownNotes(result.exchange);
    const fixtureNotes = renderWorldMarkdownNotes(worldFixture);
    const personNote = projectedNotes.find(({ type }) => type === "person");

    expect(projectedNotes.length).toBeGreaterThan(1);
    expect(fixtureNotes.length).toBeGreaterThan(1);
    expect(personNote?.content).toContain(
      'simulation_world_id: "simulation-external:projection-v1:world:fixture-world%3Aprojection-consumer-check"',
    );
    expect(personNote?.content).toContain("### Related notes");
    expect(personNote?.content).not.toContain("actorKnowledgeByPerson");
  });

  it("passes projection output through portable I/O and back to the same consumers", () => {
    const result = projectWorldExchange(createConsumerCompatibilityMock());
    if (!result.exchange)
      throw new Error("Expected a complete fixture-backed exchange");

    const loaded = parseWorldExchange(serializeWorldExchange(result.exchange));
    expect(loaded).toEqual(result.exchange);
    expect(renderWorldMarkdownNotes(loaded)).toEqual(
      renderWorldMarkdownNotes(result.exchange),
    );
    expect(collectionEntries(loaded, "people")).toEqual(
      collectionEntries(result.exchange, "people"),
    );
  });

  it("renders stable identities when optional World Exchange labels are absent", () => {
    const result = projectWorldExchange(
      createConsumerCompatibilityMock({
        includeDisplayNames: false,
        includeWorldName: false,
      }),
    );
    if (!result.exchange)
      throw new Error("Expected a World ID to form the fixture exchange");

    const person = collectionEntries(result.exchange, "people")[0]?.entity;
    if (!person) throw new Error("Expected a projected Person");
    expect(worldName(result.exchange)).toBe("Untitled world");
    expect(entityName(person)).toBe(person.id);

    const notes = renderWorldMarkdownNotes(result.exchange);
    const personNote = notes.find(({ type }) => type === "person");
    const worldNote = notes.find(({ type }) => type === "world");
    expect(personNote?.path).toContain("People/id-");
    expect(personNote?.content).toContain("Untitled person");
    expect(worldNote?.content).toContain("Untitled world");
  });
});
