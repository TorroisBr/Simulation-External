---
name: simulation-reference-mirror
description: Safely maintain and use the disposable local Simulation reference mirror for authorized read-only source studies.
---

# Simulation Reference Mirror

## Purpose and when to use

Use before any authorized study that reads Simulation source. This workflow keeps source inspection on an isolated local clone and prevents publication from that clone. It does not authorize a source study by itself.

## Required reading

Read Simulation-External `AGENTS.md`, `docs/EXTERNAL_SYSTEM_REFERENCE.md`, and `docs/SIMULATION_REFERENCE_MIRROR.md`. For an integration study, also follow `simulation-integration-study`. At the selected Simulation ref, read its `AGENTS.md` and relevant architecture/phase documents before source files.

## Authority and safety rules

- Use only `.references/Simulation`; do not access the sibling Simulation checkout for source or Git operations.
- Treat Simulation's documented architecture and the exact selected canonical refs as authority. Never assume `origin/main` is canonical. Record commit IDs and distinguish architecture baselines from promoted phase state.
- Keep the mirror ignored and local. Never add it, its contents, a submodule, or a dependency to Simulation-External.
- Never push, publish, create a remote branch, or remove the mirror's push protections. The pre-push hook and reserved `.invalid` push URL are local safeguards, not permission to attempt publication.
- Do not reset, clean, delete, replace, or automatically stash a mirror with local edits or experiments. Inspect and preserve its state.
- Reading Simulation sources is allowed only when the active task explicitly requests or requires an authorized study. The mirror does not authorize builds, tests, runtime access, persistence consumption, or edits to Simulation source.

## Preconditions and refresh procedure

1. Confirm the working directory is Simulation-External and `.references/Simulation` exists. If absent, use the no-checkout clone command in `docs/SIMULATION_REFERENCE_MIRROR.md`.
2. Inspect `git status --short --branch`, `remote get-url origin`, `remote get-url --push origin`, and `rev-parse --path-format=absolute --git-path hooks/pre-push`. Confirm the fetch origin is the expected Simulation repository, publication URL uses `.invalid`, and `git hook run pre-push` prints the rejection and exits with status 1. Never test with `git push`.
3. If there are local edits or experiments, inspect them and preserve them. Do not continue with a checkout that would overwrite uncommitted files.
4. Fetch with `git fetch --all --prune`; this refreshes remote-tracking refs and prunes stale remote-tracking refs, without resetting local branches or editing the worktree.
5. Find the canonical architecture and phase refs required by the study. Verify their commit IDs against the study's recorded baseline or current remote advertisements. Do not silently substitute `main` or a nearby branch.
6. Only when a clean worktree is needed, switch the mirror to the selected exact ref in detached mode. Record the resulting commit and inspect only relevant source/docs.

## Experiments and recovery

Local experiments in the mirror must be clearly named and must not be presented as canonical Simulation evidence. Do not commit study conclusions to a Simulation branch; record them in Simulation-External. If the mirror contains unexpected local-only commits or files, preserve them and report the state before any repair. If the remote, guard, or canonical refs cannot be verified, stop and document the blocker rather than falling back to the sibling checkout.

## Validation and expected output

Before and after mirror work, confirm `.references/Simulation` is ignored by Simulation-External Git, its origin and push protections remain configured, and the active canonical commit is known. After completing the External study, validate only the authorized External changes with the applicable review and release-validation workflows.

## Must not do

Do not modify Simulation files, create Simulation worktrees, remove or overwrite a dirty mirror, remove its publication guards, push from it, use it as a dependency, or treat a read projection as authoring/import. Do not use P12 save snapshots as projection input.
