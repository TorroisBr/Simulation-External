# Architecture

## Purpose

Simulation-External hosts experimental tools and integration surfaces without coupling them to the Simulation runtime. It is not the Simulation core repository and is not an authority for canonical Simulation architecture. The initial implementation uses fixtures only.

The shared boundary is a versioned, read-oriented World Exchange projection:

```text
Simulation Core (future, separately coordinated exporter)
                         ↓
               World Exchange contract
                   ↙             ↘
             Web Explorer      Obsidian
```

The exchange is not a persistence format. In particular, it must not mirror Phase 12 save data, runtime continuation state, hydration internals, receipts, mutation epochs, Unity serialization, or internal Store implementations.

## Package boundaries

- `packages/world-schema` owns public entity types, stable ID references, schema versioning, and runtime validation. It has no renderer or Simulation runtime dependency.
- `packages/world-fixtures` owns mock worlds used by consumers and tests. Fixtures are checked by the schema package.
- `packages/world-projection` contains an External-only, fixture-backed prototype of a narrow read-only source port and mapper into World Exchange. It depends on `world-schema`; it does not define entity types or provide a Simulation exporter contract.
- `packages/world-markdown` owns deterministic Markdown and frontmatter mapping plus safe generated-region synchronization. It can be tested without Obsidian.
- `apps/web` renders the exchange and fixture data. It may depend on the schema, fixtures, and shared Markdown utilities as appropriate; it must not define parallel domain entities.
- `apps/obsidian-plugin` adapts the same exchange to an Obsidian vault and delegates Markdown generation/synchronization to the shared package.

Dependency direction flows from consumers to shared packages. Shared packages must not depend on either app. No package may import Simulation core or Unity implementation types.

## External surface and future integration

The first exchange is read-only and fixture-backed. `world-projection` demonstrates a fixture-backed adapter boundary and explicit omissions; its source contract is not Simulation-owned and it does not read Simulation. A future read-only exporter needs an explicit contract owned or reviewed with Simulation core before any runtime integration is attempted. It must transform selected public domain data into the exchange instead of exposing runtime objects. IPC, sockets, an in-process REST server, save loading/editing, memory inspection, and live mutation are outside this foundation.

## Consumer architecture

Consumers adapt the renderer-independent exchange to their own navigation and presentation. Stable IDs connect entities. Consumer-local display state may exist, but canonical entity definitions and relationship meaning remain in `world-schema`. Obsidian-generated text has explicit ownership markers; user-authored content remains outside those markers and is preserved during synchronization.
