# World Exchange collection coverage — design review record

**Reviewed baseline:** `32ceb6ed223f51259ff230a96a5056d60eb66ea1`
**Review date:** 2026-10-02
**Scope:** design proposal in `WORLD_EXCHANGE_COLLECTION_COVERAGE.md`; no
implementation, tests, or Simulation changes were part of this review.

## Review outcome

An independent read-only architecture/schema review passed the revised design
for implementation. The reviewer confirmed that schema v2 is scoped to one
whole World identified by `world.id`, that partial collections cannot claim
completeness, that included data must share a compatible source-consistent
cut, and that complete HistoricalEvent coverage requires an approved
whole-World history authority. The review also found no conflict with the
existing versioning, portable I/O, and Stage D.1–D.3 decisions.

The reviewer requested one wording clarification: `UNSUPPORTED` must mean the
producer lacks full-collection capability, while `NOT_INCLUDED` must mean a
capable producer deliberately omitted that collection. The proposal now states
that distinction in both the state table and artifact-scope rules.

## Review sequence

1. Initial review: **FAIL** to begin implementation. Findings: artifact scope
   was not explicit, and a selected factual read did not establish whole-World
   collection coverage or a compatible cross-collection source cut.
2. Revision: v2 scope was constrained to one whole World; partial collections
   and incomplete history cannot claim inclusion or known-empty; included
   collections/references require a compatible source cut; Simulation's
   capability statuses are not themselves whole-World coverage evidence.
3. Independent recheck: **PASS** to begin schema and consumer implementation,
   subject to the wording clarification above.
4. Wording clarification applied: `UNSUPPORTED` is lack of full-collection
   capability; `NOT_INCLUDED` is deliberate omission by a capable producer.

This record documents a contract-design gate only. It is not a Simulation
source-owner approval, a runtime exporter authorization, or proof that any
Simulation collection can currently be projected.
