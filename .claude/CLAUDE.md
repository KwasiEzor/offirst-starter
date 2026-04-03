# CLAUDE.md — Mémoire persistante du projet offirst-starter

# Mis à jour automatiquement par Claude Code à chaque session

## ÉTAT DU PROJET

Statut : MVP COMPLET
Phase active : Toutes les phases terminées (1-8)
Dernière action : Phase 8 Finalisation terminée
Prochaine action : Tester avec make db-up && pnpm dev, puis publier sur GitHub

## DÉCISIONS D'ARCHITECTURE PRISES

### WatermelonDB

- Adaptateur : LokiJS (pas wa-sqlite — trop complexe pour le starter)
- Raison : LokiJS est stable, bien documenté, IndexedDB natif
- Pattern sync : pullChanges + pushChanges via /api/sync/[pull|push]
- Résolution conflits : server-wins (timestamp comparison)

### Auth

- Solution : Payload Auth intégrée (JWT)
- Raison : évite une dépendance externe, tout dans le même repo
- Token stocké : httpOnly cookie (pas localStorage)
- Refresh : automatique via Payload

### Base de données

- Runtime : @payloadcms/db-postgres (Drizzle under the hood)
- Table sync : `sync_log` ajoutée manuellement dans Payload (rawSQL migration)
- Schéma WMDB : généré depuis la config Payload via pnpm db:generate

### Styling

- shadcn/ui style : "new-york"
- Thème : CSS variables (light + dark natif avec next-themes)
- Police : Geist (Next.js native)

## DÉPENDANCES INSTALLÉES

### Production (installées)

- next@15.4.x (upgraded pour Payload 3.x)
- react@19.x + react-dom@19.x (upgraded pour Payload 3.x)
- payload@3.81.x + @payloadcms/next + @payloadcms/db-postgres + @payloadcms/ui
- @payloadcms/richtext-lexical
- drizzle-orm@0.44.x (peer de @payloadcms/db-postgres)
- sharp (image processing)
- graphql

### Production (installées suite)

- @nozbe/watermelondb@0.28.x
- @nozbe/with-observables@1.6.x
- rxjs@7.8.x

### Production (installées suite)

- @ducanh2912/next-pwa@10.x

### Production (à installer)

- zustand@4.x
- zod@3.x
- next-themes
- pino + pino-pretty (logger)
- geist (font)

### Dev (installées)

- typescript@5.x
- @types/react@19 + @types/react-dom@19 + @types/node
- eslint@8 + eslint-config-next@15 + @eslint/eslintrc + @eslint/js
- prettier + prettier-plugin-tailwindcss
- husky + lint-staged
- cross-env
- tailwindcss + postcss

### Dev (installées suite)

- vitest@4.x + @vitest/coverage-v8
- @vitejs/plugin-react@6.x
- @testing-library/react + @testing-library/dom + @testing-library/jest-dom
- jsdom@29.x
- @playwright/test@1.x
- tsx@4.x (TypeScript script runner)

## VARIABLES D'ENVIRONNEMENT REQUISES

DATABASE_URI # postgresql://user:pass@host:5432/db
PAYLOAD_SECRET # min 32 chars random string
NEXT_PUBLIC_APP_URL # https://ton-domaine.com
S3_BUCKET # optionnel — media uploads
S3_ACCESS_KEY # optionnel
S3_SECRET_KEY # optionnel
S3_ENDPOINT # optionnel — pour MinIO local

## PATTERNS À RÉUTILISER

### Créer une nouvelle collection Payload

```ts
// src/payload/collections/MaCollection.ts
import type { CollectionConfig } from 'payload'
import { trackChange, trackDelete } from '../hooks/trackChange'
import { authenticated } from '../access/authenticated'

export const MaCollection: CollectionConfig = {
  slug: 'ma-collection',
  admin: { useAsTitle: 'name' },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    // ... autres champs
  ],
  hooks: {
    afterChange: [trackChange('ma-collection')],
    afterDelete: [trackDelete('ma-collection')],
  },
}
```

### Créer un hook React avec WatermelonDB

```ts
// src/hooks/useMaCollection.ts
'use client'
import { useDatabase } from '@nozbe/watermelondb/react'
import { withObservables } from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import type MaCollection from '@/db/models/MaCollection'

export function useMaCollectionQuery(filters?: { userId?: string }) {
  const db = useDatabase()
  return db.collections
    .get('ma-collection')
    .query(
      ...(filters?.userId ? [Q.where('user_id', filters.userId)] : []),
      Q.sortBy('updated_at', Q.desc)
    )
}
```

### Écriture en base WatermelonDB

```ts
// Toujours dans db.write + db.batch pour les opérations multiples
await db.write(async () => {
  await db.batch(
    collection.prepareCreate(record => {
      record.name = 'valeur'
    })
  )
})
```

## PIÈGES CONNUS ET SOLUTIONS

### WatermelonDB "window is not defined"

Cause : import WMDB dans un Server Component
Fix : ajouter 'use client' ou dynamic import avec ssr:false

### Payload type error après ajout de champ

Cause : types/payload-types.ts pas régénéré
Fix : pnpm payload generate:types

### LokiJS persistence perdue au refresh

Cause : useIncrementalIndexedDB non activé
Fix : s'assurer que l'option est true dans LokiJSAdapter

### Build Vercel échoue sur WatermelonDB

Cause : serverExternalPackages manquant dans next.config
Fix : serverExternalPackages: ['@nozbe/watermelondb']

## COMMANDES UTILES

pnpm dev # démarrage dev (Next.js + Payload sur :3000)
pnpm build # build production
pnpm tsc --noEmit # type-check sans compiler
pnpm lint # ESLint
pnpm test # Vitest (watch mode)
pnpm test:e2e # Playwright
pnpm db:generate # Payload config → WMDB schema + models
pnpm db:migrate # Payload migrations
pnpm db:seed # données de démo
pnpm payload generate:types # régénérer les types Payload
