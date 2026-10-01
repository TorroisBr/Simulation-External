import { describe, expect, it } from "vitest";
import { worldFixture } from "@simulation-external/world-fixtures";
import { renderWorldMarkdownNotes } from "@simulation-external/world-markdown";
import {
  parseWorldExchange,
  serializeWorldExchange,
  validateWorldExchange,
  WorldExchangeParseError,
  WorldExchangeValidationError,
} from "../src/index.js";

describe("portable World Exchange I/O", () => {
  it("parses UTF-8 bytes and strings as the existing fixture exchange", () => {
    const json = serializeWorldExchange(worldFixture);
    expect(parseWorldExchange(json)).toEqual(worldFixture);
    expect(parseWorldExchange(new TextEncoder().encode(json))).toEqual(
      worldFixture,
    );
  });

  it("rejects invalid JSON and malformed UTF-8 with clear parse errors", () => {
    expect(() => parseWorldExchange("{broken")).toThrow(
      WorldExchangeParseError,
    );
    expect(() => parseWorldExchange("{broken")).toThrow(
      /Invalid World Exchange JSON/,
    );
    expect(() => parseWorldExchange(new Uint8Array([0xc3, 0x28]))).toThrow(
      /not valid UTF-8/,
    );
  });

  it("delegates unsupported schema versions and missing World IDs to schema validation", () => {
    const unsupported = { ...structuredClone(worldFixture), schemaVersion: 2 };
    expect(() => parseWorldExchange(JSON.stringify(unsupported))).toThrow(
      /unsupported-schema-version/,
    );

    const missingWorldId = structuredClone(worldFixture);
    delete (missingWorldId.world as Partial<typeof missingWorldId.world>).id;
    expect(() => parseWorldExchange(JSON.stringify(missingWorldId))).toThrow(
      /\$\.world\.id/,
    );
  });

  it("rejects blank optional labels, duplicate IDs, and broken references", () => {
    const blankLabel = structuredClone(worldFixture);
    blankLabel.world.name = "  ";
    expect(() => parseWorldExchange(JSON.stringify(blankLabel))).toThrow(
      /invalid-non-empty-string/,
    );
    const blankEntityLabel = structuredClone(worldFixture);
    blankEntityLabel.people[0]!.name = "  ";
    expect(() => parseWorldExchange(JSON.stringify(blankEntityLabel))).toThrow(
      /invalid-non-empty-string/,
    );

    const duplicate = structuredClone(worldFixture);
    duplicate.cities.push({ id: duplicate.people[0]!.id });
    expect(() => parseWorldExchange(JSON.stringify(duplicate))).toThrow(
      /duplicate-id/,
    );

    const dangling = structuredClone(worldFixture);
    dangling.people[0]!.residenceId = "missing-city";
    expect(() => parseWorldExchange(JSON.stringify(dangling))).toThrow(
      /dangling-reference/,
    );
  });

  it("keeps optional names absent and stable IDs unchanged", () => {
    const unlabeled = structuredClone(worldFixture);
    delete unlabeled.world.name;
    delete unlabeled.people[0]!.name;
    const parsed = parseWorldExchange(serializeWorldExchange(unlabeled));

    expect(parsed.world.name).toBeUndefined();
    expect(parsed.people[0]!.name).toBeUndefined();
    expect(parsed.world.id).toBe(worldFixture.world.id);
    expect(parsed.people[0]!.id).toBe(worldFixture.people[0]!.id);
  });

  it("sorts object keys deterministically without reordering arrays", () => {
    const exchange = structuredClone(worldFixture);
    const reversedEntries = Object.entries(exchange).reverse();
    const reordered = Object.fromEntries(reversedEntries);
    const first = serializeWorldExchange(exchange);
    const second = serializeWorldExchange(reordered);
    expect(first).toBe(second);

    const reorderedPeople = structuredClone(worldFixture);
    reorderedPeople.people.reverse();
    expect(serializeWorldExchange(reorderedPeople)).not.toBe(first);
  });

  it("round-trips the fixture and sends the same exchange to Markdown rendering", () => {
    const json = serializeWorldExchange(worldFixture);
    const loaded = parseWorldExchange(json);
    expect(loaded).toEqual(worldFixture);
    expect(renderWorldMarkdownNotes(loaded)).toEqual(
      renderWorldMarkdownNotes(worldFixture),
    );
    expect(validateWorldExchange(loaded).valid).toBe(true);
  });

  it("throws a typed validation error when asked to serialize an invalid value", () => {
    const invalid = { ...worldFixture, world: { name: "No ID" } };
    expect(() => serializeWorldExchange(invalid)).toThrow(
      WorldExchangeValidationError,
    );
  });
});
