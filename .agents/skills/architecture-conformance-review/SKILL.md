---
name: architecture-conformance-review
description: Review Simulation-External code and documentation for conformance with its external projection boundaries and identify architectural drift.
---

# Architecture Conformance Review

## Purpose and when to use

Use for an independent, preferably read-only review of an implementation slice or architecture change.

## Required reading

Read `AGENTS.md`, `docs/EXTERNAL_SYSTEM_REFERENCE.md`, `docs/ARCHITECTURE.md`, and the World Exchange and consumer docs relevant to the changed files.

## Preconditions

Identify the target commit or diff and the current repository status. Preserve existing local changes.

## Execution procedure

Check for Simulation-internal or Unity types in public contracts; duplicated consumer entity definitions; Web or Obsidian schema ownership; generated/user-content boundary violations; P12/save or premature runtime/IPC coupling; inconsistent docs; and other architectural drift. Trace cross-package imports and confirm that consumer-specific presentation concerns stay in consumer layers. Prefer concrete evidence over assumptions.

## Validation and expected output

Return findings ordered by severity with file paths, affected contract, evidence, and a focused recommendation. State explicitly when no findings are supported. Distinguish confirmed defects from open questions. Run validation only when it materially helps; do not change files during a review-only task.

## Stop or escalate when

Resolving a finding requires a Simulation canonical-architecture decision, an unsupported contract assumption, or an authorized cross-repository study. Surface the question instead of deciding it for Simulation.

## Must not do

Do not invent Simulation architecture, broaden the schema speculatively, or implement fixes unless the active request includes implementation.
