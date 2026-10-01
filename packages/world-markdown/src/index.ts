import type { WorldExchange } from "@simulation-external/world-schema";

export const GENERATED_START = "<!-- simulation-external:generated:start -->";
export const GENERATED_END = "<!-- simulation-external:generated:end -->";

export class SimulationIdConflictError extends Error {
  constructor(
    path: string,
    key: string,
    existingId: string,
    incomingId: string,
  ) {
    super(
      `${key} conflict for ${path}: note belongs to ${JSON.stringify(existingId)}, incoming exchange is ${JSON.stringify(incomingId)}`,
    );
    this.name = "SimulationIdConflictError";
  }
}

export interface MarkdownNote {
  /** Vault-relative path, without a leading slash. */
  path: string;
  entityId: string;
  type: string;
  content: string;
}

export interface MarkdownVaultAdapter {
  /** Return null when the path does not exist. */
  read(path: string): Promise<string | null>;
  write(path: string, content: string): Promise<void>;
}

export interface MarkdownSyncResult {
  created: string[];
  updated: string[];
  unchanged: string[];
}

interface CollectionSpec {
  key: string;
  folder: string;
  type: string;
}

interface EntityNoteSource {
  entity: Record<string, unknown>;
  id: string;
  displayName: string;
  path: string;
  type: string;
}

const COLLECTIONS: readonly CollectionSpec[] = [
  { key: "people", folder: "People", type: "person" },
  { key: "cities", folder: "Cities", type: "city" },
  { key: "locations", folder: "Locations", type: "location" },
  { key: "organizations", folder: "Organizations", type: "organization" },
  { key: "institutions", folder: "Institutions", type: "institution" },
  { key: "factions", folder: "Factions", type: "faction" },
  { key: "items", folder: "Items", type: "item" },
  { key: "historicalEvents", folder: "History", type: "historical-event" },
  { key: "relationships", folder: "Relationships", type: "relationship" },
];

const OWNED_FRONTMATTER_KEYS = [
  "simulation_id",
  "simulation_world_id",
  "simulation_type",
  "schema_version",
] as const;

const REFERENCE_FIELDS = new Set([
  "residenceId",
  "locationId",
  "organizationIds",
  "institutionIds",
  "factionIds",
  "relationshipIds",
  "parentLocationId",
  "cityId",
  "memberIds",
  "cityIds",
  "importantPersonIds",
  "ownerId",
  "participantIds",
  "locationIds",
  "relatedEntityIds",
  "sourceId",
  "targetId",
]);

/** Render all exchange entities to stable, vault-relative Markdown notes. */
export function renderWorldMarkdownNotes(
  exchange: WorldExchange,
): MarkdownNote[] {
  const model = readExchange(exchange);
  const worldMetadata = model.exchange.world;
  if (!isRecord(worldMetadata))
    throw new TypeError("WorldExchange.world must be an object");
  const worldId = worldMetadata.id;
  if (
    (typeof worldId !== "string" && typeof worldId !== "number") ||
    String(worldId).trim() === ""
  ) {
    throw new TypeError("WorldExchange.world must have a non-empty id");
  }

  const worldName = getDisplayName(worldMetadata, "world");
  const sources: EntityNoteSource[] = [
    {
      entity: worldMetadata,
      id: String(worldId),
      displayName: worldName,
      path: `World/id-${encodeId(String(worldId))}.md`,
      type: "world",
    },
  ];

  for (const collection of COLLECTIONS) {
    const values = model.exchange[collection.key];
    if (values === undefined || values === null) continue;
    if (!Array.isArray(values)) {
      throw new TypeError(
        `WorldExchange.${collection.key} must be an array when present`,
      );
    }

    for (const [index, value] of values.entries()) {
      if (!isRecord(value)) {
        throw new TypeError(
          `WorldExchange.${collection.key}[${index}] must be an object`,
        );
      }
      const rawId = value.id ?? value.stableId;
      if (
        (typeof rawId !== "string" && typeof rawId !== "number") ||
        String(rawId).trim() === ""
      ) {
        throw new TypeError(
          `WorldExchange.${collection.key}[${index}] must have a non-empty stable id`,
        );
      }

      const id = String(rawId);
      const displayName = getDisplayName(value, collection.type);
      const fileName = `id-${encodeId(id)}.md`;
      sources.push({
        entity: value,
        id,
        displayName,
        path: `${collection.folder}/${fileName}`,
        type: collection.type,
      });
    }
  }

  const idTargets = new Map<string, EntityNoteSource | null>();
  for (const source of sources) {
    idTargets.set(source.id, idTargets.has(source.id) ? null : source);
  }

  const schemaVersion = toMetadataValue(model.schemaVersion, "schemaVersion");
  return sources
    .map((source) => {
      const metadata = {
        simulation_id: source.id,
        simulation_world_id: model.simulationId,
        simulation_type: source.type,
        schema_version: schemaVersion,
      };
      const body = renderEntityBlock(source, idTargets);
      return {
        path: source.path,
        entityId: source.id,
        type: source.type,
        content: `${renderFrontmatter(metadata)}${body}${LINE_ENDING}## GM Notes${LINE_ENDING}${LINE_ENDING}`,
      };
    })
    .sort((left, right) => compareStrings(left.path, right.path));
}

/**
 * Sync generated notes into a vault adapter. The function only changes the
 * four owned top-level frontmatter fields and the generated marker block;
 * all text outside those regions is copied verbatim.
 */
export async function syncWorldMarkdown(
  exchange: WorldExchange,
  vault: MarkdownVaultAdapter,
): Promise<MarkdownSyncResult> {
  const result: MarkdownSyncResult = {
    created: [],
    updated: [],
    unchanged: [],
  };
  const notes = renderWorldMarkdownNotes(exchange);
  const pendingWrites: Array<{ path: string; content: string }> = [];

  for (const note of notes) {
    const existing = await vault.read(note.path);
    const next =
      existing === null
        ? note.content
        : mergeExistingNote(existing, note.content, note.path);
    if (existing === null) {
      pendingWrites.push({ path: note.path, content: next });
      result.created.push(note.path);
    } else if (next !== existing) {
      pendingWrites.push({ path: note.path, content: next });
      result.updated.push(note.path);
    } else {
      result.unchanged.push(note.path);
    }
  }

  for (const file of pendingWrites) await vault.write(file.path, file.content);

  return result;
}

/** Merge generated material into an existing note without rewriting user sections. */
export function mergeExistingNote(
  existing: string,
  generated: string,
  path = "existing note",
): string {
  const eol = existing.includes("\r\n") ? "\r\n" : LINE_ENDING;
  const generatedFrontmatter = extractFrontmatter(generated);
  assertSimulationOwnership(existing, generatedFrontmatter.metadata, path);
  const withFrontmatter = updateOwnedFrontmatter(
    existing,
    generatedFrontmatter.metadata,
    eol,
  );
  const block = extractGeneratedBlock(generated).replaceAll(LINE_ENDING, eol);
  return replaceGeneratedBlock(withFrontmatter, block, eol);
}

function readExchange(exchange: WorldExchange): {
  exchange: Record<string, unknown>;
  schemaVersion: unknown;
  simulationId: string;
} {
  if (!isRecord(exchange))
    throw new TypeError("WorldExchange must be an object");
  const root = exchange as unknown as Record<string, unknown>;
  if (!isRecord(root.world))
    throw new TypeError("WorldExchange.world must be an object");

  const world = root.world;
  const simulationCandidate = world.id;
  const simulationId =
    typeof simulationCandidate === "string" ||
    typeof simulationCandidate === "number"
      ? String(simulationCandidate)
      : "default";
  if (simulationId.trim() === "")
    throw new TypeError("WorldExchange must have a non-empty simulation id");
  if (root.schemaVersion === undefined || root.schemaVersion === null) {
    throw new TypeError("WorldExchange.schemaVersion is required");
  }

  return { exchange: root, schemaVersion: root.schemaVersion, simulationId };
}

function renderEntityBlock(
  source: EntityNoteSource,
  idTargets: Map<string, EntityNoteSource | null>,
): string {
  const eol = LINE_ENDING;
  const lines = [
    GENERATED_START,
    `# ${escapeMarkdownHeading(source.displayName)}`,
    "",
    `**Type:** ${source.type}  `,
    `**Stable ID:** \`${escapeInlineCode(source.id)}\``,
  ];

  const links = [...collectReferencedIds(source.entity)]
    .filter((id) => id !== source.id)
    .map((id) => idTargets.get(id))
    .filter(
      (target): target is EntityNoteSource =>
        target !== undefined && target !== null,
    )
    .sort((left, right) => compareStrings(left.path, right.path));
  if (links.length > 0) {
    lines.push("", "### Related notes");
    for (const target of links) {
      const linkPath = target.path.slice(0, -3);
      lines.push(
        `- [[${linkPath}|${escapeWikilinkLabel(target.displayName)}]]`,
      );
    }
  }

  lines.push(
    "",
    "### Canonical data",
    "",
    "```json",
    stableJson(source.entity),
    "```",
    GENERATED_END,
  );
  return lines.join(eol);
}

function renderFrontmatter(
  metadata: Record<(typeof OWNED_FRONTMATTER_KEYS)[number], string | number>,
): string {
  const lines = OWNED_FRONTMATTER_KEYS.map((key) => {
    const value = metadata[key];
    return `${key}: ${typeof value === "string" ? JSON.stringify(value) : value}`;
  });
  return `---${LINE_ENDING}${lines.join(LINE_ENDING)}${LINE_ENDING}---${LINE_ENDING}`;
}

function extractFrontmatter(markdown: string): {
  metadata: Record<string, string>;
} {
  const match = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/.exec(
    markdown,
  );
  if (match === null)
    throw new TypeError("Generated note is missing frontmatter");
  const metadata: Record<string, string> = {};
  for (const line of match[1]!.split(/\r?\n/)) {
    const field = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (field !== null) metadata[field[1]!] = field[2]!;
  }
  return { metadata };
}

function assertSimulationOwnership(
  markdown: string,
  generatedMetadata: Record<string, string>,
  path: string,
): void {
  const incomingIds = new Map([
    ["simulation_id", parseYamlScalar(generatedMetadata.simulation_id ?? "")],
    [
      "simulation_world_id",
      parseYamlScalar(generatedMetadata.simulation_world_id ?? ""),
    ],
  ]);
  const match = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/.exec(
    markdown,
  );
  if (match === null) {
    throw new SimulationIdConflictError(
      path,
      "simulation_id",
      "<missing>",
      incomingIds.get("simulation_id")!,
    );
  }

  const found = new Set<string>();
  for (const line of match[1]!.split(/\r?\n/)) {
    const field = /^(simulation_id|simulation_world_id):\s*(.*)$/.exec(line);
    if (field === null) continue;
    const key = field[1]!;
    const existingId = parseYamlScalar(field[2]!);
    const incomingId = incomingIds.get(key)!;
    found.add(key);
    if (existingId !== incomingId) {
      throw new SimulationIdConflictError(path, key, existingId, incomingId);
    }
  }

  for (const [key, incomingId] of incomingIds) {
    if (!found.has(key)) {
      throw new SimulationIdConflictError(path, key, "<missing>", incomingId);
    }
  }
}

function parseYamlScalar(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed === "string" || typeof parsed === "number")
        return String(parsed);
    } catch {
      // Keep malformed YAML text literal so it cannot silently claim another simulation.
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  return trimmed.replace(/\s+#.*$/, "").trim();
}

function updateOwnedFrontmatter(
  markdown: string,
  generatedMetadata: Record<string, string>,
  eol: string,
): string {
  const frontmatterMatch =
    /^(\uFEFF?---\r?\n)([\s\S]*?)(\r?\n---(?=\r?\n|$))/.exec(markdown);
  if (frontmatterMatch === null) {
    const metadataLines = OWNED_FRONTMATTER_KEYS.map(
      (key) => `${key}: ${generatedMetadata[key]}`,
    );
    return `${frontmatterFromLines(metadataLines, eol)}${markdown}`;
  }

  const retained: string[] = [];
  const found = new Set<string>();
  for (const line of frontmatterMatch[2]!.split(/\r?\n/)) {
    const key = /^([A-Za-z0-9_-]+):/.exec(line)?.[1];
    if (key === undefined || !isOwnedKey(key)) {
      retained.push(line);
      continue;
    }
    if (found.has(key)) continue;
    retained.push(`${key}: ${generatedMetadata[key]}`);
    found.add(key);
  }
  for (const key of OWNED_FRONTMATTER_KEYS) {
    if (!found.has(key)) retained.push(`${key}: ${generatedMetadata[key]}`);
  }

  const replacement = `${frontmatterMatch[1]}${retained.join(eol)}${frontmatterMatch[3]}`;
  return `${markdown.slice(0, frontmatterMatch.index)}${replacement}${markdown.slice(frontmatterMatch.index + frontmatterMatch[0].length)}`;
}

function frontmatterFromLines(lines: string[], eol: string): string {
  return `---${eol}${lines.join(eol)}${eol}---${eol}`;
}

function replaceGeneratedBlock(
  markdown: string,
  block: string,
  eol: string,
): string {
  const starts = occurrences(markdown, GENERATED_START);
  const ends = occurrences(markdown, GENERATED_END);
  if (starts.length === 0 && ends.length === 0) {
    const separator =
      markdown.length === 0 || markdown.endsWith("\n") ? eol : `${eol}${eol}`;
    return `${markdown}${separator}${block}${eol}`;
  }
  if (starts.length !== 1 || ends.length !== 1 || ends[0]! < starts[0]!) {
    throw new TypeError(
      "Existing note has malformed or duplicate generated block markers; refusing to overwrite it",
    );
  }

  const start = starts[0]!;
  const end = ends[0]! + GENERATED_END.length;
  return `${markdown.slice(0, start)}${block}${markdown.slice(end)}`;
}

function extractGeneratedBlock(markdown: string): string {
  const start = markdown.indexOf(GENERATED_START);
  const end = markdown.indexOf(GENERATED_END);
  if (start < 0 || end < start)
    throw new TypeError("Generated note is missing its generated marker block");
  return markdown.slice(start, end + GENERATED_END.length);
}

function collectReferencedIds(entity: Record<string, unknown>): Set<string> {
  const ids = new Set<string>();
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (typeof value === "string" && value.trim() !== "") ids.add(value);
    if (typeof value === "number" && Number.isFinite(value))
      ids.add(String(value));
  };
  for (const [field, value] of Object.entries(entity)) {
    if (REFERENCE_FIELDS.has(field)) visit(value);
  }
  return ids;
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortObjectKeys(value), null, 2).replaceAll(
    "```",
    "` ` `",
  );
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (!isRecord(value)) return value;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort(compareStrings))
    sorted[key] = sortObjectKeys(value[key]);
  return sorted;
}

function getDisplayName(entity: Record<string, unknown>, type: string): string {
  for (const key of ["name", "displayName", "title", "label"]) {
    const value = entity[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return `Untitled ${type}`;
}

function encodeId(id: string): string {
  return Array.from(id, (character) =>
    character.codePointAt(0)!.toString(16),
  ).join("-");
}

function toMetadataValue(value: unknown, name: string): string | number {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new TypeError(`WorldExchange.${name} must be a string or number`);
  }
  return value;
}

function occurrences(value: string, needle: string): number[] {
  const found: number[] = [];
  let cursor = 0;
  while (true) {
    const index = value.indexOf(needle, cursor);
    if (index < 0) return found;
    found.push(index);
    cursor = index + needle.length;
  }
}

function isOwnedKey(
  key: string,
): key is (typeof OWNED_FRONTMATTER_KEYS)[number] {
  return (OWNED_FRONTMATTER_KEYS as readonly string[]).includes(key);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeMarkdownHeading(value: string): string {
  return value.replace(/[\\`*_{}\x5B\x5D<>]/g, "\\$&").replace(/#/g, "\\#");
}

function escapeInlineCode(value: string): string {
  return value.replaceAll("`", "\\`");
}

function escapeWikilinkLabel(value: string): string {
  return value.replace(/[\\\]|#]/g, "\\$&");
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

const LINE_ENDING = "\n";
