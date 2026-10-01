---
name: web-explorer-slice
description: Implement or extend a Web World Explorer feature using the shared World Exchange contract and fixture data.
---

# Web Explorer Slice

## Purpose and when to use

Use for navigation, search, entity lists/details, relationship traversal, timeline, or presentation work in `apps/web`.

## Required reading

Read `AGENTS.md`, `docs/EXTERNAL_SYSTEM_REFERENCE.md`, `docs/ARCHITECTURE.md`, `docs/WORLD_EXCHANGE.md`, and the relevant Web code/tests.

## Preconditions

Confirm the feature can be built from the current World Exchange contract. If it appears to need shared domain data, resolve that through `world-exchange-evolution` first.

## Execution procedure

Consume types from `@simulation-external/world-schema` and data from `@simulation-external/world-fixtures`. Reuse shared entity/reference resolution where appropriate. Keep display-derived values, formatting, and view state in the Web layer. Add focused tests for navigation or user-visible behavior.

## Validation and expected output

Run the relevant Web tests and the actual Web package typecheck/build scripts. The root `pnpm typecheck` and `pnpm build` scripts cover all configured packages. Run root lint/format checks for a durable checkpoint. Report changed behavior and commands/results.

## Stop or escalate when

The feature requires live Simulation data, new shared fields, or a mutation path. Keep fixture-backed behavior and request the needed separate architecture contract.

## Must not do

Do not create parallel entity interfaces, make fixtures imply runtime connectivity, or add IPC, save loading, or mutation.
