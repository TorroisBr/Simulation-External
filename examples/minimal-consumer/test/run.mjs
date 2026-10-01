import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { summarizeWorldExchange } from "../dist/index.js";

const artifact = await readFile(
  new URL("../sample.world.json", import.meta.url),
  "utf8",
);
const result = summarizeWorldExchange(artifact);
assert.deepEqual(result, {
  worldId: "world-minimal-example",
  personIds: ["person-example"],
});

const exampleManifest = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
assert.deepEqual(Object.keys(exampleManifest.dependencies).sort(), [
  "@simulation-external/world-io",
]);

const worldIoManifest = JSON.parse(
  await readFile(
    new URL("../../../packages/world-io/package.json", import.meta.url),
    "utf8",
  ),
);
assert.deepEqual(Object.keys(worldIoManifest.dependencies).sort(), [
  "@simulation-external/world-schema",
]);

const consumerSource = await readFile(
  new URL("../src/index.ts", import.meta.url),
  "utf8",
);
assert.deepEqual(
  [...consumerSource.matchAll(/from\s+["']([^"']+)["']/g)].map(
    ([, specifier]) => specifier,
  ),
  ["@simulation-external/world-io"],
);
assert.doesNotMatch(
  consumerSource,
  /@simulation-external\/(?:web|obsidian-plugin|world-markdown|world-projection|world-fixtures)/,
);

console.log("Minimal independent World Exchange consumer passed.");
