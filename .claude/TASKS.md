# TASKS.md — Plan d'exécution offirst-starter

# Format : [ ] todo | [>] en cours | [x] done | [!] bloqué

## PHASE 1 — Bootstrap ✓

[x] Init Next.js 14 (pnpm create next-app)
[x] tsconfig.json strict + paths aliases
[x] next.config.mjs (Payload plugin + PWA + WMDB externals)
[x] ESLint flat config (eslint.config.mjs)
[x] Prettier (.prettierrc)
[x] Husky + lint-staged (pre-commit hooks)
[x] docker-compose.yml (Postgres 16 + MinIO)
[x] .env.example documenté
[x] Makefile (commandes raccourcies)
[x] Vérification : pnpm tsc --noEmit → 0 erreurs

## PHASE 2 — Payload CMS ✓

[x] Installation payload + adaptateurs (Next.js 15 + React 19)
[x] payload.config.ts (config de base)
[x] src/payload/access/authenticated.ts
[x] src/payload/access/adminOnly.ts
[x] src/payload/collections/Users.ts (auth + roles)
[x] src/payload/collections/Media.ts (S3 upload)
[x] src/payload/collections/Categories.ts
[x] src/payload/collections/Posts.ts (richtext + hooks)
[x] src/payload/hooks/trackChange.ts (sync log)
[x] src/payload/hooks/trackDelete.ts
[x] Migration SQL : création table sync_log
[>] Test : accès /admin → login fonctionnel (à tester avec make db-up && make dev)

## PHASE 3 — WatermelonDB ✓

[x] src/db/index.ts (singleton getDatabase avec LokiJS)
[x] src/db/schema.ts (tables: categories, posts, post_categories)
[x] src/db/models/\*.ts (Category, Post, PostCategory)
[x] src/db/migrations.ts (v1 initiale)
[x] src/components/providers/DatabaseProvider.tsx (SSR-safe)
[x] src/hooks/useCategories.ts + usePosts.ts
[x] tsconfig.json (experimentalDecorators activé)
[x] pnpm typecheck → 0 erreurs

## PHASE 4 — Sync Engine ✓

[x] src/lib/sync-utils.ts (types, transformers, server-wins resolution)
[x] src/lib/payload.ts (getPayloadClient helper)
[x] src/app/api/sync/pull/route.ts
[x] src/app/api/sync/push/route.ts
[x] src/app/api/health/route.ts
[x] src/components/providers/SyncProvider.tsx (auto-sync, reconnect)
[x] src/hooks/useSync.ts (pull, push, sync, online detection)
[x] pnpm typecheck → 0 erreurs

## PHASE 5 — Auth & Layout ✓

[x] src/lib/auth.ts (getPayloadUser, requireAuth, login, logout, register)
[x] src/app/(auth)/login/page.tsx
[x] src/app/(auth)/register/page.tsx
[x] src/app/(app)/layout.tsx (guard auth)
[x] src/components/layout/AppShell.tsx
[x] src/components/layout/Sidebar.tsx
[x] src/components/layout/Header.tsx
[x] src/app/(app)/dashboard/page.tsx (demo)
[x] pnpm typecheck → 0 erreurs
[>] Test : redirect si non auth, dashboard accessible si auth (à tester avec make db-up && make dev)

## PHASE 6 — PWA ✓

[x] public/manifest.json
[x] public/icons/icon-192.png + icon-512.png
[x] Meta tags dans app/layout.tsx (Metadata + Viewport)
[x] next-pwa configuration dans next.config.mjs (runtimeCaching strategies)
[x] .gitignore pour fichiers générés (sw.js, workbox-\*.js)
[x] pnpm typecheck → 0 erreurs
[>] Test offline : Chrome DevTools → Network: Offline → app fonctionne (à tester avec make build && make start)

## PHASE 7 — Tests ✓

[x] vitest.config.ts + vitest.setup.ts
[x] src/lib/**tests**/sync-utils.test.ts (20 tests)
[x] @vitejs/plugin-react + testing libraries
[x] playwright.config.ts (multi-browser)
[x] e2e/auth.spec.ts (login/register flow)
[x] e2e/home.spec.ts (redirects, PWA manifest)
[x] pnpm typecheck → 0 erreurs
[>] Run e2e tests avec make db-up && pnpm test:e2e

## PHASE 8 — Finalisation ✓

[x] README.md complet (setup + architecture + deployment)
[x] Dockerfile (multi-stage, standalone output)
[x] docker-compose.prod.yml (app + postgres)
[x] next.config.mjs (output: 'standalone')
[x] scripts/seed.ts (admin + categories + posts demo)
[x] pnpm typecheck → 0 erreurs
[>] Test build prod complet : pnpm build (requires DATABASE_URI)
[ ] vercel.json (optionnel)
[ ] railway.json (optionnel)
[ ] CONTRIBUTING.md (optionnel)
[ ] Publier sur GitHub comme template

## BACKLOG (post-MVP)

[ ] CLI create-offirst-app (npm package)
[ ] Templates métier : blog, SaaS, marketplace
[ ] Support Expo (React Native) avec même sync engine
[ ] Storybook pour les composants UI
[ ] Monitoring : Sentry + Axiom
[ ] Rate limiting sur les routes de sync
[ ] WebSockets pour sync temps-réel (Payload realtime)
