# Obsidian Mapping

## Vault layout

Generated notes are grouped by entity type under predictable folders:

```text
World/
People/
Cities/
Locations/
Organizations/
Institutions/
Factions/
Items/
History/
```

The world overview is stored under `World/`. Entity titles are human-readable filenames, sanitized for the host filesystem. A stable `simulation_id` frontmatter value is the identity; renames can therefore move or relabel a note without changing its entity identity. Filename collisions must be resolved deterministically, for example by appending a short stable-ID suffix. The plugin must not silently merge two entities because their display names match.

## Frontmatter and links

Each generated note includes `simulation_id`, `simulation_type`, and `schema_version`. Frontmatter is machine-readable and uses stable IDs for identity. Relationships render as Obsidian wikilinks to mapped entity paths where the referenced entity exists. Missing references should be omitted or rendered as plain unresolved IDs with a visible diagnostic; they must not create an unrelated note.

## Ownership

The adapter owns its three Simulation metadata keys and the content between `<!-- simulation:generated:start -->` and `<!-- simulation:generated:end -->`. It may carefully update those owned frontmatter values while preserving unrelated keys and comments. It does not own the title, prose outside the generated markers, GM Notes, or other user-authored vault content. See [Sync Model](SYNC_MODEL.md) for update behavior and conflict handling.

## Renames and collisions

Stable IDs remain fixed when names change. A future rename-aware sync should locate existing notes by `simulation_id`, then move/rename the same note while preserving user sections. If multiple files claim the same ID, stop and report an ambiguity rather than choosing one. If a file path is occupied by a different ID, append a deterministic short ID suffix and retain the original occupant. Path cleanup must never delete user files automatically.
