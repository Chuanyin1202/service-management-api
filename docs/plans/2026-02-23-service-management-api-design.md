# Service Management API - Design Document

Date: 2026-02-23

## Overview

A minimal viable service management backend system with JWT authentication and service CRUD operations. Built with TypeScript + Koa + Moleculer + Sequelize + PostgreSQL.

## Architecture

**Koa + Moleculer Hybrid:**
- Koa handles HTTP layer (routing, middleware, request/response)
- Moleculer handles business logic layer (service actions)
- Sequelize handles data access layer (models, repositories)

```
HTTP Request
  → Koa Middleware (rate limit → error handler → CORS)
    → Koa Router
      → Controller (Joi validation → JWT check if needed)
        → broker.call('service.action', params)
          → Moleculer Service Action
            → Repository (Sequelize query)
              → PostgreSQL
```

## Project Structure

```
service-management-api/
├── src/
│   ├── config/           # Environment config (database, jwt, app)
│   ├── controllers/      # Koa route handlers → call Moleculer actions
│   ├── middlewares/       # JWT auth, error handler, rate limit, joi validation
│   ├── models/           # Sequelize models (User, AppointmentService)
│   ├── repositories/     # Data access layer (wraps Sequelize queries)
│   ├── routes/           # Koa router definitions
│   ├── services/         # Moleculer services (auth.service, appointment.service)
│   ├── utils/            # Helpers (password hash, jwt sign/verify)
│   ├── validators/       # Joi schemas
│   ├── broker.ts         # Moleculer ServiceBroker initialization
│   └── app.ts            # Koa app init + startup
├── migrations/           # Sequelize migrations
├── seeders/              # Sequelize seed data
├── tests/
│   ├── unit/             # Service business logic unit tests
│   └── integration/      # API endpoint integration tests (supertest)
├── docker-compose.yml    # PostgreSQL
├── .sequelizerc          # Sequelize CLI config
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── jest.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Database Schema

### Users
- id: UUID PK
- email: VARCHAR(255) NOT NULL UNIQUE
- password: VARCHAR(255) NOT NULL (bcrypt hashed)
- name: VARCHAR(255) NOT NULL
- createdAt, updatedAt: TIMESTAMPTZ

### AppointmentServices
- id: UUID PK
- name: VARCHAR(255) NOT NULL
- description: TEXT
- price: INTEGER NOT NULL
- showTime: INTEGER
- order: INTEGER DEFAULT 0
- isRemove: BOOLEAN DEFAULT false
- isPublic: BOOLEAN DEFAULT true
- ShopId: UUID (nullable, for future multi-shop)
- createdAt, updatedAt: TIMESTAMPTZ
- INDEX on ShopId

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register (email, password, name) |
| POST | /api/auth/login | No | Login (returns JWT) |
| GET | /api/services | No | List services (public, excludes isRemove) |
| GET | /api/services/:id | No | Get single service (public) |
| POST | /api/services | JWT | Create service |
| PUT | /api/services/:id | JWT | Update service |
| DELETE | /api/services/:id | JWT | Soft delete (isRemove=true) |

## Response Format

Success: `{ "data": ... }`
Error: `{ "error": { "code": "xxx", "message": "..." } }`

## Moleculer Services

### auth.service
- `auth.register` — validate email uniqueness → bcrypt hash → create user → return JWT
- `auth.login` — verify email/password → return JWT

### appointment.service
- `appointment.list` — query isRemove=false, ordered by `order` field
- `appointment.get` — get by ID, exclude isRemove=true
- `appointment.create` — create with auto UUID
- `appointment.update` — update specified fields
- `appointment.delete` — soft delete (isRemove=true)

## Security

- Password hashing: bcrypt (salt rounds: 10)
- JWT: jsonwebtoken, expiry configurable via .env (default 24h)
- Joi validation: per-endpoint schemas in validators/
- Centralized error handling: Koa middleware, no stack traces exposed
- Rate limiting: koa-ratelimit (memory store)
- Logging: Moleculer built-in pino logger

## Testing Strategy

### Unit Tests (tests/unit/)
- auth.service.test.ts — register/login logic, password verification
- appointment.service.test.ts — CRUD business logic, soft delete

### Integration Tests (tests/integration/)
- auth.test.ts — register success/fail, login success/fail, duplicate email
- services.test.ts — public queries, JWT-protected CUD, unauthenticated access rejected
- Uses supertest against Koa app, SQLite in-memory for test DB

## Deployment

- Local: docker-compose up -d → npm run db:migrate → npm run dev
- Zeabur: GitHub repo → PostgreSQL addon → env vars → auto deploy
- CI/CD: npm test (SQLite in-memory, no external DB needed)

## Tech Stack Summary

| Category | Technology |
|----------|-----------|
| Language | TypeScript |
| Web Framework | Koa |
| Microservice | Moleculer |
| ORM | Sequelize |
| Database | PostgreSQL (prod), SQLite (test) |
| Validation | Joi |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Testing | Jest + supertest |
| Linting | ESLint + Prettier |
| Rate Limit | koa-ratelimit |
| Logging | Moleculer/pino |
