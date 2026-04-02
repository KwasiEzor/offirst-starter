# =============================================================================
# offirst-starter Makefile
# =============================================================================

.PHONY: help dev build start lint format typecheck test test-e2e \
        db-up db-down db-logs db-reset db-migrate db-seed \
        clean install

# Default target
help:
	@echo "offirst-starter commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          Start development server"
	@echo "  make build        Build for production"
	@echo "  make start        Start production server"
	@echo "  make install      Install dependencies"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint         Run ESLint"
	@echo "  make format       Format code with Prettier"
	@echo "  make typecheck    Run TypeScript type checking"
	@echo "  make test         Run unit tests"
	@echo "  make test-e2e     Run E2E tests with Playwright"
	@echo ""
	@echo "Database:"
	@echo "  make db-up        Start PostgreSQL and MinIO containers"
	@echo "  make db-down      Stop containers"
	@echo "  make db-logs      View container logs"
	@echo "  make db-reset     Reset database (delete volumes)"
	@echo "  make db-migrate   Run Payload migrations"
	@echo "  make db-seed      Seed database with demo data"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean        Remove build artifacts and node_modules"

# -----------------------------------------------------------------------------
# Development
# -----------------------------------------------------------------------------

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

install:
	pnpm install

# -----------------------------------------------------------------------------
# Code Quality
# -----------------------------------------------------------------------------

lint:
	pnpm lint

format:
	pnpm format

typecheck:
	pnpm typecheck

test:
	pnpm test

test-e2e:
	pnpm test:e2e

# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------

db-up:
	docker compose up -d

db-down:
	docker compose down

db-logs:
	docker compose logs -f

db-reset:
	docker compose down -v
	docker compose up -d

db-migrate:
	pnpm db:migrate

db-seed:
	pnpm db:seed

# -----------------------------------------------------------------------------
# Cleanup
# -----------------------------------------------------------------------------

clean:
	rm -rf .next node_modules out coverage
