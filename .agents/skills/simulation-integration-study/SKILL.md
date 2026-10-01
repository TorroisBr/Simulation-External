---
name: simulation-integration-study
description: Conduct a read-only study of Simulation sources to propose a future World Exchange projection boundary without changing Simulation.
---

# Simulation Integration Study

## Purpose and when to use

Use only when an active request explicitly asks for a read-only investigation of the Simulation repository to design future projection integration.

## Required reading

Read this repository's `AGENTS.md`, `docs/EXTERNAL_SYSTEM_REFERENCE.md`, `docs/ARCHITECTURE.md`, `docs/WORLD_EXCHANGE.md`, and relevant roadmap entries. Read core-repository instructions before any authorized read-only inspection there.

## Preconditions

Confirm the prompt explicitly calls for the study and that the core repository is available for read-only inspection. If access or authorization is ambiguous, ask before opening or running tools against it.

## Execution procedure

Identify authoritative sources and identity types. Distinguish factual truth, Knowledge, derived presentation, history, and persistence. Map supported domain state to World Exchange concepts; record unsupported concepts and authority questions. Propose a dedicated read-only adapter/projection boundary and document assumptions, evidence, and open questions in Simulation-External docs.

## Validation and expected output

Provide concrete source references, a mapping and gap summary, boundary proposal, and unresolved questions. Review the resulting External documentation for consistency and run `git diff --check`.

## Stop or escalate when

Core source authority is unclear, repository instructions prohibit the requested read, or resolution would require implementation or a canonical architecture decision. Report the blocker and evidence.

## Must not do

This is read-only: do not modify Simulation, create a worktree there, or run commands that write, build, test, or alter its Git state. Do not implement IPC, a runtime exporter, P12 persistence reading, or live mutation under this skill.
