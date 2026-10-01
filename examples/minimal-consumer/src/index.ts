import {
  parseWorldExchange,
  type WorldExchange,
} from "@simulation-external/world-io";

export interface WorldSummary {
  worldId: string;
  personIds: string[];
}

/** A consumer parses the portable contract and uses its typed domain data. */
export function summarizeWorldExchange(text: string): WorldSummary {
  const world: WorldExchange = parseWorldExchange(text);
  return {
    worldId: world.world.id,
    personIds: world.people.map(({ id }) => id),
  };
}
