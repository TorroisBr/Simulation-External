# Simulation Reference Mirror

## Purpose and boundary

`.references/Simulation` is a disposable, local clone of `https://github.com/TorroisBr/Simulation.git` used only for authorized read-only source studies and clearly labeled local experiments. It is ignored by the Simulation-External Git repository. It is not a submodule, dependency, vendored source tree, or public integration contract. The real sibling Simulation checkout is not the source for future studies.

The clone is created without an automatic checkout so its default branch cannot be mistaken for the canonical architecture baseline. At initial setup, this workspace's mirror was explicitly detached at architecture baseline `c285466c355103d3637ac165246591b72eb7bda0`. It has a local pre-push hook that rejects publication and an origin push URL under the reserved `.invalid` domain. Fetching still uses the real origin URL. Do not remove either guard or push from this clone, including with `--no-verify` or an overridden URL.

## Authority and ref selection

Simulation branch names and commits are source evidence, not an invitation to infer that `main` is canonical. Select the exact architecture or promoted phase refs required by the active study, record their commit IDs in the External study, and inspect those refs explicitly. GitHub advertised the following refs when this mirror was initialized on 2026-10-01; verify current remote refs before relying on this inventory because branch names and availability can change.

| Ref                                               | Commit                                     |
| ------------------------------------------------- | ------------------------------------------ |
| `codex/architecture/multi-participant-activities` | `c285466c355103d3637ac165246591b72eb7bda0` |
| `codex/phase5/canonical`                          | `3c3a5a7fa5bac8f301b98ec92307eadb19af25ff` |
| `codex/phase6/canonical`                          | `77b139437407a92e52e08b40f885c8d1b606dee2` |
| `codex/phase7/canonical`                          | `1f4651e99db2c357dd3be3c6b9284d104379f706` |
| `codex/phase8/canonical`                          | `470667d37863384edadb3d93ef64d8004aff46a3` |
| `codex/phase9/canonical`                          | `82396ae7ffaf407fda278928da456b06dc5394d4` |
| `codex/phase10/canonical`                         | `252ad6b9a507f1c001c05a1e19c2546ebd0707a2` |
| `codex/phase11/canonical`                         | `308e24d0744112e8f2b741521b8b3e4acb51ebbf` |
| `codex/phase12/canonical`                         | `70bc1e50a7107a1489614a62f5f34694b6b52498` |
| `codex/phase14/canonical`                         | `4caecbbfb0464c965811402b3c11d8717605114a` |
| `codex/phase18/canonical`                         | `8ac2d7885ea1f00d544d88a64bf918a411934f7f` |
| `codex/phase20/canonical`                         | `7a81cc0ecbc511dd36c248ec62c7b20f7e477f53` |

The mirror is not a substitute for Simulation's own repository instructions. Before an authorized study, read `AGENTS.md` and the relevant canonical architecture, phase design, and state documents at the selected refs. Do not use P12 save or continuation structures as World Exchange sources.

## Refresh and inspect safely

Run commands from the Simulation-External root. First inspect the mirror and its protections:

```powershell
git -C .references/Simulation status --short --branch
git -C .references/Simulation remote get-url origin
git -C .references/Simulation remote get-url --push origin
git -C .references/Simulation rev-parse --path-format=absolute --git-path hooks/pre-push
```

The push URL must be `https://push-disabled.invalid/TorroisBr/Simulation.git`. Verify the hook without attempting publication by running `git -C .references/Simulation hook run pre-push`; the expected result is the rejection message and exit code 1.

If the mirror has uncommitted files or local experiments, inspect and preserve them. Do not reset, clean, delete, replace, or stash them automatically. Refresh only after confirming the state is understood:

```powershell
git -C .references/Simulation fetch --all --prune
git -C .references/Simulation branch --remotes
git -C .references/Simulation show --no-patch --format=fuller <canonical-ref>
```

Fetch updates remote-tracking refs; pruning removes only stale remote-tracking refs. It does not update a local branch or discard working-tree edits. Before inspecting source files, explicitly check out the chosen canonical ref in detached mode, after verifying the worktree is clean:

```powershell
git -C .references/Simulation switch --detach <canonical-ref-or-commit>
```

Local experiments may use clearly named local branches or commits in the mirror. Keep them local, identify them as experiments, and never use them as canonical source evidence. If a study needs multiple source baselines, record and inspect each exact ref. Avoid modifying or deleting the sibling Simulation checkout.

## Recovery and guard verification

If the mirror is missing, create it from the Simulation-External root with a no-checkout clone so no branch is implicitly selected:

```powershell
git clone --filter=blob:none --no-checkout --origin origin https://github.com/TorroisBr/Simulation.git .references/Simulation
$mirror = '.references/Simulation'
git -C $mirror remote set-url --push origin https://push-disabled.invalid/TorroisBr/Simulation.git
$hook = git -C $mirror rev-parse --path-format=absolute --git-path hooks/pre-push
$contents = "#!/bin/sh`n`necho 'Simulation reference mirror blocks remote publication.' >&2`nexit 1`n"
[System.IO.File]::WriteAllText($hook, $contents, [System.Text.Encoding]::ASCII)
git -C $mirror switch --detach c285466c355103d3637ac165246591b72eb7bda0
```

Then verify `.references/` is ignored, confirm fetch and push URLs, and run `git -C .references/Simulation hook run pre-push` to confirm the hook rejects. If an existing mirror's origin or protections differ, inspect and report the discrepancy before changing it. If existing local work may be overwritten or lost, stop and preserve it.

The hook is a local safeguard, not a reason to attempt a push. It can be bypassed by Git options or local reconfiguration; the `.invalid` push URL is a second guard. Never run a push as a test. Verify protection by checking the hook and local Git configuration, and, when needed, invoke the hook directly with a harmless test input.
