# Service Management API

Koa + Moleculer + Sequelize + TypeScript backend for managing appointment services with JWT authentication.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **HTTP**: Koa 3 with `@koa/router`, `@koa/cors`, `koa-bodyparser`
- **Microservices**: Moleculer (in-process, no transporter)
- **ORM**: Sequelize 6 (PostgreSQL in production, SQLite in-memory for tests)
- **Auth**: JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`)
- **Validation**: Joi
- **Logging**: Pino (via Moleculer)

## Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `NODE_ENV` | `development` | `development` / `test` / `production` |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `service_management` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | `default-secret` | JWT signing secret |
| `JWT_EXPIRES_IN` | `24h` | Token expiration |
| `RATE_LIMIT_DURATION` | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

## Scripts

```bash
npm run dev          # Start with nodemon (hot reload)
npm run build        # Compile TypeScript
npm start            # Run compiled JS
npm test             # Run all tests
npm run test:unit    # Unit tests only
npm run test:integration  # Integration tests only
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run db:migrate   # Run migrations
npm run db:seed      # Seed data
npm run db:reset     # Reset database (undo + migrate + seed)
```

## API Endpoints

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and get token |

### Services (public read, protected write)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/services` | No | List all services |
| `GET` | `/api/services/:id` | No | Get service by ID |
| `POST` | `/api/services` | Yes | Create service |
| `PUT` | `/api/services/:id` | Yes | Update service |
| `DELETE` | `/api/services/:id` | Yes | Soft-delete service |

### Authentication

Protected endpoints require `Authorization: Bearer <token>` header.

### Request/Response Examples

**Register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123","name":"John"}'
```

**Create Service**
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Haircut","price":500,"showTime":30}'
```

## Project Structure

```
src/
  config/          # App and database configuration
  models/          # Sequelize models (User, AppointmentService)
  repositories/    # Data access layer
  services/        # Moleculer service definitions
  controllers/     # Koa request handlers
  middlewares/     # Error handling, auth, validation, rate limit
  validators/      # Joi schemas
  utils/           # Password hashing, JWT helpers
  routes/          # Koa router definitions
  broker.ts        # Moleculer ServiceBroker
  app.ts           # Application entry point
tests/
  unit/            # Moleculer service tests (SQLite in-memory)
  integration/     # HTTP API tests via supertest
  helpers/         # Test setup utilities
migrations/        # Sequelize migrations
seeders/           # Seed data
```

## Testing

Tests use SQLite in-memory database (`NODE_ENV=test`).

```bash
npm test  # 31 tests (13 unit + 18 integration)
```

## Docker

```bash
docker-compose up -d  # Start PostgreSQL
npm run db:migrate
npm run dev
```
