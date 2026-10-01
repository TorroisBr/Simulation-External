# Repository Operating Contract

## Purpose and boundaries

- This repository contains experimental external tools and integration surfaces for the Simulation project.
- Never modify, write into, create worktrees for, or otherwise alter the Simulation core repository from work in this repository.
- This repository does not redefine canonical Simulation architecture. Coordinate any future integration with the core maintainers.
- Use fixture data until explicit, approved integration contracts exist. Avoid premature IPC or runtime coupling.
- The Phase 12 persistence/save format is not the World Exchange format. Do not model persistence receipts, mutation epochs, hydration internals, runtime continuation state, internal stores, or Unity serialization here.
- Public external schemas must not expose internal Simulation runtime implementation details, including runtime classes, internal stores, persistence owners, or Unity types.
- Stable IDs and explicitly versioned schemas are mandatory. Relationships should reference IDs instead of embedding recursive entity graphs.
- Preserve user-authored Obsidian content. Synchronization may own marked generated regions and carefully defined metadata only.
- Keep packages modular, renderer agnostic, and independent of any one consumer.
- Do not add live Unity integration, IPC, sockets, an in-Simulation REST server, save loading/editing, runtime memory access, bidirectional live mutation, a Mod API, code injection, runtime plugin loading, authentication, multiplayer, cloud sync, or a production database unless separately authorized and architecturally coordinated.

## Working practices

- Routine Git operations may be performed autonomously.
- Make meaningful commits at durable boundaries. Do not force push or rewrite shared history.
- Run relevant tests, lint, and type checks before declaring a checkpoint complete; run consumer builds where applicable.
- Keep fixtures representative and validate them against `@simulation-external/world-schema`.
- Maintain docs when schema, ownership, mapping, or package boundaries change.

## Logical agent responsibilities

Use these roles when parallel agent work is available and appropriate. The coordinator owns integration and final review.

### External Architecture Agent

- Maintain architectural boundaries and documentation consistency.
- Review cross-package dependencies and prevent coupling to Simulation internals.
- Review major schema evolution.
- Generally review rather than implement unrelated UI work.

### World Schema Agent

- Own the `world-schema` package, entity contracts, stable IDs, schema versioning, validation, relationships, and fixture compatibility.

### Web Explorer Agent

- Own the web application, navigation, search, entity lists and details, history/timeline views, and relationship navigation.
- Consume `world-schema` and `world-fixtures`; do not redefine entities locally.

### Obsidian Integration Agent

- Own the Obsidian plugin architecture, vault mapping, Markdown generation, frontmatter, wikilinks, generated/user-authored content separation, and synchronization model.
- Do not own or redefine the canonical World Exchange schema.

### Review / Validation Agent

- Independently review completed slices, run tests/typecheck/lint, check architecture boundaries, detect duplicated consumer models, and identify accidental coupling.
