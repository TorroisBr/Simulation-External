---
name: world-exchange-evolution
description: Extend or revise the shared World Exchange contract, validation, and fixtures while preserving stable identity and consumer compatibility.
---

# World Exchange Evolution

## Purpose and when to use

Use when changing shared World Exchange entities, fields, references, validation, or schema version behavior.

## Required reading

Read `AGENTS.md`, `docs/EXTERNAL_SYSTEM_REFERENCE.md`, `docs/WORLD_EXCHANGE.md`, `docs/ARCHITECTURE.md`, and the schema, fixture, Web, and Markdown contracts affected by the proposal.

## Preconditions

First decide whether the concept is genuinely shared domain data. Name its authoritative source, stable ID behavior, reference targets, and compatibility impact before editing.

## Execution procedure

1. Preserve explicit IDs and reference fields; avoid recursive entity graphs.
2. Determine whether the change is additive/optional or requires a new schema version or coexistence/migration strategy.
3. Update `world-schema` types, runtime validation, index/reference behavior, and negative cases as needed.
4. Update and validate fixtures, then verify Web and Markdown consumers still resolve the contract correctly.
5. Update `WORLD_EXCHANGE.md` and the concise system reference only for a meaningful capability or boundary change.
6. Obtain an independent architecture/schema review before declaring schema evolution complete.

## Validation and expected output

Run relevant schema and fixture tests, consumer tests, typecheck, build, lint, formatting, and `git diff --check`. Report compatibility impact, files changed, and validation evidence.

## Stop or escalate when

The field is consumer-specific, authority is unclear, the change exposes internals, or a breaking change lacks an agreed versioning plan. Ask for the missing domain decision.

## Must not do

Do not add a schema field merely to satisfy one renderer, expose runtime/store/persistence details, or redefine the P12 save model as World Exchange.
