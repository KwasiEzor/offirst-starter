# Offirst Starter Improvement Plan

Updated: 2026-04-04
Owner: Codex review follow-up

## Goals

This plan is based on the latest code review and is ordered by production risk rather than UI polish.

1. Make sync behavior correct and recoverable.
2. Remove configuration that can break auth, caching, or quality gates in production.
3. Tighten App Router boundaries and reduce unnecessary client work.
4. Add the missing test coverage for the offline-first contract.

## Findings Driving This Plan

### Critical

- Incremental sync can miss records permanently when a document is created and then updated before a client pulls.
- Local dirty records can be overwritten during pull without any real timestamp-based reconciliation.

### High

- PWA runtime caching is too broad and can cache API and auth traffic.
- The lint command is broken with the current Next.js and flat ESLint setup.

### Medium

- The app shell is more client-heavy than necessary.
- The dashboard sync card is hardcoded and does not reflect live state.
- Sync coverage is mostly utility-level and does not exercise the real pull/push flow.

## Delivery Phases

### Phase 1: Stabilize the Current Architecture

Status: Partially complete

- [x] Save a review-driven plan in the repository.
- [x] Fix the lint command so CI and local checks are usable again.
- [x] Tighten PWA caching to avoid caching API, auth, and admin traffic.
- [x] Make client pull behavior upsert-safe so `updated` records are not dropped when missing locally.
- [x] Dedupe sync-log driven fetches and make pull behavior more defensive.
- [x] Fix App Router build blockers caused by build-time linting, `useSearchParams`, and auth-dependent prerendering.

### Phase 2: Correct the Sync Protocol

Status: In progress

- [x] Replace the current one-row-per-document sync log with append-only change events plus cursor-based incremental pulls.
- [x] Apply an explicit sync rule so dirty local rows are not overwritten during pull, and sync pushes before it pulls.
- [x] Persist and compare server and local update timestamps consistently.
- [x] Decide whether local-first edits should survive pull conflicts or whether the server must always win, then encode that in code and tests.

### Phase 3: Reduce Client-Side Surface Area

Status: Complete

- [x] Move as much of the authenticated shell back to server components as practical.
- [x] Keep only the database and sync boundaries client-side.
- [x] Remove redundant auth checks inside children already protected by the app layout.
- [x] Replace the hardcoded dashboard sync status with live data from sync state and local dirty counts.

### Phase 4: Test the Real Contract

Status: Complete

- [x] Add integration tests for pull and push route behavior.
- [x] Add tests for “create then update before pull”.
- [x] Add tests for missing-local-row upsert behavior.
- [x] Add tests for PWA/runtime caching exclusions where practical.

## Current Implementation Slice

The first implementation pass is intentionally narrow:

1. Restore a working lint command.
2. Remove the risky broad cache rule from the PWA configuration.
3. Harden sync application logic so server updates upsert locally instead of being ignored.

This improves production safety immediately without forcing a full sync protocol redesign in one change.

## Current Implementation Slice 2

The second implementation pass hardens the sync protocol itself:

1. Convert server sync logging from one-row-per-document to append-only events.
2. Move incremental sync from timestamp-only pulls to event-ID cursoring.
3. Preserve local dirty records during pull instead of overwriting them.
4. Persist server update timestamps locally and reject stale pushes instead of overwriting newer server edits.
5. Add tests around sync cursor parsing, timestamp conflict checks, and event reduction behavior.
6. Add route-level tests for pull compaction and push conflict rejection.
7. Add client-side sync helper coverage for missing-local-row upserts and dirty-row preservation.
8. Remove the extra client-side user context so only database and sync boundaries stay on the client.
9. Add regression coverage for the PWA runtime caching allowlist.
