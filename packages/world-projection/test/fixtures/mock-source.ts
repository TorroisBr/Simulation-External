import type { ProjectionSource, SourceIdentity } from "../../src/source.js";

export interface CanonicalCapabilityMock extends ProjectionSource {
  /** Deliberately outside ProjectionSource; actor-held beliefs are not facts. */
  readonly actorKnowledgeByPerson: Readonly<Record<string, unknown>>;
  /** Deliberately outside ProjectionSource; aggregate stock is not an Item. */
  readonly inventoryQuantities: readonly {
    itemDefinitionSourceId: SourceIdentity;
    quantity: number;
  }[];
  /** Legacy/local records are not exposed through the projection port. */
  readonly legacyOrganizationRecords: readonly {
    displayName: string;
  }[];
}

export interface ConsumerCompatibilityMock extends ProjectionSource {
  readonly actorKnowledgeByPerson: Readonly<Record<string, unknown>>;
  readonly inventoryQuantities: readonly {
    itemDefinitionSourceId: SourceIdentity;
    quantity: number;
  }[];
  readonly organizationCandidates: readonly {
    displayName: string;
    type: string;
  }[];
}

/** Sparse evidence fixture shaped by the corrected Stage D capability study. */
export function createCanonicalCapabilityMock(): CanonicalCapabilityMock {
  return {
    readWorldIdentity: () => undefined,
    readPeople: () => [
      {
        sourceId: "person:unnamed-record",
        residenceIdentityUnavailable: true,
        currentLocationSourceId: "location:hex-7-4",
      },
      {
        sourceId: "person:known-name",
        publicName: "Aster Vale",
        residenceIdentityUnavailable: true,
        currentLocationSourceId: "location:hex-7-4",
      },
    ],
    readCities: () => [
      {
        authoredDefinitionId: "city-definition:aurora",
        publicName: "Aurora Quay",
        locationSourceId: "location:aurora-anchor",
      },
    ],
    readLocations: () => [
      { sourceId: "location:aurora-anchor" },
      { sourceId: "location:hex-7-4" },
    ],
    readInstitutions: () => [
      { sourceId: "institution:archive", publicName: "Tide Archive" },
    ],
    readFactions: () => [{ sourceId: "faction:harbor" }],
    readActiveFactionAffiliations: () => [
      {
        factionSourceId: "faction:harbor",
        personSourceId: "person:known-name",
      },
    ],
    readItemDefinitions: () => [
      { sourceId: "item-definition:chart", publicName: "North Chart" },
    ],
    actorKnowledgeByPerson: {
      "person:known-name": { believedLocation: "location:hex-7-4" },
    },
    inventoryQuantities: [
      { itemDefinitionSourceId: "item-definition:chart", quantity: 27 },
    ],
    legacyOrganizationRecords: [{ displayName: "Legacy Guild" }],
  };
}

/**
 * A complete, explicitly fixture-owned source used only to prove that Web and
 * Markdown consumers accept the adapter's World Exchange output unchanged.
 */
export function createConsumerCompatibilityMock(
  options: {
    reverseRows?: boolean;
    personName?: string;
    includeDisplayNames?: boolean;
    includeWorldName?: boolean;
  } = {},
): ConsumerCompatibilityMock {
  const includeDisplayNames = options.includeDisplayNames !== false;
  const includeWorldName = options.includeWorldName !== false;
  const people = [
    {
      sourceId: "fixture-person:lyra",
      ...(includeDisplayNames
        ? { publicName: options.personName ?? "Lyra Venn" }
        : {}),
      residenceCitySourceId: "fixture-city:aurora",
      currentLocationSourceId: "fixture-location:aurora",
    },
    {
      sourceId: "fixture-person:tomas",
      ...(includeDisplayNames ? { publicName: "Tomas Rill" } : {}),
      residenceCitySourceId: "fixture-city:aurora",
      currentLocationSourceId: "fixture-location:aurora",
    },
  ];
  const cities = [
    {
      sourceId: "fixture-city:aurora",
      authoredDefinitionId: "fixture-city-definition:aurora",
      ...(includeDisplayNames ? { publicName: "Aurora Quay" } : {}),
      locationSourceId: "fixture-location:aurora",
    },
  ];
  const locations = [
    {
      sourceId: "fixture-location:aurora",
      ...(includeDisplayNames ? { publicName: "Aurora Quay" } : {}),
      publicKind: "fixture settlement anchor",
      citySourceId: "fixture-city:aurora",
    },
  ];
  const factions = [
    {
      sourceId: "fixture-faction:harbor",
      ...(includeDisplayNames ? { publicName: "Harbor Compact" } : {}),
    },
  ];
  return {
    readWorldIdentity: () => ({
      sourceId: "fixture-world:projection-consumer-check",
      ...(includeWorldName
        ? { name: "Projection Consumer Check Fixture" }
        : {}),
    }),
    readPeople: () => (options.reverseRows ? [...people].reverse() : people),
    readCities: () => (options.reverseRows ? [...cities].reverse() : cities),
    readLocations: () =>
      options.reverseRows ? [...locations].reverse() : locations,
    readInstitutions: () => [],
    readFactions: () =>
      options.reverseRows ? [...factions].reverse() : factions,
    readActiveFactionAffiliations: () => [
      {
        factionSourceId: "fixture-faction:harbor",
        personSourceId: "fixture-person:lyra",
      },
      {
        factionSourceId: "fixture-faction:harbor",
        personSourceId: "fixture-person:tomas",
      },
    ],
    readItemDefinitions: () => [
      {
        sourceId: "fixture-item-definition:chart",
        publicName: "North Chart",
        publicType: "catalog definition",
      },
    ],
    actorKnowledgeByPerson: {
      "fixture-person:lyra": { believedFaction: "fixture-faction:fictional" },
    },
    inventoryQuantities: [
      { itemDefinitionSourceId: "fixture-item-definition:chart", quantity: 14 },
    ],
    organizationCandidates: [
      { displayName: "Fixture-only Organization", type: "test value" },
    ],
  };
}
