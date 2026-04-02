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

## PHASE 5 — Auth & Layout

[ ] src/lib/auth.ts (getPayloadUser, requireAuth)
[ ] src/app/(auth)/login/page.tsx
[ ] src/app/(auth)/register/page.tsx (optionnel)
[ ] src/app/(app)/layout.tsx (guard auth)
[ ] src/components/layout/AppShell.tsx
[ ] src/components/layout/Sidebar.tsx
[ ] src/components/layout/Header.tsx
[ ] src/app/(app)/dashboard/page.tsx (demo)
[ ] Test : redirect si non auth, dashboard accessible si auth

## PHASE 6 — PWA

[ ] public/manifest.json
[ ] public/icons/icon-192.png + icon-512.png
[ ] Meta tags dans app/layout.tsx
[ ] next-pwa configuration dans next.config.mjs
[ ] Test offline : Chrome DevTools → Network: Offline → app fonctionne

## PHASE 7 — Tests

[ ] vitest.config.ts
[ ] src/**/**tests**/db.test.ts (sync logic)
[ ] src/**/**tests**/models.test.ts
[ ] playwright.config.ts
[ ] e2e/login.spec.ts
[ ] e2e/dashboard.spec.ts
[ ] e2e/offline.spec.ts (service worker mock)

## PHASE 8 — Finalisation

[ ] README.md complet (setup + usage + déploiement)
[ ] CONTRIBUTING.md
[ ] Dockerfile (multi-stage, image optimisée)
[ ] docker-compose.prod.yml
[ ] vercel.json
[ ] railway.json
[ ] scripts/seed.ts (données démo)
[ ] Test build prod complet : pnpm build → 0 erreur
[ ] Publier sur GitHub comme template

## BACKLOG (post-MVP)

[ ] CLI create-offirst-app (npm package)
[ ] Templates métier : blog, SaaS, marketplace
[ ] Support Expo (React Native) avec même sync engine
[ ] Storybook pour les composants UI
[ ] Monitoring : Sentry + Axiom
[ ] Rate limiting sur les routes de sync
[ ] WebSockets pour sync temps-réel (Payload realtime)
