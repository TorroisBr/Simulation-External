# Minimal World Exchange Consumer

This example demonstrates the smallest TypeScript runtime dependency path for
an independent consumer of a portable World Exchange file:

```text
sample.world.json → world-io → world-schema types and validation
```

The example parses the local sample, reads `world.id`, and enumerates People.
Its only runtime package dependency is `@simulation-external/world-io`. It
does not import fixtures, adapters, Web, or Obsidian. The test checks the
example and `world-io` runtime dependency manifests and its direct import.

Run it from the repository root:

```sh
pnpm --filter @simulation-external/minimal-consumer-example test
```

The example is a workspace proof, not a published package. No registry
distribution is established. Any language can consume the documented JSON
contract without these TypeScript packages.
