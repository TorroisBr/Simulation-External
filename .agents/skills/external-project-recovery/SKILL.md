---
name: external-project-recovery
description: Resume Simulation-External work in a new chat or environment by reconstructing repository and validation state without relying on stale conversation context.
---

# External Project Recovery

## Purpose and when to use

Use this workflow when resuming work in a new chat, environment, or after a context reset.

## Required reading

Read `AGENTS.md`, `docs/EXTERNAL_SYSTEM_REFERENCE.md`, the detailed docs for the relevant work, and the applicable skill under `.agents/skills/`.

## Preconditions

Confirm the current working directory is the Simulation-External repository. Inspect it before assuming old paths or branch names remain valid.

## Execution procedure

1. Inspect `git status -sb`, the current branch and commit, local branches, and recent history. Identify upstream/tracking state and any local-only commits when that information is available.
2. Inspect the current package/app structure and read the required project docs.
3. Check any recorded validation against the current commit; rerun relevant commands when the state or evidence is unclear.
4. Reconstruct completed roadmap stages, active work, and open boundaries from files and Git state. Use conversation history only as supplemental context.
5. Continue the requested task while preserving existing user changes.

## Validation and expected output

Report the current branch/commit, working-tree state, relevant local-only work, completed and pending validation, and the next action needed for the active objective.

## Stop or escalate when

The repository identity is uncertain, a required path is inaccessible, or local changes conflict with the requested work. Ask before destructive recovery or cross-repository actions.

## Must not do

Do not discard local changes, reset/rebase shared history, assume stale absolute paths, or claim local commits are remotely durable without checking the remote state.
