---
name: obsidian-integration-slice
description: Implement or extend Obsidian vault mapping, Markdown generation, or fixture export while preserving identity and user-authored content.
---

# Obsidian Integration Slice

## Purpose and when to use

Use for Obsidian plugin commands, vault mapping, frontmatter, wikilinks, Markdown generation, or synchronization behavior.

## Required reading

Read `AGENTS.md`, `docs/EXTERNAL_SYSTEM_REFERENCE.md`, `docs/OBSIDIAN_MAPPING.md`, `docs/SYNC_MODEL.md`, and the relevant plugin and `world-markdown` code/tests.

## Preconditions

Identify the stable entity and world identity, generated regions, owned metadata keys, and collision behavior before changing synchronization.

## Execution procedure

Keep paths deterministic and identity based on Simulation IDs, independent of display names and filenames. Keep generated-block ownership explicit and preserve user content outside it. Make transformation logic deterministic and testable outside Obsidian where practical. Use official Obsidian APIs for live vault operations; keep parsing/merge logic in the shared package when it can be tested independently.

## Validation and expected output

Test deterministic rendering, stable IDs, wikilinks, identity collisions, malformed markers, and preservation of GM notes. Typecheck and build the plugin; run root formatting and lint checks for a checkpoint. Report exact commands and outputs.

## Stop or escalate when

Ownership cannot be established, a target file is unclaimed or mismatched, or the workflow requires authoring/import into Simulation. Leave conflicting content untouched and surface the conflict.

## Must not do

Do not treat Markdown as canonical World Exchange, overwrite user-authored content, infer identity from names, or add live runtime mutation.
