import { describe, expect, it } from "vitest";
import { worldFixture } from "@simulation-external/world-fixtures";
import { renderWorldMarkdownNotes } from "@simulation-external/world-markdown";
import { serializeWorldExchange } from "@simulation-external/world-io";
import { syncWorldExchangeFile } from "../src/world-import.js";

function memoryVault(seed = new Map<string, string>()) {
  const writes: string[] = [];
  return {
    files: seed,
    writes,
    adapter: {
      async read(path: string) {
        return seed.get(path) ?? null;
      },
      async write(path: string, content: string) {
        writes.push(path);
        seed.set(path, content);
      },
    },
  };
}

describe("Obsidian portable World Exchange import", () => {
  it("syncs the parsed artifact through the same deterministic Markdown renderer", async () => {
    const vault = memoryVault();
    const artifact = new TextEncoder().encode(
      serializeWorldExchange(worldFixture),
    );

    const result = await syncWorldExchangeFile(artifact, vault.adapter);

    expect(result.created).toEqual(
      renderWorldMarkdownNotes(worldFixture).map(({ path }) => path),
    );
    expect(
      [...vault.files.entries()].map(([path, content]) => ({ path, content })),
    ).toEqual(
      renderWorldMarkdownNotes(worldFixture).map(({ path, content }) => ({
        path,
        content,
      })),
    );
  });

  it("preserves GM-authored text when a portable file is synced again", async () => {
    const vault = memoryVault();
    const json = serializeWorldExchange(worldFixture);
    await syncWorldExchangeFile(json, vault.adapter);

    const personNote = renderWorldMarkdownNotes(worldFixture).find(
      ({ type }) => type === "person",
    );
    if (!personNote) throw new Error("Fixture must render a person note");
    const original = vault.files.get(personNote.path);
    if (!original) throw new Error("Expected the imported person note");
    vault.files.set(
      personNote.path,
      original.replace(
        "## GM Notes\n\n",
        "## GM Notes\n\nKeep this GM-authored note.\n\n",
      ),
    );

    await syncWorldExchangeFile(json, vault.adapter);

    expect(vault.files.get(personNote.path)).toContain(
      "Keep this GM-authored note.",
    );
  });

  it("rejects conflicting stable identity metadata without writing notes", async () => {
    const personNote = renderWorldMarkdownNotes(worldFixture).find(
      ({ type }) => type === "person",
    );
    if (!personNote) throw new Error("Fixture must render a person note");
    const original =
      '---\nsimulation_id: "different-person"\nsimulation_world_id: "world-lyr"\n---\n\nKeep this note.';
    const vault = memoryVault(new Map([[personNote.path, original]]));

    await expect(
      syncWorldExchangeFile(
        serializeWorldExchange(worldFixture),
        vault.adapter,
      ),
    ).rejects.toThrow(/conflict/);
    expect(vault.files.get(personNote.path)).toBe(original);
    expect(vault.writes).toEqual([]);
  });
});
