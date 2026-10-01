# Repository Operating Contract

## Purpose and boundaries

- This repository contains experimental external tools and integration surfaces for the Simulation project.
- Do not modify, write into, create worktrees for, or otherwise alter the Simulation core repository unless a future prompt explicitly authorizes a coordinated cross-repository operation. Read-only inspection is allowed only when an integration study explicitly calls for it.
- This repository does not redefine canonical Simulation architecture. Coordinate any future integration with the core maintainers.
- Use fixture data until explicit, approved integration contracts exist. Avoid premature IPC or runtime coupling.
- The Phase 12 persistence/save format is not the World Exchange format. Do not model persistence receipts, mutation epochs, hydration internals, runtime continuation state, internal stores, or Unity serialization here.
- Public external schemas must not expose internal Simulation runtime implementation details, including runtime classes, internal stores, persistence owners, or Unity types.
- Stable IDs and explicitly versioned schemas are mandatory. Relationships should reference IDs instead of embedding recursive entity graphs.
- Preserve user-authored Obsidian content. Synchronization may own marked generated regions and carefully defined metadata only.
- Keep packages modular, renderer agnostic, and independent of any one consumer.
- Do not add live Unity integration, IPC, sockets, an in-Simulation REST server, save loading/editing, runtime memory access, bidirectional live mutation, a Mod API, code injection, runtime plugin loading, authentication, multiplayer, cloud sync, or a production database unless separately authorized and architecturally coordinated.
- For authorized Simulation source studies, use the ignored `.references/Simulation` mirror and its mirror workflow; do not use the sibling checkout. Never publish from the mirror, and preserve its local experiments and dirty state.

## Working practices

- Routine Git operations may be performed autonomously.
- Make meaningful commits at durable boundaries. Do not force push or rewrite shared history.
- Run relevant tests, lint, and type checks before declaring a checkpoint complete; run consumer builds where applicable.
- Keep fixtures representative and validate them against `@simulation-external/world-schema`.
- Maintain docs when schema, ownership, mapping, or package boundaries change.

## Required startup reading

For architecture, schema, or integration work, read these before making changes:

1. `AGENTS.md`.
2. `docs/EXTERNAL_SYSTEM_REFERENCE.md`.
3. The detailed design docs relevant to the task.
4. The relevant workflow under `.agents/skills/*/SKILL.md`.

For narrow UI or maintenance work, read the reference and the applicable skill when they materially affect the task. Inspect the repository state rather than trusting remembered paths or conversational summaries.

## Documentation authority

- `AGENTS.md` defines standing operating rules.
- `docs/EXTERNAL_SYSTEM_REFERENCE.md` summarizes the current project and architecture.
- `docs/ARCHITECTURE.md` and domain-specific docs provide detailed design authority.
- `.agents/skills/*/SKILL.md` provides reusable execution procedures.
- The current conversation prompt defines the objective for the active task; it does not silently replace project architecture.

If these sources conflict, identify and report the conflict before making a consequential architectural choice. Do not silently invent a resolution.

## Reference maintenance

Update `docs/EXTERNAL_SYSTEM_REFERENCE.md` only when repository structure, architectural boundaries, implemented integration stage, a major World Exchange capability, the current roadmap stage, or permanent validation workflow changes. Do not update it for routine UI or fixture edits; keep detailed evidence in the domain docs and Git history.

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
