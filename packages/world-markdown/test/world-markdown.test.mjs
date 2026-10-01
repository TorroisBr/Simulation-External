import { describe, expect, it } from "vitest";
import {
  GENERATED_END,
  GENERATED_START,
  renderWorldMarkdownNotes,
  syncWorldMarkdown,
} from "../dist/index.js";

function exchange(people = undefined) {
  return {
    schemaVersion: 1,
    world: {
      id: "world-lyr",
      name: "Test World",
      description: "A test simulation.",
    },
    people: people ?? [
      { id: "person-lyra", name: "Lyra", residenceId: "city-1", age: 36 },
    ],
    cities: [{ id: "city-1", name: "London" }],
    locations: [],
    organizations: [],
    institutions: [],
    factions: [],
    items: [],
    historicalEvents: [],
    relationships: [],
  };
}

function memoryVault(seed = new Map()) {
  const writes = [];
  return {
    writes,
    adapter: {
      async read(path) {
        return seed.has(path) ? seed.get(path) : null;
      },
      async write(path, content) {
        writes.push(path);
        seed.set(path, content);
      },
    },
    files: seed,
  };
}

describe("world Markdown rendering", () => {
  it("creates wikilinks only from declared reference fields", () => {
    const notes = renderWorldMarkdownNotes(
      exchange([
        {
          id: "person-lyra",
          name: "Lyra",
          metadata: { valid: "city-1" },
        },
      ]),
    );
    const person = notes.find(({ type }) => type === "person");

    expect(person.content).not.toMatch(/\[\[Cities\//);
  });

  it("renders deterministic stable-ID paths, metadata, and ID-aware wikilinks", () => {
    const first = renderWorldMarkdownNotes(exchange());
    const second = renderWorldMarkdownNotes(
      exchange([
        { id: "person-lyra", age: 36, residenceId: "city-1", name: "Lyra" },
      ]),
    );
    const renamed = renderWorldMarkdownNotes(
      exchange([
        {
          id: "person-lyra",
          age: 36,
          residenceId: "city-1",
          name: "Lyra Example",
        },
      ]),
    );

    expect(first.map(({ path }) => path)).toEqual(
      second.map(({ path }) => path),
    );
    expect(first.map(({ path }) => path)).toEqual(
      renamed.map(({ path }) => path),
    );
    expect(
      first.some(
        ({ path }) => path === "People/id-70-65-72-73-6f-6e-2d-6c-79-72-61.md",
      ),
    ).toBe(true);

    const person = first.find(({ type }) => type === "person");
    const renamedPerson = renamed.find(({ type }) => type === "person");
    const world = first.find(({ type }) => type === "world");
    expect(person).toBeDefined();
    expect(renamedPerson).toBeDefined();
    expect(world).toBeDefined();
    expect(renamedPerson.path).toBe(person.path);
    expect(renamedPerson.content).toMatch(/simulation_id: "person-lyra"/);
    expect(person.content).toMatch(/simulation_id: "person-lyra"/);
    expect(person.content).toMatch(/simulation_world_id: "world-lyr"/);
    expect(person.content).toMatch(/simulation_type: "person"/);
    expect(person.content).toMatch(/schema_version: 1/);
    expect(world.content).toMatch(/simulation_id: "world-lyr"/);
    expect(world.content).toMatch(/simulation_world_id: "world-lyr"/);
    expect(person.content).toMatch(
      /\[\[Cities\/id-63-69-74-79-2d-31\|London\]\]/,
    );
  });

  it("sync updates owned metadata and generated block while retaining user content", async () => {
    const notePath = renderWorldMarkdownNotes(exchange()).find(
      ({ type }) => type === "person",
    ).path;
    const original = [
      "---",
      "tags: [personal]",
      'simulation_id: "person-lyra"',
      'simulation_world_id: "world-lyr"',
      "simulation_type: legacy",
      "type: legacy",
      "schema_version: 0",
      "custom_field: keep-me",
      "---",
      "# My introduction",
      "",
      "This introduction belongs to the vault owner.",
      "",
      GENERATED_START,
      "old generated text",
      GENERATED_END,
      "",
      "## GM Notes",
      "Keep this note exactly as written.",
      "",
    ].join("\n");
    const vault = memoryVault(new Map([[notePath, original]]));

    const result = await syncWorldMarkdown(exchange(), vault.adapter);
    const saved = vault.files.get(notePath);
    expect(result.updated).toEqual([notePath]);
    expect(saved).toMatch(/tags: \[personal\]/);
    expect(saved).toMatch(/custom_field: keep-me/);
    expect(saved).toMatch(/simulation_id: "person-lyra"/);
    expect(saved).toMatch(/simulation_world_id: "world-lyr"/);
    expect(saved).toMatch(/simulation_type: "person"/);
    expect(saved).toMatch(/schema_version: 1/);
    expect(saved).toMatch(/type: legacy/);
    expect(saved).toMatch(
      /# My introduction\n\nThis introduction belongs to the vault owner\./,
    );
    expect(saved).toMatch(/## GM Notes\nKeep this note exactly as written\./);
    expect(saved).toMatch(/### Canonical data/);

    const expectedPaths = renderWorldMarkdownNotes(exchange()).map(
      ({ path }) => path,
    );
    const second = await syncWorldMarkdown(exchange(), vault.adapter);
    expect(second.unchanged).toEqual(expectedPaths);
    expect(vault.writes).toEqual(expectedPaths);
  });

  it("refuses to overwrite notes if any existing generated markers are malformed", async () => {
    const notePath = renderWorldMarkdownNotes(exchange()).find(
      ({ type }) => type === "person",
    ).path;
    const original =
      '---\nsimulation_id: "person-lyra"\nsimulation_world_id: "world-lyr"\ncustom: keep\n---\n\n<!-- simulation-external:generated:start -->\nUnclosed';
    const vault = memoryVault(new Map([[notePath, original]]));

    await expect(syncWorldMarkdown(exchange(), vault.adapter)).rejects.toThrow(
      /malformed or duplicate/,
    );
    expect(vault.files.get(notePath)).toBe(original);
    expect(vault.writes).toEqual([]);
  });

  it.each([
    ["without frontmatter", "# User-authored note"],
    ["without a world ID", '---\nsimulation_id: "person-lyra"\n---\nMy note'],
    [
      "without an entity ID",
      '---\nsimulation_world_id: "world-lyr"\n---\nMy note',
    ],
  ])("refuses an existing note %s", async (_label, original) => {
    const notePath = renderWorldMarkdownNotes(exchange()).find(
      ({ type }) => type === "person",
    ).path;
    const vault = memoryVault(new Map([[notePath, original]]));

    await expect(syncWorldMarkdown(exchange(), vault.adapter)).rejects.toThrow(
      /conflict/,
    );
    expect(vault.files.get(notePath)).toBe(original);
    expect(vault.writes).toEqual([]);
  });

  it.each([
    ["entity ID", "simulation_id", "another-person"],
    ["world ID", "simulation_world_id", "another-world"],
  ])(
    "refuses an existing note with a conflicting %s",
    async (_label, key, value) => {
      const notePath = renderWorldMarkdownNotes(exchange()).find(
        ({ type }) => type === "person",
      ).path;
      const original = `---\nsimulation_id: person-lyra\nsimulation_world_id: world-lyr\n${key}: ${value}\n---\n\nMy notes`;
      const vault = memoryVault(new Map([[notePath, original]]));

      await expect(
        syncWorldMarkdown(exchange(), vault.adapter),
      ).rejects.toThrow(/conflict/);
      expect(vault.files.get(notePath)).toBe(original);
      expect(vault.writes).toEqual([]);
    },
  );
});
