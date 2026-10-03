# World Exchange I/O

`@simulation-external/world-io` provides the supported workspace API for
parsing, validating, and deterministically serializing portable World
Exchange v1 and v2 JSON. It delegates entity semantics and validation to
`@simulation-external/world-schema`; its only runtime dependency is that
contract package.

```ts
import {
  parseWorldExchange,
  type WorldExchange,
} from "@simulation-external/world-io";

const world: WorldExchange = parseWorldExchange(jsonText);
console.log(world.world.id, world.people.length);
```

Updated readers preserve legacy v1 without inferring completeness from array
lengths. V2 requires a complete, internally consistent `collectionCoverage`
map; parsing never upgrades a v1 artifact.

The package root exports `parseWorldExchange`, `validateWorldExchange`,
`serializeWorldExchange`, the World Exchange and validation types, and typed
parse/validation/serialization errors. Parsing rejects malformed UTF-8,
invalid JSON, unsupported versions, and schema violations without repair.
Serialization validates first, sorts object keys, preserves array ordering,
and emits two-space JSON with a final newline.

Portable files use UTF-8, the `*.world.json` suffix, and the ordinary v1 or v2
World Exchange document. The format is language-neutral and is not P12
persistence. The package has no Web, Obsidian, fixture, projection, or Markdown
runtime dependency. It is not published; distribution is a separate future
decision.

See [Portable World Exchange](../../docs/PORTABLE_WORLD_EXCHANGE.md) and the
[platform surface](../../docs/EXTERNAL_PLATFORM_SURFACE.md) for the full
consumer and compatibility model.
