/** A semantic identity supplied by a source authority, never a display label. */
export type SourceIdentity = string;

export interface WorldIdentityCandidate {
  sourceId?: SourceIdentity;
  name?: string;
}

export interface PersonCandidate {
  sourceId?: SourceIdentity;
  publicName?: string;
  residenceCitySourceId?: SourceIdentity;
  residenceIdentityUnavailable?: boolean;
  currentLocationSourceId?: SourceIdentity;
}

export interface CityCandidate {
  /** A stable City identity, if the source has an approved instance identity. */
  sourceId?: SourceIdentity;
  /** Authored content identity is kept distinct and is never used as City identity. */
  authoredDefinitionId?: SourceIdentity;
  publicName?: string;
  locationSourceId?: SourceIdentity;
}

export interface LocationCandidate {
  sourceId?: SourceIdentity;
  publicName?: string;
  publicKind?: string;
  citySourceId?: SourceIdentity;
  parentLocationSourceId?: SourceIdentity;
}

export interface InstitutionCandidate {
  sourceId?: SourceIdentity;
  publicName?: string;
  publicType?: string;
}

export interface FactionCandidate {
  sourceId?: SourceIdentity;
  publicName?: string;
}

/** An affiliation edge whose direction is Faction -> Person. */
export interface ActiveFactionAffiliationFact {
  factionSourceId: SourceIdentity;
  personSourceId: SourceIdentity;
}

/** A catalog definition, intentionally distinct from a unique held Item. */
export interface ItemDefinitionCandidate {
  sourceId?: SourceIdentity;
  publicName?: string;
  publicType?: string;
}

/**
 * Prototype-only, synchronous read port. Its records contain only candidate
 * projection facts; it is not a Simulation-owned API or a runtime object model.
 */
export interface ProjectionSource {
  readWorldIdentity(): WorldIdentityCandidate | undefined;
  readPeople(): readonly PersonCandidate[];
  readCities(): readonly CityCandidate[];
  readLocations(): readonly LocationCandidate[];
  readInstitutions(): readonly InstitutionCandidate[];
  readFactions(): readonly FactionCandidate[];
  readActiveFactionAffiliations(): readonly ActiveFactionAffiliationFact[];
  readItemDefinitions(): readonly ItemDefinitionCandidate[];
}
