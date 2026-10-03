import {
  validateWorldExchange,
  type City,
  type Faction,
  type Institution,
  type Location,
  type Person,
  type WorldExchange,
  type WorldExchangeCollectionName,
} from "@simulation-external/world-schema";
import type {
  ActiveFactionAffiliationFact,
  CityCandidate,
  FactionCandidate,
  InstitutionCandidate,
  ItemDefinitionCandidate,
  LocationCandidate,
  PersonCandidate,
  ProjectionSource,
  SourceIdentity,
  WorldIdentityCandidate,
} from "./source.js";

export type ProjectionConcept =
  | "World"
  | "Person"
  | "City"
  | "Location"
  | "Organization"
  | "Institution"
  | "Faction"
  | "Item"
  | "HistoricalEvent"
  | "Relationship";

export type ProjectionIdentityConcept =
  "World" | "Person" | "City" | "Location" | "Institution" | "Faction";

export type ProjectionOmissionCode =
  | "world-identity-unavailable"
  | "required-field-unavailable"
  | "stable-identity-unavailable"
  | "duplicate-source-identity"
  | "reference-not-projectable"
  | "generic-organization-deferred"
  | "item-instance-semantics-unresolved"
  | "historical-event-contract-unavailable"
  | "generic-relationship-contract-unavailable"
  | "incomplete-collection-projection"
  | "exchange-validation-failed";

export interface ProjectionOmission {
  concept: ProjectionConcept;
  code: ProjectionOmissionCode;
  message: string;
  sourceId?: SourceIdentity;
  field?: string;
}

export interface ProjectionResult {
  /** Null means no complete v2 payload can be formed. */
  exchange: WorldExchange | null;
  omissions: readonly ProjectionOmission[];
}

const EXTERNAL_ID_PREFIX = "simulation-external:projection-v1";

/** Map source identities without consulting names, order, paths, or runtime IDs. */
export function toWorldExchangeId(
  concept: ProjectionIdentityConcept,
  sourceId: SourceIdentity,
): string {
  if (!isPresent(sourceId))
    throw new TypeError("Source identity must be non-empty.");
  const idType = concept.toLowerCase();
  return `${EXTERNAL_ID_PREFIX}:${idType}:${encodeURIComponent(sourceId)}`;
}

/**
 * Project only explicit factual candidates into World Exchange v2.
 * Missing required facts produce omissions; no display fallbacks are synthesized.
 */
export function projectWorldExchange(
  source: ProjectionSource,
): ProjectionResult {
  const omissions: ProjectionOmission[] = [];
  const worldCandidate = source.readWorldIdentity();
  const world = projectWorld(worldCandidate, omissions);
  const collectionCoverage = source.readCollectionCoverage();

  const rawLocationCandidates = source.readLocations();
  const locationCandidates = uniqueCandidates(
    rawLocationCandidates,
    "Location",
    omissions,
  );
  const locations = new Map<string, Location>();
  for (const candidate of locationCandidates) {
    const entity = projectLocation(candidate, omissions);
    if (entity) locations.set(candidate.sourceId!, entity);
  }

  const rawCityCandidates = source.readCities();
  const cityCandidates = uniqueCandidates(rawCityCandidates, "City", omissions);
  const cities = new Map<string, City>();
  for (const candidate of cityCandidates) {
    const city = projectCity(candidate, locations, omissions);
    if (city) cities.set(candidate.sourceId!, city);
  }

  for (const candidate of locationCandidates) {
    const location = candidate.sourceId
      ? locations.get(candidate.sourceId)
      : undefined;
    if (!location) continue;
    if (candidate.citySourceId) {
      const city = cities.get(candidate.citySourceId);
      if (city) location.cityId = city.id;
      else {
        omissions.push({
          concept: "Location",
          code: "reference-not-projectable",
          ...withSourceId(candidate.sourceId),
          field: "cityId",
          message: "The referenced City has no projectable stable identity.",
        });
      }
    }
    if (candidate.parentLocationSourceId) {
      const parent = locations.get(candidate.parentLocationSourceId);
      if (parent) location.parentLocationId = parent.id;
      else {
        omissions.push({
          concept: "Location",
          code: "reference-not-projectable",
          ...withSourceId(candidate.sourceId),
          field: "parentLocationId",
          message:
            "The referenced parent Location lacks its required public kind.",
        });
      }
    }
  }

  const rawPersonCandidates = source.readPeople();
  const personCandidates = uniqueCandidates(
    rawPersonCandidates,
    "Person",
    omissions,
  );
  const people = new Map<string, Person>();
  for (const candidate of personCandidates) {
    const person = projectPerson(candidate, cities, locations, omissions);
    if (person) people.set(candidate.sourceId!, person);
  }

  const rawFactionCandidates = source.readFactions();
  const factionCandidates = uniqueCandidates(
    rawFactionCandidates,
    "Faction",
    omissions,
  );
  const factions = new Map<string, Faction>();
  for (const candidate of factionCandidates) {
    const faction = projectFaction(candidate, omissions);
    if (faction) factions.set(candidate.sourceId!, faction);
  }

  const institutions = new Map<string, Institution>();
  const rawInstitutionCandidates = source.readInstitutions();
  for (const candidate of uniqueCandidates(
    rawInstitutionCandidates,
    "Institution",
    omissions,
  )) {
    const institution = projectInstitution(candidate, omissions);
    if (institution && candidate.sourceId)
      institutions.set(candidate.sourceId, institution);
  }

  projectActiveAffiliations(
    source.readActiveFactionAffiliations(),
    people,
    factions,
    omissions,
  );

  for (const candidate of uniqueCandidates(
    source.readItemDefinitions(),
    "Item",
    omissions,
  )) {
    projectItemDefinition(candidate, omissions);
  }
  omissions.push({
    concept: "Organization",
    code: "generic-organization-deferred",
    message:
      "Generic Organization projection is deferred by the canonical Simulation architecture.",
  });
  omissions.push({
    concept: "HistoricalEvent",
    code: "historical-event-contract-unavailable",
    field: "id/time",
    message:
      "No generic retained-event source contract, stable identity, lifecycle, and time mapping is established; current facts are not converted into history.",
  });
  omissions.push({
    concept: "Relationship",
    code: "generic-relationship-contract-unavailable",
    message:
      "Only active faction affiliation is read here; it is represented by direct faction/member IDs, not a generic Relationship entity.",
  });

  if (!world) {
    return { exchange: null, omissions: sortOmissions(omissions) };
  }

  const projectedCollections: Record<
    WorldExchangeCollectionName,
    readonly { id: string }[]
  > = {
    people: [...people.values()],
    cities: [...cities.values()],
    locations: [...locations.values()],
    organizations: [],
    institutions: [...institutions.values()],
    factions: [...factions.values()],
    items: [],
    historicalEvents: [],
    relationships: [],
  };
  const sourceCandidateCounts: Partial<
    Record<WorldExchangeCollectionName, number>
  > = {
    people: rawPersonCandidates.length,
    cities: rawCityCandidates.length,
    locations: rawLocationCandidates.length,
    institutions: rawInstitutionCandidates.length,
    factions: rawFactionCandidates.length,
  };
  for (const [collection, candidateCount] of Object.entries(
    sourceCandidateCounts,
  ) as [WorldExchangeCollectionName, number][]) {
    if (
      collectionCoverage[collection] === "INCLUDED" &&
      projectedCollections[collection].length !== candidateCount
    ) {
      omissions.push({
        concept: conceptForCollection(collection),
        code: "incomplete-collection-projection",
        field: collection,
        message:
          "The source declared whole-World coverage, but one or more source candidates could not be mapped; no partial v2 artifact is emitted.",
      });
    }
  }
  if (
    omissions.some(({ code }) => code === "incomplete-collection-projection")
  ) {
    return { exchange: null, omissions: sortOmissions(omissions) };
  }

  const exchange: WorldExchange = {
    schemaVersion: 2,
    collectionCoverage,
    world,
    people: [...people.values()].sort(byId),
    cities: [...cities.values()].sort(byId),
    locations: [...locations.values()].sort(byId),
    organizations: [],
    institutions: [...institutions.values()].sort(byId),
    factions: [...factions.values()].sort(byId),
    items: [],
    historicalEvents: [],
    relationships: [],
  };
  const validation = validateWorldExchange(exchange);
  if (!validation.valid) {
    for (const issue of validation.issues) {
      omissions.push({
        concept: "World",
        code: "exchange-validation-failed",
        field: issue.path,
        message: `${issue.code}: ${issue.message}`,
      });
    }
    return { exchange: null, omissions: sortOmissions(omissions) };
  }

  return { exchange: validation.value, omissions: sortOmissions(omissions) };
}

function projectWorld(
  candidate: WorldIdentityCandidate | undefined,
  omissions: ProjectionOmission[],
): WorldExchange["world"] | null {
  if (!candidate || !isPresent(candidate.sourceId)) {
    omissions.push({
      concept: "World",
      code: "world-identity-unavailable",
      field: "id",
      message:
        "This projection source supplied no source-owned stable World identity; a complete World Exchange v2 payload cannot be emitted.",
    });
    return null;
  }
  return {
    id: toWorldExchangeId("World", candidate.sourceId),
    ...(isPresent(candidate.name) ? { name: candidate.name.trim() } : {}),
  };
}

function projectPerson(
  candidate: PersonCandidate,
  cities: Map<string, City>,
  locations: Map<string, Location>,
  omissions: ProjectionOmission[],
): Person | null {
  const id = projectedIdentity("Person", candidate.sourceId, omissions);
  if (!id) return null;
  const person: Person = {
    id,
    ...(isPresent(candidate.publicName)
      ? { name: candidate.publicName.trim() }
      : {}),
  };
  if (candidate.residenceCitySourceId) {
    const city = cities.get(candidate.residenceCitySourceId);
    if (city) person.residenceId = city.id;
    else {
      omissions.push({
        concept: "Person",
        code: "reference-not-projectable",
        ...withSourceId(candidate.sourceId),
        field: "residenceId",
        message: "The referenced City has no projectable stable identity.",
      });
    }
  } else if (candidate.residenceIdentityUnavailable) {
    omissions.push({
      concept: "Person",
      code: "reference-not-projectable",
      ...withSourceId(candidate.sourceId),
      field: "residenceId",
      message:
        "Current residence exists, but no approved stable City crosswalk is available.",
    });
  }
  if (candidate.currentLocationSourceId) {
    const location = locations.get(candidate.currentLocationSourceId);
    if (location) person.locationId = location.id;
    else {
      omissions.push({
        concept: "Person",
        code: "reference-not-projectable",
        ...withSourceId(candidate.sourceId),
        field: "locationId",
        message: "The referenced Location lacks its required public kind.",
      });
    }
  }
  return person;
}

function projectCity(
  candidate: CityCandidate,
  locations: Map<string, Location>,
  omissions: ProjectionOmission[],
): City | null {
  if (!isPresent(candidate.sourceId)) {
    omissions.push({
      concept: "City",
      code: "stable-identity-unavailable",
      ...withSourceId(candidate.authoredDefinitionId),
      field: "id",
      message:
        "An authored City definition is not a stable City instance identity; no City ID is emitted.",
    });
    return null;
  }
  const city: City = {
    id: toWorldExchangeId("City", candidate.sourceId),
    ...(isPresent(candidate.publicName)
      ? { name: candidate.publicName.trim() }
      : {}),
  };
  if (candidate.locationSourceId) {
    const location = locations.get(candidate.locationSourceId);
    if (location) city.locationId = location.id;
    else {
      omissions.push({
        concept: "City",
        code: "reference-not-projectable",
        sourceId: candidate.sourceId,
        field: "locationId",
        message: "The anchored Location lacks its required public kind.",
      });
    }
  }
  return city;
}

function projectLocation(
  candidate: LocationCandidate,
  omissions: ProjectionOmission[],
): Location | null {
  const id = projectedIdentity("Location", candidate.sourceId, omissions);
  if (!id) return null;
  if (!isPresent(candidate.publicKind)) {
    omissions.push({
      concept: "Location",
      code: "required-field-unavailable",
      ...withSourceId(candidate.sourceId),
      field: "kind",
      message: "World Exchange requires an approved public Location kind.",
    });
  }
  if (!isPresent(candidate.publicKind)) return null;
  return {
    id,
    kind: candidate.publicKind.trim(),
    ...(isPresent(candidate.publicName)
      ? { name: candidate.publicName.trim() }
      : {}),
  };
}

function projectInstitution(
  candidate: InstitutionCandidate,
  omissions: ProjectionOmission[],
): Institution | null {
  if (!projectedIdentity("Institution", candidate.sourceId, omissions))
    return null;
  if (!isPresent(candidate.publicType)) {
    omissions.push({
      concept: "Institution",
      code: "required-field-unavailable",
      ...withSourceId(candidate.sourceId),
      field: "type",
      message:
        "Canonical Institution records do not establish the required v1 type.",
    });
    return null;
  }
  return {
    id: toWorldExchangeId("Institution", candidate.sourceId!),
    type: candidate.publicType.trim(),
    ...(isPresent(candidate.publicName)
      ? { name: candidate.publicName.trim() }
      : {}),
  };
}

function projectFaction(
  candidate: FactionCandidate,
  omissions: ProjectionOmission[],
): Faction | null {
  const id = projectedIdentity("Faction", candidate.sourceId, omissions);
  if (!id) return null;
  return {
    id,
    ...(isPresent(candidate.publicName)
      ? { name: candidate.publicName.trim() }
      : {}),
  };
}

function projectActiveAffiliations(
  affiliations: readonly ActiveFactionAffiliationFact[],
  people: Map<string, Person>,
  factions: Map<string, Faction>,
  omissions: ProjectionOmission[],
): void {
  let incompleteMembership = false;
  const ordered = [...affiliations].sort(
    (left, right) =>
      compareStrings(left.factionSourceId, right.factionSourceId) ||
      compareStrings(left.personSourceId, right.personSourceId),
  );
  for (const affiliation of ordered) {
    const person = people.get(affiliation.personSourceId);
    const faction = factions.get(affiliation.factionSourceId);
    if (!person || !faction) {
      omissions.push({
        concept: "Faction",
        code: "reference-not-projectable",
        sourceId: affiliation.factionSourceId,
        field: "memberIds",
        message:
          "An active affiliation endpoint is omitted because its Person or Faction identity is not projectable.",
      });
      incompleteMembership = true;
      continue;
    }
    faction.memberIds = faction.memberIds ?? [];
    if (!faction.memberIds.includes(person.id))
      faction.memberIds.push(person.id);
    person.factionIds = person.factionIds ?? [];
    if (!person.factionIds.includes(faction.id))
      person.factionIds.push(faction.id);
  }
  if (incompleteMembership) {
    // The direct arrays have no partial-coverage marker. Remove both sides
    // rather than serializing empty or partial membership as factual absence.
    for (const faction of factions.values()) delete faction.memberIds;
    for (const person of people.values()) delete person.factionIds;
    return;
  }
  for (const faction of factions.values())
    faction.memberIds?.sort(compareStrings);
  for (const person of people.values()) person.factionIds?.sort(compareStrings);
}

function projectItemDefinition(
  candidate: ItemDefinitionCandidate,
  omissions: ProjectionOmission[],
): void {
  omissions.push({
    concept: "Item",
    code: "item-instance-semantics-unresolved",
    ...(candidate.sourceId ? { sourceId: candidate.sourceId } : {}),
    field: "id",
    message:
      "A catalog definition is not a unique held Item; v1 has no definition/instance or quantity distinction.",
  });
  if (!isPresent(candidate.publicType)) {
    omissions.push({
      concept: "Item",
      code: "required-field-unavailable",
      ...(candidate.sourceId ? { sourceId: candidate.sourceId } : {}),
      field: "type",
      message:
        "No approved source for the required World Exchange Item.type is available.",
    });
  }
}

function projectedIdentity(
  concept: ProjectionIdentityConcept,
  sourceId: SourceIdentity | undefined,
  omissions: ProjectionOmission[],
): string | null {
  if (!isPresent(sourceId)) {
    omissions.push({
      concept,
      code: "stable-identity-unavailable",
      field: "id",
      message: `No stable source identity is available for ${concept}.`,
    });
    return null;
  }
  return toWorldExchangeId(concept, sourceId);
}

function uniqueCandidates<T extends { sourceId?: string }>(
  values: readonly T[],
  concept: ProjectionConcept,
  omissions: ProjectionOmission[],
): T[] {
  const ordered = [...values].sort((left, right) =>
    compareStrings(left.sourceId ?? "", right.sourceId ?? ""),
  );
  const counts = new Map<string, number>();
  for (const candidate of ordered) {
    if (isPresent(candidate.sourceId)) {
      counts.set(candidate.sourceId, (counts.get(candidate.sourceId) ?? 0) + 1);
    }
  }
  const duplicates = new Set(
    [...counts].filter(([, count]) => count > 1).map(([sourceId]) => sourceId),
  );
  for (const sourceId of duplicates) {
    omissions.push({
      concept,
      code: "duplicate-source-identity",
      sourceId,
      field: "id",
      message: `Multiple ${concept} candidates share one source identity; all are omitted as ambiguous.`,
    });
  }
  return ordered.filter(
    (candidate) =>
      !isPresent(candidate.sourceId) || !duplicates.has(candidate.sourceId),
  );
}

function sortOmissions(values: ProjectionOmission[]): ProjectionOmission[] {
  return [...values].sort(
    (left, right) =>
      compareStrings(left.concept, right.concept) ||
      compareStrings(left.sourceId ?? "", right.sourceId ?? "") ||
      compareStrings(left.field ?? "", right.field ?? "") ||
      compareStrings(left.code, right.code) ||
      compareStrings(left.message, right.message),
  );
}

function byId(left: { id: string }, right: { id: string }): number {
  return compareStrings(left.id, right.id);
}

function conceptForCollection(
  collection: WorldExchangeCollectionName,
): ProjectionConcept {
  switch (collection) {
    case "people":
      return "Person";
    case "cities":
      return "City";
    case "locations":
      return "Location";
    case "organizations":
      return "Organization";
    case "institutions":
      return "Institution";
    case "factions":
      return "Faction";
    case "items":
      return "Item";
    case "historicalEvents":
      return "HistoricalEvent";
    case "relationships":
      return "Relationship";
  }
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isPresent(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function withSourceId(
  sourceId: SourceIdentity | undefined,
): Pick<ProjectionOmission, "sourceId"> | Record<never, never> {
  return sourceId === undefined ? {} : { sourceId };
}

export type {
  ActiveFactionAffiliationFact,
  CityCandidate,
  FactionCandidate,
  InstitutionCandidate,
  ItemDefinitionCandidate,
  LocationCandidate,
  PersonCandidate,
  ProjectionSource,
  SourceIdentity,
  WorldIdentityCandidate,
} from "./source.js";
