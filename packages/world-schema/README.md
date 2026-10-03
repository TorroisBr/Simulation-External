# World Exchange Contract

`@simulation-external/world-schema` owns the typed, renderer-independent
World Exchange v1 and v2 contracts and their validation semantics. V2 adds a
required whole-World coverage declaration for each collection; v1 remains
valid with coverage interpreted by updated consumers as `LEGACY_UNKNOWN`. Its
package-root exports include `WorldExchange`, `WorldExchangeV1`,
`WorldExchangeV2`, `WorldExchangeCollectionCoverage`,
`WorldExchangeCollectionCoverageStatus`, `WorldExchangeCollectionName`,
`EffectiveCollectionCoverage`, `WorldEntity`, `WorldExchangeIndex`, the
entity/JSON types, validation issue/result types, `validateWorldExchange`, and
generic world-index helpers.

World Exchange is a read-oriented interoperability contract, not Simulation
runtime state or P12 persistence. IDs are explicit and references are
ID-based; optional labels do not establish identity. Wire compatibility is
governed by `schemaVersion`, independently from package versions.

Consumers should import only the declared package root. Validation internals
and private helper functions are not public API. A consumer may implement the
documented contract in another language without this TypeScript package.

See [World Exchange v1](../../docs/WORLD_EXCHANGE.md) and the
[platform surface](../../docs/EXTERNAL_PLATFORM_SURFACE.md).
