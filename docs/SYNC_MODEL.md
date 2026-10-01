# Obsidian Synchronization Model

## Content ownership

Generated notes have a narrow ownership boundary:

```markdown
---
simulation_id: person-001
simulation_type: person
schema_version: 1
---

# Person Name

<!-- simulation:generated:start -->
Generated Simulation content.
<!-- simulation:generated:end -->

## GM Notes

User-authored notes remain here.
```

The adapter owns only the values of `simulation_id`, `simulation_type`, and `schema_version` in frontmatter and the region strictly between the generated markers. Existing unrelated frontmatter keys/comments and every byte outside the owned region should be retained. If marker pairs are malformed or duplicated, synchronization should report a conflict and leave the note unchanged rather than guessing.

## Update behavior

The Markdown package is deterministic: the same exchange and mapping configuration produce the same generated block. Initial export creates folders and notes. A later synchronization regenerates the owned block and its three metadata values while preserving the user's surrounding content. It uses `simulation_id` to track identity, not the filename. User-created files are not removed or overwritten because of a name collision.

## Conflict philosophy

Simulation projection data is read-only in the initial integration. A changed generated block is expected and replaceable; user-authored content is not. If file ownership or markers cannot be determined safely, leave the file unchanged and surface a diagnostic. Do not silently overwrite manually authored sections. This model does not yet resolve edits back into Simulation.

## Future import direction

Controlled authoring/import is a separate future stage requiring explicit field ownership, conflict policy, validation, permissions, and a Simulation-side contract. There are no live mutation commands or bidirectional synchronization in this foundation.
