# World Exchange collection coverage — contract proposal

**Decision state:** independent design review passed; External implementation
is pending. No producer/runtime integration is authorized or implemented by
this document.

## Problem and contract ownership

World Exchange v1 requires nine entity arrays but has no declaration of whether
each array is a complete factual collection, known empty, unsupported by its
producer, or intentionally omitted from an artifact. The Stage D.1 pressure
review already records that an empty array must not be treated as proof that an
unsupported source has no entities. The current wire shape cannot enforce that
rule or give consumers a machine-readable way to follow it.

Collection coverage is a reusable World Exchange capability owned by
Simulation-External. It is not a Simulation runtime status, a P12 persistence
receipt, an app-specific display option, or an instruction to mutate or repair
the source.

## Proposed boundary

```text
approved factual source
        ↓
dedicated read-only projection adapter
        ↓
World Exchange v2 (facts + collection coverage)
        ↓
world-io / portable JSON
        ↓
Web / Obsidian / third-party consumers
```

The World Exchange contract describes only public entity data and the coverage
claim made for each entity collection in this artifact. It does not expose a
Simulation reader, Store, runtime class, Unity type, P12 field, or transport.
The required `world` object remains the single-world scope anchor; it is not a
collection and has no coverage-map entry. Coverage applies to the nine arrays.

### Artifact scope and source cut

A v2 artifact represents one whole World identified by `world.id`. Each
collection status concerns that full World scope, never a selected cohort,
query result, actor view, or convenient subset. `INCLUDED` and `KNOWN_EMPTY`
require a source authority that covers the complete collection in that World.
If a producer only has a partial collection, it must emit no rows for it and
choose `NOT_INCLUDED` or `UNSUPPORTED`; v2 deliberately cannot label a subset
as complete. The required World identity is always present in v2. If an
approved identity for the complete World is unavailable, no v2 artifact can be
formed.

Choose `UNSUPPORTED` only when the producer lacks full-collection capability;
choose `NOT_INCLUDED` only when a capable producer deliberately omits that
collection from this artifact. A failed, transient, or inconsistent read is
neither state and blocks export.

Claims for included current-state collections and any references between them
must come from one compatible, source-consistent read boundary for that same
World. A producer cannot combine individually coherent reads from different
worlds or incompatible logical boundaries and claim they are one complete
artifact. If it cannot prove a common cut, it must omit affected collections
or fail export. The JSON document is the artifact boundary, not a freshness
timestamp; consumers must not infer that an old file still matches current
state.

`HistoricalEvent` has a stricter prerequisite: v2 has no event-history window
or retention field, so its collection means the complete history recognized by
the producer's approved full-World history authority, not a selected time
range. A producer may use `INCLUDED` or `KNOWN_EMPTY` only when that history
authority defines and covers the complete set for the World. A partial history
window or unknown retention horizon must be `NOT_INCLUDED` or `UNSUPPORTED`
with an empty array. Adding an explicit history scope later requires a
separate contract review and versioned shape.

## Representation under review

Use a required top-level `collectionCoverage` object in schema version 2. Keep
all nine entity arrays required. Each key names one array and has exactly one
of these string values:

| State | Required array shape | Consumer meaning |
| --- | --- | --- |
| `INCLUDED` | One or more entities | This producer supports the collection and supplies its complete known entity set for this artifact's scope. Consumers may treat the supplied entity set as authoritative at that artifact boundary. |
| `KNOWN_EMPTY` | Empty array | The producer supports the collection and authoritatively knows there are zero entities in it at this artifact boundary. Consumers may conclude it is empty for this artifact. |
| `UNSUPPORTED` | Empty array | This producer lacks the capability to provide the complete collection. Consumers must not infer that the world has none. |
| `NOT_INCLUDED` | Empty array | A producer capable of providing the complete collection deliberately excludes it from this artifact. Consumers must not infer that the world has none. |

Every map key is required exactly once. Missing keys, unknown keys, null,
unknown status strings, and contradictory array/status pairs are invalid. In
particular, `INCLUDED` cannot use an empty array; `KNOWN_EMPTY` cannot contain
entities; `UNSUPPORTED` and `NOT_INCLUDED` cannot contain entities. A producer
with only a partial or unprojectable collection must not label it `INCLUDED`.
This v2 shape intentionally has no partial-subset state. A later need for
partial collection membership would require an explicit reviewed state and
consumer semantics.

Coverage is an assertion by the producer; schema validation can check that the
declaration is structurally consistent with the arrays, but cannot prove the
producer's authority or completeness. `INCLUDED` concerns the entity set for
the artifact's scope. It does not promise every optional attribute is known;
an absent optional field means the artifact makes no assertion for that field.
The artifact itself is the coverage boundary. This does not provide a freshness
timestamp or make a portable file current after it is produced.

### Alternatives considered

| Shape | Assessment |
| --- | --- |
| Make arrays optional | Rejected. It still overloads absence and provides no portable distinction between unsupported and intentionally omitted. |
| Add an optional coverage map to v1 | Rejected. Existing v1 readers can ignore it and continue reading `[]` as though it were empty; that does not safely change the meaning of the artifact for old consumers. It also makes missing coverage ambiguous for legacy documents. |
| Wrap each array in a typed envelope | Rejected for this change. It changes every collection access and reference index shape, producing more schema and consumer churn than necessary. |
| Required v2 `collectionCoverage` map beside the existing arrays | Proposed. It keeps entity data separate from metadata, is deterministic, validates the required states directly, and lets v1 retain its existing wire shape. |

## Schema-version and legacy policy

This proposal **requires schema-version evolution**. V1's required array shape
has no completeness meaning strong enough to add safe optional coverage in
place. V2 carries a required declaration; old readers that only support v1 must
reject version 2 instead of silently interpreting a partial artifact as an
empty world. Updated readers continue to accept v1 and v2.

For an existing v1 artifact, all nine collection coverages are
`LEGACY_UNKNOWN` to an updated consumer, whether an array is empty or
non-empty. The supplied rows remain available to display as rows, but v1 makes
no claim that their collection is exhaustive. An empty v1 array means only
“this artifact supplied no rows for this collection”; it does not mean
`KNOWN_EMPTY`. A reader/serializer must preserve v1 as v1 and must not infer or
write v2 statuses from array lengths. A v1 document containing the v2
`collectionCoverage` member is invalid; coverage semantics begin at v2.

There is no automatic v1-to-v2 migration. A producer may emit v2 only after it
can attest every status from an approved source/read boundary. If it cannot,
the artifact stays v1 or its v2 collection is explicitly `UNSUPPORTED` or
`NOT_INCLUDED` with an empty array. Transient `Unavailable`, failed capture,
or an inconsistent read is not `NOT_INCLUDED`; the producer must fail the
export and report the failure outside the artifact.

## Source-authority pressure from Simulation (read-only evidence)

The refreshed protected mirror is inspected at Phase 12 canonical
`6b30d86c3214a98603bea809154e2dc06047d6a3`. The approved architecture
baseline is `451340c56e9b676bf6ea43412bcb856b9ccde3de`, where §§91A–91B establish
durable `WorldId` direction and capability-scoped factual reads. The current
Phase 12 State records promoted WI-A, FR-B core, FR-B live, and FR-C; the last
one is the immutable `simulation.faction-truth/v1` capability.

This is study evidence, not a source contract for World Exchange:

- WI-A provides a stable `WorldId` in the canonical `world:<32 lowercase hex>`
  form. World Exchange can use it as scope identity after an approved adapter
  defines its public string mapping. Display labels, runtime instances, seeds,
  and filenames do not replace that identity.
- FR-C can return copied factual Faction records and current active
  affiliations inside FR-B's bounded selected daily-profile read cut. Its
  `Present`/zero, `Unsupported`, and `Unavailable` results are useful inputs,
  but no result alone proves v2 whole-World coverage. Before mapping a result to
  `KNOWN_EMPTY`, `INCLUDED`, or `UNSUPPORTED`, a future approved integration
  must confirm that the complete Faction authority belongs to the same
  `WorldId` and that the capture boundary is valid for the full World scope.
  `Unavailable` always blocks export; it cannot be recast as an omission.
- FR-C validates active Person endpoints but is not a Person collection
  reader. A `PersonId` used to validate an affiliation does not make the Person
  collection projectable. No person placeholders may be synthesized.
- FR-C does not establish whole-world collection coverage, project all
  World Exchange categories, produce historical records, or publish a World
  Exchange artifact. P12 is not an input format for this contract.

A representative future artifact could include the required World identity,
mark Factions `INCLUDED` or `KNOWN_EMPTY` only after the source-level
whole-World completeness and same-World read-cut checks above pass, and mark
other arrays `UNSUPPORTED` or `NOT_INCLUDED` according to that producer's
actual capability and artifact selection. Until those checks are part of an
approved producer contract, the Simulation evidence does not justify emitting
such an artifact. These are pressure-test examples, not statuses fixed by the
schema.

The existing World Exchange reference validator requires relationship IDs to
resolve inside the artifact. If People are not covered, an adapter cannot emit
Faction membership IDs that dangle to omitted Person rows; it must omit those
optional edges/fields or include People only when their own collection claim is
supportable. Collection coverage does not weaken reference validation or
authorize placeholder entities.

## Consumer requirements

- A v2 consumer distinguishes the four states above in list and empty-state
  behavior. In particular, `UNSUPPORTED` and `NOT_INCLUDED` are not shown as a
  factual zero, and no placeholder entity is created.
- A v1 consumer updated for v2 can still render supplied v1 rows but exposes
  that collection completeness is undeclared. It never interprets an empty v1
  array as `KNOWN_EMPTY`.
- Web may show the state in its navigation and empty views, but presentation
  strings do not become contract values.
- Markdown/Obsidian renders notes only for actual supplied entities. Empty
  `UNSUPPORTED`, `NOT_INCLUDED`, `KNOWN_EMPTY`, or legacy arrays create no
  entity notes. Sync does not delete notes merely because an artifact lacks a
  collection; generated/user-authored ownership rules remain unchanged.
- Portable I/O parses and serializes v1 and v2 without filling missing facts,
  upgrading legacy artifacts, or reordering entity arrays. Recursive object
  key sorting remains deterministic.

## Exact prerequisites for a real exporter

1. Simulation owners approve a producer-facing read contract and its supported
   profiles; External schema types and source implementation stay decoupled.
2. The adapter obtains the approved World identity and proves complete
   whole-World enumeration for every collection it marks `INCLUDED` or
   `KNOWN_EMPTY`, using one compatible source-consistent read boundary across
   included collections and their references. `Present([])` may support
   `KNOWN_EMPTY` only after that completeness/scope check; `Unsupported` may
   support `UNSUPPORTED` only when the absence is a capability fact;
   `Unavailable` blocks export.
3. The adapter defines deterministic, type-safe World Exchange ID mapping from
   stable domain IDs. Names, filenames, array position, and runtime object
   identity are excluded.
4. It chooses `NOT_INCLUDED` only for a deliberate artifact omission, not as a
   euphemism for failed/unstable reads. Unselected collections carry no rows.
5. It emits schema v2, preserves World Exchange reference validity, maps only
   approved factual fields, and omits Knowledge and presentation-derived
   information.
6. It has source-owner review, deterministic tests, coverage/contradiction
   tests, and a handoff documenting the exact source ref and data boundary. No
   IPC, REST, sockets, P12 snapshot consumption, mutation, or Mod API is
   implied.

## Open architecture questions

1. Should a later schema version expose a public as-of/freshness value or a
   bounded historical-history horizon? V2 is whole-World, has no time-window
   field, and must not invent a Simulation logical-day value.
2. Which stable-ID namespace/mapping is approved for each Simulation domain
   identity, especially if IDs are only unique within a world or across entity
   kinds? The External prototype's sample prefix is not a Simulation decision.
3. May affiliation edges be included only when the related Person collection
   is included, or should a future World Exchange version support documented
   external/partial references? V2 preserves current same-artifact reference
   validation.
4. Which Simulation facts should become shared optional World Exchange fields
   (for example source Faction properties not represented in the current
   contract)? They must not be tunneled through arbitrary metadata solely to
   avoid a separate domain review.
5. Should v1 support ever be retired? This proposal preserves read support and
   does not set a retirement date.
