---
name: simulation-integration-study
description: Conduct a read-only study of Simulation sources to propose a future World Exchange projection boundary without changing Simulation.
---

# Simulation Integration Study

## Purpose and when to use

Use only when an active request explicitly asks for a read-only investigation of the Simulation repository to design future projection integration.

## Required reading

Read this repository's `AGENTS.md`, `docs/EXTERNAL_SYSTEM_REFERENCE.md`, `docs/ARCHITECTURE.md`, `docs/WORLD_EXCHANGE.md`, relevant roadmap entries, and `.agents/skills/simulation-reference-mirror/SKILL.md`. Use the mirror workflow before source inspection. Read the core-repository instructions at the selected canonical ref.

## Preconditions

Confirm the prompt explicitly calls for the study and that `.references/Simulation` is available for read-only inspection. Never use the sibling Simulation checkout. If the mirror, source ref, or authorization is ambiguous, report the blocker instead of falling back to another checkout.

## Execution procedure

Identify authoritative sources and identity types. Distinguish factual truth, Knowledge, derived presentation, history, and persistence. Map supported domain state to World Exchange concepts; record unsupported concepts and authority questions. Propose a dedicated read-only adapter/projection boundary and document assumptions, evidence, and open questions in Simulation-External docs.

## Validation and expected output

Provide concrete source references, a mapping and gap summary, boundary proposal, and unresolved questions. Review the resulting External documentation for consistency and run `git diff --check`.

## Stop or escalate when

Core source authority is unclear, repository instructions prohibit the requested read, or resolution would require implementation or a canonical architecture decision. Report the blocker and evidence.

## Must not do

This is read-only: do not modify Simulation, create a worktree there, or run commands that write source files, build, test, or alter canonical Git state. Use only `.references/Simulation`, preserve its local work, and never publish from it. Do not implement IPC, a runtime exporter, P12 persistence reading, or live mutation under this skill.
