---
name: release-validation
description: Validate a Simulation-External checkpoint with the repository's build, typecheck, test, lint, formatting, and Git checks.
---

# Release Validation

## Purpose and when to use

Use before declaring a durable implementation or documentation/tooling checkpoint complete.

## Required reading

Read `AGENTS.md`, `docs/EXTERNAL_SYSTEM_REFERENCE.md`, relevant package scripts, and any applicable feature skill.

## Preconditions

Record the commit under review and inspect `git status -sb`. Preserve unrelated user changes. Confirm the root scripts still match this workflow.

## Execution procedure

Run the applicable canonical commands from the repository root: `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, and `git diff --check`. Run the full set for a repository-wide checkpoint; for a narrow change, use judgment and state any omitted command. Inspect final working-tree status.

## Validation and expected output

Report exact commands, pass/fail results and test counts where available, known limitations, commit/tree validated, and whether the working tree is clean. Never infer success from old logs.

## Stop or escalate when

A command fails, required dependencies are unavailable, or validation would require an external service or repository permission. Report the concrete failure; request authorization only for the blocked external action.

## Must not do

Do not claim unrun checks, silently suppress failures, discard unrelated changes, or treat a successful local commit as proof of remote durability.
