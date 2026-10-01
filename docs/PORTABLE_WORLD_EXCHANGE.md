# Portable World Exchange

## Purpose and boundary

Portable World Exchange makes a validated World Exchange v1 document usable
outside the bundled fixture. It is an External-owned transport artifact for
independent consumers. The current producer is still fixture/project data; no
Simulation exporter or Simulation connection is implemented.

```text
Simulation domain/runtime (future, coordinated exporter)
                    ↓
             World Exchange v1
                    ↓
             `world-io` JSON
                    ↓
       local `*.world.json` artifact
              ↙             ↘
       Web Explorer       Obsidian
```

`packages/world-schema` remains the only authority for World Exchange entity
definitions and validation. `packages/world-io` owns parsing, validation
entry-points, and deterministic serialization; it does not define entities,
map domain data, or depend on a consumer. The fixture, the External-only
projection prototype, and a portable file all enter consumer code as the same
`WorldExchange` value.

The artifact is a read projection that may be stale relative to its source. It
is not a Simulation save, P12 persistence or continuation artifact, the
authoritative mutable world database, internal runtime state, or an
Obsidian-authored canonical source. Reading it in a consumer does not authorize
editing it back into Simulation. Read projection and future authoring/import
are separate architecture stages.

## File convention and compatibility

- Use the explicit `*.world.json` suffix. The file is ordinary JSON, not a
  binary or compressed format.
- Encode files as UTF-8. The JSON root is the normal World Exchange document,
  including its existing `schemaVersion`; there is no storage envelope or
  second disk schema.
- `world-io` supports the current v1 contract through `world-schema`. It
  rejects unsupported versions. A future schema change must follow the
  compatibility and versioning policy in [World Exchange v1](WORLD_EXCHANGE.md).
- The required stable `world.id` is validated as supplied. The loader does not
  synthesize it. `world.name` and entity display names remain optional under
  the v1 rules.
- Parsing and serialization do not repair, rename, infer, or discard domain
  values. Schema validation reports invalid payloads and unresolved IDs.

## `world-io` behavior

The public package API provides:

- `parseWorldExchange(string | Uint8Array | ArrayBuffer)` for decoding UTF-8,
  parsing JSON, then validating the resulting unknown value with
  `world-schema`;
- `validateWorldExchange(unknown)` as a direct pass-through to the canonical
  schema validator;
- `serializeWorldExchange(unknown)` for validating and producing JSON.

Invalid byte encoding or JSON raises `WorldExchangeParseError`. Schema issues,
including an unsupported schema version, missing World ID, blank optional
label, duplicate ID, or dangling reference, raise
`WorldExchangeValidationError` with the schema issues. Invalid values passed
to serialization are rejected by the same validation; serialization failures
are surfaced as `WorldExchangeSerializationError`. No malformed input is
silently repaired.

Serialization sorts object keys recursively by key, preserves array order,
uses two-space indentation, and appends one final line feed. Arrays are not
sorted because their order may carry source or consumer meaning and there is
no general domain-ordering rule established by v1. The serializer adds no
timestamps, IDs, labels, or consumer-specific transforms. Repeated
serialization of the same logical value yields identical bytes; changing an
array's order intentionally changes output. Parsing preserves stable ID values
exactly. HistoricalEvent records are serialized as supplied; current entity
state is not used to invent or rewrite historical events.

## Consumer flows

### Web Explorer

The Web app retains its bundled demo fixture and offers a local file picker
that accepts `.world.json` and JSON files. Selected bytes go through
`parseWorldExchange`; successful data replaces the active exchange and uses
the existing navigation, search, relationship, and history path. The app
keeps the current exchange active and displays an error if loading fails. A
successful file remains in the browser session only: there is no upload or
backend, and the file is not written back.

### Obsidian

The **Import World Exchange file to Markdown notes** command selects a local
file, validates it through `world-io`, and passes the exchange to the existing
`world-markdown` synchronization path. The bundled-fixture command remains
available. Both paths share stable-ID filenames, frontmatter ownership,
generated-region updates, and conflict checks. User-authored text outside
owned fields/markers is preserved; an identity conflict blocks the write. The
plugin does not watch files, upload them, or write them back to Simulation.

See [Obsidian Mapping](OBSIDIAN_MAPPING.md) and [Sync Model](SYNC_MODEL.md) for
vault ownership and conflict semantics.

## Source authority and limitations

The JSON document expresses facts selected by its producer at export time;
the file itself does not establish their authority or freshness. Consumers
must not infer Simulation truth from file names, display names, ordering, or
presentation values. Actor-specific Knowledge, if a future exchange chooses
to represent it, must remain explicitly actor-scoped and must never be
promoted to factual world truth by this loader. V1 does not establish a
Simulation Knowledge projection contract.

The portable artifact does not solve missing or unstable Simulation identity,
source ownership, disputed domain authority, event-history provenance, or
unsupported concepts. It only verifies conformance to the current public
World Exchange schema. A complete-looking fixture is not evidence that a real
Simulation source can safely populate every field.

## Prerequisites for a real exporter

Before a Simulation exporter is implemented, the integration must have:

1. A reviewed Simulation-owned or Simulation-approved read-only source
   contract and named authorities for each exported fact.
2. An approved, stable World identity source; the exporter may not fabricate
   the required `world.id`.
3. A field-level mapping from authoritative domain state to World Exchange v1,
   including omission rules for unsupported, ambiguous, private, or
   actor-specific data.
4. An explicit distinction between present factual state, historical/event
   records, derived/presentation fields, and actor Knowledge.
5. Stable ID mappings and reference-resolution rules that do not use names,
   filenames, array positions, Unity object identity, or persistence details.
6. An agreed snapshot/read-consistency model and freshness/provenance policy
   for an export operation.
7. A compatibility and validation plan, representative conformance data, and
   tests coordinated with Simulation architecture owners.
8. A separately reviewed publication/transport decision. This file support
   does not authorize IPC, REST, sockets, live synchronization, runtime
   mutation, P12 snapshot consumption, or Mod API behavior.

Open Simulation-side authority and mapping decisions remain integration
questions; External must not fill gaps by inventing Simulation contracts.
Before a real exporter can proceed, Simulation architecture owners must also
resolve the World identity source, field-level authority/omission rules,
historical event provenance, actor-Knowledge ownership, and export consistency
model.
