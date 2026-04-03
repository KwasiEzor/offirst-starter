# Offirst Starter

An offline-first Next.js starter template with WatermelonDB for local storage and Payload CMS for backend.

## Features

- **Offline-First Architecture** - Works offline with local IndexedDB storage
- **Automatic Sync** - Server-wins conflict resolution with background sync
- **Payload CMS** - Full-featured headless CMS with admin panel
- **PWA Ready** - Service worker with intelligent caching strategies
- **Type-Safe** - Full TypeScript support throughout
- **Modern Stack** - Next.js 15, React 19, Tailwind CSS

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Framework | Next.js 15 (App Router)           |
| UI        | React 19 + Tailwind CSS           |
| Local DB  | WatermelonDB + LokiJS (IndexedDB) |
| Backend   | Payload CMS 3.x                   |
| Database  | PostgreSQL (via Drizzle ORM)      |
| Auth      | Payload Auth (JWT)                |
| PWA       | next-pwa                          |
| Testing   | Vitest + Playwright               |

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for PostgreSQL)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/offirst-starter.git
cd offirst-starter

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start PostgreSQL
make db-up

# Run database migrations
pnpm db:migrate

# Seed demo data (optional)
pnpm db:seed

# Start development server
pnpm dev
```

Visit:

- **App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### Default Admin Account

After seeding, you can login with:

- Email: `admin@example.com`
- Password: `admin123`

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (app)/           # Authenticated app routes
│   ├── (auth)/          # Auth pages (login, register)
│   ├── admin/           # Payload admin panel
│   └── api/             # API routes
├── components/
│   ├── layout/          # App shell, header, sidebar
│   └── providers/       # React context providers
├── db/                   # WatermelonDB
│   ├── models/          # Database models
│   ├── schema.ts        # Database schema
│   └── index.ts         # Database instance
├── hooks/               # React hooks
├── lib/                 # Utilities
│   ├── auth.ts          # Auth helpers
│   ├── payload.ts       # Payload client
│   └── sync-utils.ts    # Sync utilities
└── payload/             # Payload CMS
    ├── collections/     # Content types
    ├── access/          # Access control
    └── hooks/           # Database hooks
```

## Architecture

### Offline-First Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React App     │────▶│   WatermelonDB   │────▶│    IndexedDB    │
│  (Components)   │◀────│    (LokiJS)      │◀────│  (Persistent)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │                       │ Sync
         │                       ▼
         │              ┌──────────────────┐
         │              │   Sync Engine    │
         │              │  (server-wins)   │
         │              └──────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐     ┌─────────────────┐
         └─────────────▶│   Payload CMS    │────▶│   PostgreSQL    │
                        │   (/api/sync)    │◀────│                 │
                        └──────────────────┘     └─────────────────┘
```

### Sync Strategy

- **Pull**: Fetch changes from `sync_log` table since last sync
- **Push**: Send dirty records to server, receive server versions
- **Conflict Resolution**: Server-wins based on timestamp comparison

## Development

### Commands

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm start            # Start production server
pnpm typecheck        # Type check
pnpm lint             # Lint code
pnpm test             # Run unit tests (watch)
pnpm test:run         # Run unit tests (once)
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run E2E tests
pnpm db:migrate       # Run database migrations
pnpm payload generate:types  # Regenerate Payload types
```

### Makefile

```bash
make dev              # Start dev with Docker services
make db-up            # Start PostgreSQL
make db-down          # Stop PostgreSQL
make db-reset         # Reset database
make build            # Production build
```

### Adding a New Collection

1. Create Payload collection in `src/payload/collections/`
2. Add to `payload.config.ts`
3. Create WatermelonDB model in `src/db/models/`
4. Update `src/db/schema.ts`
5. Add sync transformer in `src/lib/sync-utils.ts`
6. Run `pnpm payload generate:types`

## Environment Variables

```bash
# Database (required)
DATABASE_URI=postgresql://user:pass@localhost:5432/offirst

# Payload (required)
PAYLOAD_SECRET=your-secret-min-32-chars

# App URL (required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# S3 Storage (optional)
S3_BUCKET=your-bucket
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_ENDPOINT=https://s3.amazonaws.com
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard.

### Docker

```bash
# Build image
docker build -t offirst-app .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Railway

Click the button below to deploy:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/offirst)

## Testing

### Unit Tests

```bash
pnpm test           # Watch mode
pnpm test:run       # Single run
pnpm test:coverage  # With coverage
```

### E2E Tests

```bash
# Install Playwright browsers (first time)
pnpm exec playwright install

# Run tests
pnpm test:e2e

# Run with UI
pnpm exec playwright test --ui
```

## PWA

The app is PWA-ready with:

- Offline caching via service worker
- Add to home screen prompt
- Background sync (when online)

Test offline:

1. Run `pnpm build && pnpm start`
2. Open Chrome DevTools → Network → Offline
3. App should work with cached data

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.
