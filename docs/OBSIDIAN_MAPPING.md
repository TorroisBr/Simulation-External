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
Relationships/
```

The world overview is stored under `World/`; entity notes live in top-level folders such as `People/` and `Cities/`. Filenames are deterministic encodings of stable entity IDs, so a display-name change does not move a note or strand its GM notes. Human-readable names remain in headings and wikilink aliases. `simulation_id` is the canonical identity. If an ID-derived path is already occupied by a note claiming another ID, synchronization reports a conflict and leaves the file unchanged; it never merges notes based on matching names.

## Frontmatter and links

Each generated note includes `simulation_id`, `simulation_world_id`, `simulation_type`, and `schema_version`. `simulation_id` is the entity's stable ID; `simulation_world_id` identifies the world namespace. Frontmatter is machine-readable and uses stable IDs for identity. Relationships render as Obsidian wikilinks to mapped entity paths where the referenced entity exists. Missing references should be omitted or rendered as plain unresolved IDs with a visible diagnostic; they must not create an unrelated note.

## Ownership

The adapter owns its four Simulation metadata keys and the content between `<!-- simulation-external:generated:start -->` and `<!-- simulation-external:generated:end -->`. It may carefully update those owned frontmatter values while preserving unrelated keys and comments. It does not own the title, prose outside the generated markers, GM Notes, or other user-authored vault content. See [Sync Model](SYNC_MODEL.md) for update behavior and conflict handling.

## Renames and collisions

Stable-ID filenames keep paths unchanged when display names change; synchronization updates the generated heading and links while retaining user sections. If multiple files claim the same ID, stop and report an ambiguity rather than choosing one. If an ID-derived path is occupied by a different ID, report the collision and leave the occupant untouched. Path cleanup must never delete user files automatically. A future multi-world vault mapping may add a world-ID namespace to these paths after its ownership behavior is specified.
