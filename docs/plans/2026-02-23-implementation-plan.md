# Service Management API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a minimal viable service management backend with JWT auth, service CRUD, Moleculer microservices, and full test coverage.

**Architecture:** Koa handles HTTP layer (routing, middleware). Moleculer handles business logic (service actions). Sequelize handles data access (repositories, models). PostgreSQL for production, SQLite in-memory for tests.

**Tech Stack:** TypeScript, Koa, Moleculer, Sequelize, PostgreSQL, Joi, Jest, bcryptjs, jsonwebtoken, ESLint/Prettier

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.eslintrc.js`
- Create: `.prettierrc`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `.env`
- Create: `docker-compose.yml`
- Create: `.sequelizerc`
- Create: `jest.config.ts`
- Create: `nodemon.json`

**Step 1: Initialize package.json**

```json
{
  "name": "service-management-api",
  "version": "1.0.0",
  "description": "Service management backend with JWT auth and Moleculer microservices",
  "main": "dist/app.js",
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/app.js",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:migrate:undo": "npx sequelize-cli db:migrate:undo:all",
    "db:seed": "npx sequelize-cli db:seed:all",
    "db:seed:undo": "npx sequelize-cli db:seed:undo:all",
    "db:reset": "npm run db:migrate:undo && npm run db:migrate && npm run db:seed",
    "test": "jest --forceExit --detectOpenHandles",
    "test:unit": "jest tests/unit --forceExit",
    "test:integration": "jest tests/integration --forceExit --detectOpenHandles",
    "lint": "eslint 'src/**/*.ts' 'tests/**/*.ts'",
    "lint:fix": "eslint 'src/**/*.ts' 'tests/**/*.ts' --fix",
    "format": "prettier --write 'src/**/*.ts' 'tests/**/*.ts'"
  },
  "keywords": ["koa", "moleculer", "sequelize", "typescript", "jwt"],
  "license": "MIT"
}
```

**Step 2: Install dependencies**

Run:
```bash
npm install koa @koa/router @koa/cors koa-bodyparser sequelize pg pg-hstore moleculer jsonwebtoken bcryptjs joi dotenv koa-ratelimit uuid pino
```

Run:
```bash
npm install -D typescript ts-node @types/node @types/koa @types/koa__router @types/koa__cors @types/koa-bodyparser @types/jsonwebtoken @types/bcryptjs @types/uuid jest ts-jest @types/jest supertest @types/supertest eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-prettier sequelize-cli sqlite3 nodemon
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 4: Create .eslintrc.js**

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    jest: true,
    es2020: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

**Step 5: Create .prettierrc**

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Step 6: Create .gitignore**

```
node_modules/
dist/
.env
*.sqlite
*.sqlite3
coverage/
.DS_Store
```

**Step 7: Create .env.example and .env**

`.env.example`:
```
# App
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=service_management
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Rate Limit
RATE_LIMIT_DURATION=60000
RATE_LIMIT_MAX=100
```

`.env` (copy same content for local dev):
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=service_management
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev-secret-key-do-not-use-in-prod
JWT_EXPIRES_IN=24h
RATE_LIMIT_DURATION=60000
RATE_LIMIT_MAX=100
```

**Step 8: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: service-mgmt-db
    environment:
      POSTGRES_DB: service_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Step 9: Create .sequelizerc**

```js
const path = require('path');

module.exports = {
  config: path.resolve('src', 'config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'migrations-path': path.resolve('migrations'),
  'seeders-path': path.resolve('seeders'),
};
```

**Step 10: Create jest.config.ts**

```ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/app.ts'],
  coverageDirectory: 'coverage',
  verbose: true,
};

export default config;
```

**Step 11: Create nodemon.json**

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/app.ts"
}
```

**Step 12: Create directory structure**

Run:
```bash
mkdir -p src/{config,controllers,middlewares,models,repositories,routes,services,utils,validators}
mkdir -p migrations seeders
mkdir -p tests/{unit,integration}
```

**Step 13: Commit**

```bash
git add -A
git commit -m "Initialize project scaffolding with TypeScript, ESLint, Prettier, Jest, Docker"
```

---

### Task 2: Configuration Module

**Files:**
- Create: `src/config/database.js` (JS for sequelize-cli compatibility)
- Create: `src/config/database.ts`
- Create: `src/config/app.ts`
- Create: `src/config/index.ts`

**Step 1: Create database config (JS for sequelize-cli)**

`src/config/database.js`:
```js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'service_management',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false,
  },
};
```

**Step 2: Create database config (TS for app)**

`src/config/database.ts`:
```ts
import { Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  development: Options;
  test: Options;
  production: Options;
}

const config: DatabaseConfig = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'service_management',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false,
  },
};

export default config;
```

**Step 3: Create app config**

`src/config/app.ts`:
```ts
import dotenv from 'dotenv';

dotenv.config();

export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  rateLimit: {
    duration: parseInt(process.env.RATE_LIMIT_DURATION || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
};
```

**Step 4: Create config index**

`src/config/index.ts`:
```ts
export { default as databaseConfig } from './database';
export { appConfig } from './app';
```

**Step 5: Commit**

```bash
git add src/config/
git commit -m "Add configuration module for database, app, and JWT settings"
```

---

### Task 3: Database Migrations

**Files:**
- Create: `migrations/20260223000001-create-users.js`
- Create: `migrations/20260223000002-create-appointment-services.js`

**Step 1: Create Users migration**

`migrations/20260223000001-create-users.js`:
```js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  },
};
```

**Step 2: Create AppointmentServices migration**

`migrations/20260223000002-create-appointment-services.js`:
```js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AppointmentServices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      showTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isRemove: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      ShopId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('AppointmentServices', ['ShopId'], {
      name: 'appointment_services__shop_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('AppointmentServices', 'appointment_services__shop_id');
    await queryInterface.dropTable('AppointmentServices');
  },
};
```

**Step 3: Commit**

```bash
git add migrations/
git commit -m "Add database migrations for Users and AppointmentServices tables"
```

---

### Task 4: Sequelize Models

**Files:**
- Create: `src/models/User.ts`
- Create: `src/models/AppointmentService.ts`
- Create: `src/models/index.ts`

**Step 1: Create User model**

`src/models/User.ts`:
```ts
import { Model, DataTypes, Sequelize } from 'sequelize';

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'Users',
        timestamps: true,
      },
    );
    return User;
  }
}
```

**Step 2: Create AppointmentService model**

`src/models/AppointmentService.ts`:
```ts
import { Model, DataTypes, Sequelize } from 'sequelize';

export interface AppointmentServiceAttributes {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  showTime?: number | null;
  order?: number;
  isRemove?: boolean;
  isPublic?: boolean;
  ShopId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentServiceCreationAttributes
  extends Omit<AppointmentServiceAttributes, 'id' | 'order' | 'isRemove' | 'isPublic' | 'createdAt' | 'updatedAt'> {}

export class AppointmentService
  extends Model<AppointmentServiceAttributes, AppointmentServiceCreationAttributes>
  implements AppointmentServiceAttributes
{
  public id!: string;
  public name!: string;
  public description!: string | null;
  public price!: number;
  public showTime!: number | null;
  public order!: number;
  public isRemove!: boolean;
  public isPublic!: boolean;
  public ShopId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof AppointmentService {
    AppointmentService.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        price: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        showTime: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        order: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        isRemove: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        isPublic: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        ShopId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'AppointmentServices',
        timestamps: true,
      },
    );
    return AppointmentService;
  }
}
```

**Step 3: Create models index with Sequelize instance**

`src/models/index.ts`:
```ts
import { Sequelize } from 'sequelize';
import databaseConfig from '../config/database';
import { User } from './User';
import { AppointmentService } from './AppointmentService';

const env = (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production';
const config = databaseConfig[env];

const sequelize = new Sequelize({
  ...config,
  define: {
    timestamps: true,
  },
});

User.initModel(sequelize);
AppointmentService.initModel(sequelize);

export { sequelize, User, AppointmentService };
```

**Step 4: Commit**

```bash
git add src/models/
git commit -m "Add Sequelize models for User and AppointmentService"
```

---

### Task 5: Repositories

**Files:**
- Create: `src/repositories/UserRepository.ts`
- Create: `src/repositories/AppointmentServiceRepository.ts`
- Create: `src/repositories/index.ts`

**Step 1: Create UserRepository**

`src/repositories/UserRepository.ts`:
```ts
import { User, UserCreationAttributes } from '../models/User';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
  }

  async create(data: UserCreationAttributes): Promise<User> {
    return User.create(data);
  }
}
```

**Step 2: Create AppointmentServiceRepository**

`src/repositories/AppointmentServiceRepository.ts`:
```ts
import { AppointmentService, AppointmentServiceCreationAttributes } from '../models/AppointmentService';

export class AppointmentServiceRepository {
  async findAll(): Promise<AppointmentService[]> {
    return AppointmentService.findAll({
      where: { isRemove: false },
      order: [['order', 'ASC']],
    });
  }

  async findById(id: string): Promise<AppointmentService | null> {
    return AppointmentService.findOne({
      where: { id, isRemove: false },
    });
  }

  async create(data: AppointmentServiceCreationAttributes): Promise<AppointmentService> {
    return AppointmentService.create(data);
  }

  async update(id: string, data: Partial<AppointmentServiceCreationAttributes>): Promise<AppointmentService | null> {
    const service = await AppointmentService.findOne({
      where: { id, isRemove: false },
    });
    if (!service) return null;
    return service.update(data);
  }

  async softDelete(id: string): Promise<boolean> {
    const service = await AppointmentService.findOne({
      where: { id, isRemove: false },
    });
    if (!service) return false;
    await service.update({ isRemove: true });
    return true;
  }
}
```

**Step 3: Create repository index**

`src/repositories/index.ts`:
```ts
export { UserRepository } from './UserRepository';
export { AppointmentServiceRepository } from './AppointmentServiceRepository';
```

**Step 4: Commit**

```bash
git add src/repositories/
git commit -m "Add repository layer for User and AppointmentService data access"
```

---

### Task 6: Utility Functions

**Files:**
- Create: `src/utils/password.ts`
- Create: `src/utils/jwt.ts`
- Create: `src/utils/index.ts`

**Step 1: Create password utility**

`src/utils/password.ts`:
```ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Step 2: Create JWT utility**

`src/utils/jwt.ts`:
```ts
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app';

interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, appConfig.jwt.secret) as TokenPayload;
}
```

**Step 3: Create utils index**

`src/utils/index.ts`:
```ts
export { hashPassword, comparePassword } from './password';
export { signToken, verifyToken } from './jwt';
```

**Step 4: Commit**

```bash
git add src/utils/
git commit -m "Add password hashing and JWT utility functions"
```

---

### Task 7: Joi Validators

**Files:**
- Create: `src/validators/auth.ts`
- Create: `src/validators/appointment.ts`
- Create: `src/validators/index.ts`

**Step 1: Create auth validators**

`src/validators/auth.ts`:
```ts
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  name: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Name cannot be empty',
    'any.required': 'Name is required',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});
```

**Step 2: Create appointment validators**

`src/validators/appointment.ts`:
```ts
import Joi from 'joi';

export const createServiceSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'any.required': 'Service name is required',
  }),
  description: Joi.string().allow(null, '').optional(),
  price: Joi.number().integer().min(0).required().messages({
    'any.required': 'Price is required',
    'number.min': 'Price cannot be negative',
  }),
  showTime: Joi.number().integer().min(0).allow(null).optional(),
  order: Joi.number().integer().min(0).optional(),
  isPublic: Joi.boolean().optional(),
});

export const updateServiceSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().allow(null, '').optional(),
  price: Joi.number().integer().min(0).optional(),
  showTime: Joi.number().integer().min(0).allow(null).optional(),
  order: Joi.number().integer().min(0).optional(),
  isPublic: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const serviceIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid service ID format',
  }),
});
```

**Step 3: Create validators index**

`src/validators/index.ts`:
```ts
export { registerSchema, loginSchema } from './auth';
export { createServiceSchema, updateServiceSchema, serviceIdSchema } from './appointment';
```

**Step 4: Commit**

```bash
git add src/validators/
git commit -m "Add Joi validation schemas for auth and appointment endpoints"
```

---

### Task 8: Koa Middlewares

**Files:**
- Create: `src/middlewares/errorHandler.ts`
- Create: `src/middlewares/auth.ts`
- Create: `src/middlewares/validate.ts`
- Create: `src/middlewares/rateLimit.ts`
- Create: `src/middlewares/index.ts`

**Step 1: Create error handler middleware**

`src/middlewares/errorHandler.ts`:
```ts
import { Context, Next } from 'koa';

interface AppError extends Error {
  status?: number;
  code?: string;
}

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    const error = err as AppError;
    const status = error.status || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const message = status === 500 ? 'Internal server error' : error.message;

    ctx.status = status;
    ctx.body = {
      error: {
        code,
        message,
      },
    };

    if (status === 500) {
      console.error('Unhandled error:', error);
    }
  }
}
```

**Step 2: Create auth middleware**

`src/middlewares/auth.ts`:
```ts
import { Context, Next } from 'koa';
import { verifyToken } from '../utils/jwt';

export async function authRequired(ctx: Context, next: Next) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.throw(401, 'Authentication required', { code: 'AUTH_REQUIRED' });
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    ctx.state.user = payload;
    await next();
  } catch {
    ctx.throw(401, 'Invalid or expired token', { code: 'INVALID_TOKEN' });
  }
}
```

**Step 3: Create validation middleware**

`src/middlewares/validate.ts`:
```ts
import { Context, Next } from 'koa';
import Joi from 'joi';

export function validateBody(schema: Joi.ObjectSchema) {
  return async (ctx: Context, next: Next) => {
    const { error, value } = schema.validate(ctx.request.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      ctx.throw(400, messages, { code: 'VALIDATION_ERROR' });
    }

    ctx.request.body = value;
    await next();
  };
}

export function validateParams(schema: Joi.ObjectSchema) {
  return async (ctx: Context, next: Next) => {
    const { error, value } = schema.validate(ctx.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      ctx.throw(400, messages, { code: 'VALIDATION_ERROR' });
    }

    ctx.params = value;
    await next();
  };
}
```

**Step 4: Create rate limit middleware**

`src/middlewares/rateLimit.ts`:
```ts
import { Context, Next } from 'koa';
import { appConfig } from '../config/app';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(ctx: Context, next: Next) {
  const ip = ctx.ip;
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + appConfig.rateLimit.duration,
    });
    await next();
    return;
  }

  record.count++;

  if (record.count > appConfig.rateLimit.max) {
    ctx.status = 429;
    ctx.body = {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    };
    return;
  }

  await next();
}
```

**Step 5: Create middlewares index**

`src/middlewares/index.ts`:
```ts
export { errorHandler } from './errorHandler';
export { authRequired } from './auth';
export { validateBody, validateParams } from './validate';
export { rateLimit } from './rateLimit';
```

**Step 6: Commit**

```bash
git add src/middlewares/
git commit -m "Add Koa middlewares for error handling, JWT auth, validation, and rate limiting"
```

---

### Task 9: Moleculer Broker and Services

**Files:**
- Create: `src/broker.ts`
- Create: `src/services/auth.service.ts`
- Create: `src/services/appointment.service.ts`

**Step 1: Create Moleculer broker**

`src/broker.ts`:
```ts
import { ServiceBroker } from 'moleculer';
import { appConfig } from './config/app';

const broker = new ServiceBroker({
  nodeID: 'service-management-node',
  logger: {
    type: 'Pino',
    options: {
      level: appConfig.nodeEnv === 'test' ? 'error' : 'info',
    },
  },
  transporter: null,
});

export default broker;
```

**Step 2: Create auth Moleculer service**

`src/services/auth.service.ts`:
```ts
import { Service, ServiceSchema, Context } from 'moleculer';
import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

const userRepository = new UserRepository();

const AuthService: ServiceSchema = {
  name: 'auth',

  actions: {
    async register(ctx: Context<{ email: string; password: string; name: string }>) {
      const { email, password, name } = ctx.params;

      const existing = await userRepository.findByEmail(email);
      if (existing) {
        const error = new Error('Email already registered') as Error & { code: number };
        error.code = 409;
        throw error;
      }

      const hashedPassword = await hashPassword(password);
      const user = await userRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      const token = signToken({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    },

    async login(ctx: Context<{ email: string; password: string }>) {
      const { email, password } = ctx.params;

      const user = await userRepository.findByEmail(email);
      if (!user) {
        const error = new Error('Invalid email or password') as Error & { code: number };
        error.code = 401;
        throw error;
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        const error = new Error('Invalid email or password') as Error & { code: number };
        error.code = 401;
        throw error;
      }

      const token = signToken({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    },
  },
};

export default AuthService;
```

**Step 3: Create appointment Moleculer service**

`src/services/appointment.service.ts`:
```ts
import { ServiceSchema, Context } from 'moleculer';
import { AppointmentServiceRepository } from '../repositories/AppointmentServiceRepository';

const appointmentRepository = new AppointmentServiceRepository();

const AppointmentServiceDef: ServiceSchema = {
  name: 'appointment',

  actions: {
    async list() {
      const services = await appointmentRepository.findAll();
      return services;
    },

    async get(ctx: Context<{ id: string }>) {
      const service = await appointmentRepository.findById(ctx.params.id);
      if (!service) {
        const error = new Error('Service not found') as Error & { code: number };
        error.code = 404;
        throw error;
      }
      return service;
    },

    async create(
      ctx: Context<{
        name: string;
        description?: string;
        price: number;
        showTime?: number;
        order?: number;
        isPublic?: boolean;
      }>,
    ) {
      const service = await appointmentRepository.create(ctx.params);
      return service;
    },

    async update(
      ctx: Context<{
        id: string;
        name?: string;
        description?: string;
        price?: number;
        showTime?: number;
        order?: number;
        isPublic?: boolean;
      }>,
    ) {
      const { id, ...data } = ctx.params;
      const service = await appointmentRepository.update(id, data);
      if (!service) {
        const error = new Error('Service not found') as Error & { code: number };
        error.code = 404;
        throw error;
      }
      return service;
    },

    async delete(ctx: Context<{ id: string }>) {
      const success = await appointmentRepository.softDelete(ctx.params.id);
      if (!success) {
        const error = new Error('Service not found') as Error & { code: number };
        error.code = 404;
        throw error;
      }
      return { message: 'Service deleted successfully' };
    },
  },
};

export default AppointmentServiceDef;
```

**Step 4: Commit**

```bash
git add src/broker.ts src/services/
git commit -m "Add Moleculer broker and service definitions for auth and appointment"
```

---

### Task 10: Controllers and Routes

**Files:**
- Create: `src/controllers/authController.ts`
- Create: `src/controllers/serviceController.ts`
- Create: `src/routes/index.ts`

**Step 1: Create auth controller**

`src/controllers/authController.ts`:
```ts
import { Context } from 'koa';
import broker from '../broker';

export async function register(ctx: Context) {
  try {
    const result = await broker.call('auth.register', ctx.request.body);
    ctx.status = 201;
    ctx.body = { data: result };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function login(ctx: Context) {
  try {
    const result = await broker.call('auth.login', ctx.request.body);
    ctx.status = 200;
    ctx.body = { data: result };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}
```

**Step 2: Create service controller**

`src/controllers/serviceController.ts`:
```ts
import { Context } from 'koa';
import broker from '../broker';

export async function listServices(ctx: Context) {
  try {
    const services = await broker.call('appointment.list');
    ctx.body = { data: services };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function getService(ctx: Context) {
  try {
    const service = await broker.call('appointment.get', { id: ctx.params.id });
    ctx.body = { data: service };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function createService(ctx: Context) {
  try {
    const service = await broker.call('appointment.create', ctx.request.body);
    ctx.status = 201;
    ctx.body = { data: service };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function updateService(ctx: Context) {
  try {
    const service = await broker.call('appointment.update', {
      id: ctx.params.id,
      ...ctx.request.body,
    });
    ctx.body = { data: service };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function deleteService(ctx: Context) {
  try {
    const result = await broker.call('appointment.delete', { id: ctx.params.id });
    ctx.body = { data: result };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}
```

**Step 3: Create routes**

`src/routes/index.ts`:
```ts
import Router from '@koa/router';
import { register, login } from '../controllers/authController';
import { listServices, getService, createService, updateService, deleteService } from '../controllers/serviceController';
import { authRequired } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';
import { registerSchema, loginSchema, createServiceSchema, updateServiceSchema, serviceIdSchema } from '../validators';

const router = new Router({ prefix: '/api' });

// Auth routes (public)
router.post('/auth/register', validateBody(registerSchema), register);
router.post('/auth/login', validateBody(loginSchema), login);

// Service routes (public)
router.get('/services', listServices);
router.get('/services/:id', validateParams(serviceIdSchema), getService);

// Service routes (protected)
router.post('/services', authRequired, validateBody(createServiceSchema), createService);
router.put('/services/:id', authRequired, validateParams(serviceIdSchema), validateBody(updateServiceSchema), updateService);
router.delete('/services/:id', authRequired, validateParams(serviceIdSchema), deleteService);

export default router;
```

**Step 4: Commit**

```bash
git add src/controllers/ src/routes/
git commit -m "Add controllers and route definitions with middleware wiring"
```

---

### Task 11: App Entry Point

**Files:**
- Create: `src/app.ts`

**Step 1: Create main app**

`src/app.ts`:
```ts
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import dotenv from 'dotenv';

dotenv.config();

import { appConfig } from './config/app';
import { sequelize } from './models';
import broker from './broker';
import AuthService from './services/auth.service';
import AppointmentServiceDef from './services/appointment.service';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimit } from './middlewares/rateLimit';
import router from './routes';

const app = new Koa();

// Middlewares
app.use(errorHandler);
app.use(rateLimit);
app.use(cors());
app.use(bodyParser());

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

export async function startApp() {
  // Load Moleculer services
  broker.createService(AuthService);
  broker.createService(AppointmentServiceDef);

  // Start Moleculer broker
  await broker.start();

  // Sync database (for test/dev; use migrations in production)
  if (appConfig.nodeEnv === 'test') {
    await sequelize.sync({ force: true });
  }

  // Start HTTP server
  const server = app.listen(appConfig.port, () => {
    if (appConfig.nodeEnv !== 'test') {
      console.log(`Server running on port ${appConfig.port}`);
    }
  });

  return server;
}

export async function stopApp(server?: ReturnType<typeof app.listen>) {
  if (server) {
    server.close();
  }
  await broker.stop();
  await sequelize.close();
}

// Start if not imported as module
if (require.main === module) {
  startApp().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
```

**Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app.ts
git commit -m "Add Koa app entry point with Moleculer service loading and graceful shutdown"
```

---

### Task 12: Seeders

**Files:**
- Create: `seeders/20260223000001-seed-users.js`
- Create: `seeders/20260223000002-seed-appointment-services.js`

**Step 1: Create users seeder**

`seeders/20260223000001-seed-users.js`:
```js
'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        email: 'user@example.com',
        password: hashedPassword,
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
```

**Step 2: Create appointment services seeder**

`seeders/20260223000002-seed-appointment-services.js`:
```js
'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('AppointmentServices', [
      {
        id: uuidv4(),
        name: 'Basic Haircut',
        description: 'A standard haircut service',
        price: 500,
        showTime: 30,
        order: 1,
        isRemove: false,
        isPublic: true,
        ShopId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Hair Coloring',
        description: 'Professional hair coloring service',
        price: 2000,
        showTime: 120,
        order: 2,
        isRemove: false,
        isPublic: true,
        ShopId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Premium Spa Treatment',
        description: 'Full body spa treatment',
        price: 3500,
        showTime: 90,
        order: 3,
        isRemove: false,
        isPublic: false,
        ShopId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('AppointmentServices', null, {});
  },
};
```

**Step 3: Commit**

```bash
git add seeders/
git commit -m "Add seed data for users and appointment services"
```

---

### Task 13: Unit Tests

**Files:**
- Create: `tests/unit/auth.service.test.ts`
- Create: `tests/unit/appointment.service.test.ts`
- Create: `tests/helpers/setup.ts`

**Step 1: Create test setup helper**

`tests/helpers/setup.ts`:
```ts
import { sequelize } from '../../src/models';
import broker from '../../src/broker';
import AuthService from '../../src/services/auth.service';
import AppointmentServiceDef from '../../src/services/appointment.service';

let initialized = false;

export async function setupTestEnv() {
  if (!initialized) {
    broker.createService(AuthService);
    broker.createService(AppointmentServiceDef);
    await broker.start();
    initialized = true;
  }
  await sequelize.sync({ force: true });
}

export async function teardownTestEnv() {
  await broker.stop();
  await sequelize.close();
  initialized = false;
}

export { broker, sequelize };
```

**Step 2: Create auth service unit tests**

`tests/unit/auth.service.test.ts`:
```ts
import { setupTestEnv, teardownTestEnv, broker } from '../helpers/setup';

describe('Auth Service', () => {
  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await teardownTestEnv();
  });

  describe('auth.register', () => {
    it('should register a new user and return token', async () => {
      const result = await broker.call('auth.register', {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      await broker.call('auth.register', {
        email: 'dup@example.com',
        password: 'password123',
        name: 'First User',
      });

      await expect(
        broker.call('auth.register', {
          email: 'dup@example.com',
          password: 'password456',
          name: 'Second User',
        }),
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('auth.login', () => {
    beforeAll(async () => {
      await broker.call('auth.register', {
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User',
      });
    });

    it('should login with valid credentials', async () => {
      const result = await broker.call('auth.login', {
        email: 'login@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('login@example.com');
    });

    it('should reject invalid email', async () => {
      await expect(
        broker.call('auth.login', {
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject invalid password', async () => {
      await expect(
        broker.call('auth.login', {
          email: 'login@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
```

**Step 3: Create appointment service unit tests**

`tests/unit/appointment.service.test.ts`:
```ts
import { setupTestEnv, teardownTestEnv, broker } from '../helpers/setup';

describe('Appointment Service', () => {
  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await teardownTestEnv();
  });

  let createdServiceId: string;

  describe('appointment.create', () => {
    it('should create a new service', async () => {
      const result = await broker.call('appointment.create', {
        name: 'Test Service',
        description: 'A test service',
        price: 1000,
        showTime: 60,
      });

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Service');
      expect(result.price).toBe(1000);
      expect(result.isRemove).toBe(false);
      expect(result.isPublic).toBe(true);
      createdServiceId = result.id;
    });
  });

  describe('appointment.list', () => {
    it('should return all non-removed services', async () => {
      const result = await broker.call('appointment.list');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('appointment.get', () => {
    it('should return a service by ID', async () => {
      const result = await broker.call('appointment.get', { id: createdServiceId });
      expect(result.id).toBe(createdServiceId);
      expect(result.name).toBe('Test Service');
    });

    it('should throw for non-existent ID', async () => {
      await expect(
        broker.call('appointment.get', { id: '00000000-0000-0000-0000-000000000000' }),
      ).rejects.toThrow('Service not found');
    });
  });

  describe('appointment.update', () => {
    it('should update a service', async () => {
      const result = await broker.call('appointment.update', {
        id: createdServiceId,
        name: 'Updated Service',
        price: 2000,
      });
      expect(result.name).toBe('Updated Service');
      expect(result.price).toBe(2000);
    });

    it('should throw for non-existent ID', async () => {
      await expect(
        broker.call('appointment.update', {
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Ghost',
        }),
      ).rejects.toThrow('Service not found');
    });
  });

  describe('appointment.delete', () => {
    it('should soft-delete a service', async () => {
      const result = await broker.call('appointment.delete', { id: createdServiceId });
      expect(result.message).toBe('Service deleted successfully');

      // Verify it's not returned in list
      const list = await broker.call('appointment.list');
      const found = list.find((s: any) => s.id === createdServiceId);
      expect(found).toBeUndefined();
    });

    it('should throw for already-deleted service', async () => {
      await expect(
        broker.call('appointment.delete', { id: createdServiceId }),
      ).rejects.toThrow('Service not found');
    });
  });
});
```

**Step 4: Run unit tests**

Run: `npm run test:unit`
Expected: All tests pass

**Step 5: Commit**

```bash
git add tests/
git commit -m "Add unit tests for auth and appointment Moleculer services"
```

---

### Task 14: Integration Tests

**Files:**
- Create: `tests/integration/auth.test.ts`
- Create: `tests/integration/services.test.ts`

**Step 1: Create auth integration tests**

`tests/integration/auth.test.ts`:
```ts
import http from 'http';
import request from 'supertest';
import { startApp, stopApp } from '../../src/app';

describe('Auth API', () => {
  let server: http.Server;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    server = await startApp();
  });

  afterAll(async () => {
    await stopApp(server);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(server).post('/api/auth/register').send({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('newuser@example.com');
    });

    it('should reject invalid email', async () => {
      const res = await request(server).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing password', async () => {
      const res = await request(server).post('/api/auth/register').send({
        email: 'test@example.com',
        name: 'Test',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject short password', async () => {
      const res = await request(server).post('/api/auth/register').send({
        email: 'short@example.com',
        password: '123',
        name: 'Test',
      });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate email', async () => {
      await request(server).post('/api/auth/register').send({
        email: 'dup@example.com',
        password: 'password123',
        name: 'First',
      });

      const res = await request(server).post('/api/auth/register').send({
        email: 'dup@example.com',
        password: 'password456',
        name: 'Second',
      });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await request(server).post('/api/auth/register').send({
        email: 'logintest@example.com',
        password: 'password123',
        name: 'Login Test',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(server).post('/api/auth/login').send({
        email: 'logintest@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('logintest@example.com');
    });

    it('should reject wrong password', async () => {
      const res = await request(server).post('/api/auth/login').send({
        email: 'logintest@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(server).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });
});
```

**Step 2: Create services integration tests**

`tests/integration/services.test.ts`:
```ts
import http from 'http';
import request from 'supertest';
import { startApp, stopApp } from '../../src/app';

describe('Services API', () => {
  let server: http.Server;
  let authToken: string;
  let createdServiceId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    server = await startApp();

    // Register and get token
    const res = await request(server).post('/api/auth/register').send({
      email: 'servicetest@example.com',
      password: 'password123',
      name: 'Service Tester',
    });
    authToken = res.body.data.token;
  });

  afterAll(async () => {
    await stopApp(server);
  });

  describe('POST /api/services (protected)', () => {
    it('should create a service with valid JWT', async () => {
      const res = await request(server)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Integration Test Service',
          description: 'Created during integration test',
          price: 1500,
          showTime: 45,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Integration Test Service');
      createdServiceId = res.body.data.id;
    });

    it('should reject without JWT', async () => {
      const res = await request(server).post('/api/services').send({
        name: 'Unauthorized Service',
        price: 100,
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });

    it('should reject with invalid JWT', async () => {
      const res = await request(server)
        .post('/api/services')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          name: 'Bad Token Service',
          price: 100,
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should reject invalid body', async () => {
      const res = await request(server)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing name and price',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/services (public)', () => {
    it('should list services without auth', async () => {
      const res = await request(server).get('/api/services');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/services/:id (public)', () => {
    it('should get a single service without auth', async () => {
      const res = await request(server).get(`/api/services/${createdServiceId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdServiceId);
    });

    it('should return 404 for non-existent service', async () => {
      const res = await request(server).get('/api/services/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request(server).get('/api/services/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/services/:id (protected)', () => {
    it('should update a service with valid JWT', async () => {
      const res = await request(server)
        .put(`/api/services/${createdServiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Integration Service', price: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Integration Service');
      expect(res.body.data.price).toBe(2500);
    });

    it('should reject without JWT', async () => {
      const res = await request(server)
        .put(`/api/services/${createdServiceId}`)
        .send({ name: 'Unauthorized Update' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/services/:id (protected)', () => {
    it('should reject without JWT', async () => {
      const res = await request(server).delete(`/api/services/${createdServiceId}`);

      expect(res.status).toBe(401);
    });

    it('should soft-delete a service with valid JWT', async () => {
      const res = await request(server)
        .delete(`/api/services/${createdServiceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      // Verify it's gone from list
      const listRes = await request(server).get('/api/services');
      const found = listRes.body.data.find((s: any) => s.id === createdServiceId);
      expect(found).toBeUndefined();
    });

    it('should return 404 for already-deleted service', async () => {
      const res = await request(server)
        .delete(`/api/services/${createdServiceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
```

**Step 3: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 4: Commit**

```bash
git add tests/integration/
git commit -m "Add integration tests for auth and services API endpoints"
```

---

### Task 15: README and Postman Collection

**Files:**
- Create: `README.md`
- Create: `postman/service-management-api.postman_collection.json`

**Step 1: Create README.md**

`README.md`:
````markdown
# Service Management API

A minimal viable service management backend system built with TypeScript, Koa, Moleculer, Sequelize, and PostgreSQL.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Language | TypeScript |
| Web Framework | Koa |
| Microservice | Moleculer |
| ORM | Sequelize |
| Database | PostgreSQL (prod), SQLite (test) |
| Validation | Joi |
| Auth | JWT + bcryptjs |
| Testing | Jest + Supertest |
| Linting | ESLint + Prettier |

## Architecture

```
HTTP Request
  → Koa Middleware (rate limit → error handler → CORS)
    → Koa Router
      → Controller (Joi validation → JWT check)
        → Moleculer Service Action
          → Repository (Sequelize)
            → PostgreSQL
```

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose (for PostgreSQL)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd service-management-api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

Server runs on `http://localhost:3000` by default.

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

Tests use SQLite in-memory, no external database required.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | service_management |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRES_IN | Token expiration | 24h |
| RATE_LIMIT_DURATION | Rate limit window (ms) | 60000 |
| RATE_LIMIT_MAX | Max requests per window | 100 |

## API Endpoints

### Auth

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response (201):
```json
{
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe" },
    "token": "jwt-token"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe" },
    "token": "jwt-token"
  }
}
```

### Services

#### List Services (Public)
```
GET /api/services
```

#### Get Service (Public)
```
GET /api/services/:id
```

#### Create Service (JWT Required)
```
POST /api/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Haircut",
  "description": "Basic haircut service",
  "price": 500,
  "showTime": 30,
  "order": 1,
  "isPublic": true
}
```

#### Update Service (JWT Required)
```
PUT /api/services/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 600
}
```

#### Delete Service (JWT Required)
```
DELETE /api/services/:id
Authorization: Bearer <token>
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descriptive error message"
  }
}
```

## Seed Data

| Email | Password | Name |
|-------|----------|------|
| admin@example.com | password123 | Admin User |
| user@example.com | password123 | Test User |

## Project Structure

```
src/
├── config/           # Environment configuration
├── controllers/      # HTTP request handlers
├── middlewares/       # Koa middlewares (auth, error, rate limit, validation)
├── models/           # Sequelize models
├── repositories/     # Data access layer
├── routes/           # Route definitions
├── services/         # Moleculer service definitions
├── utils/            # Helper functions (JWT, password)
├── validators/       # Joi schemas
├── broker.ts         # Moleculer broker
└── app.ts            # App entry point
```

## Database Differences (PostgreSQL vs SQLite)

Tests use SQLite in-memory for speed and zero-dependency testing. Key differences:

| Feature | PostgreSQL | SQLite |
|---------|-----------|--------|
| UUID | Native `uuid` type | Stored as TEXT |
| TIMESTAMPTZ | Native support | Stored as TEXT (ISO 8601) |
| Concurrent writes | Full support | Limited (file-level lock) |
| JSON operations | Full `jsonb` | Basic JSON1 extension |

Production always uses PostgreSQL.
````

**Step 2: Create Postman Collection**

Create directory: `mkdir -p postman`

`postman/service-management-api.postman_collection.json`:
```json
{
  "info": {
    "name": "Service Management API",
    "description": "API collection for the service management backend",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    },
    {
      "key": "serviceId",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const res = pm.response.json();",
                  "if (res.data && res.data.token) {",
                  "  pm.collectionVariables.set('token', res.data.token);",
                  "}",
                  "pm.test('Status 201', () => pm.response.to.have.status(201));",
                  "pm.test('Has token', () => pm.expect(res.data).to.have.property('token'));"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"testuser@example.com\",\n  \"password\": \"password123\",\n  \"name\": \"Test User\"\n}"
            },
            "url": { "raw": "{{baseUrl}}/api/auth/register", "host": ["{{baseUrl}}"], "path": ["api", "auth", "register"] }
          }
        },
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const res = pm.response.json();",
                  "if (res.data && res.data.token) {",
                  "  pm.collectionVariables.set('token', res.data.token);",
                  "}",
                  "pm.test('Status 200', () => pm.response.to.have.status(200));",
                  "pm.test('Has token', () => pm.expect(res.data).to.have.property('token'));"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"testuser@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": { "raw": "{{baseUrl}}/api/auth/login", "host": ["{{baseUrl}}"], "path": ["api", "auth", "login"] }
          }
        },
        {
          "name": "Register - Validation Fail",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"invalid-email\",\n  \"password\": \"123\"\n}"
            },
            "url": { "raw": "{{baseUrl}}/api/auth/register", "host": ["{{baseUrl}}"], "path": ["api", "auth", "register"] }
          }
        }
      ]
    },
    {
      "name": "Services",
      "item": [
        {
          "name": "List Services (Public)",
          "request": {
            "method": "GET",
            "url": { "raw": "{{baseUrl}}/api/services", "host": ["{{baseUrl}}"], "path": ["api", "services"] }
          }
        },
        {
          "name": "Create Service (JWT)",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const res = pm.response.json();",
                  "if (res.data && res.data.id) {",
                  "  pm.collectionVariables.set('serviceId', res.data.id);",
                  "}",
                  "pm.test('Status 201', () => pm.response.to.have.status(201));"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"New Service\",\n  \"description\": \"A new service\",\n  \"price\": 1000,\n  \"showTime\": 30\n}"
            },
            "url": { "raw": "{{baseUrl}}/api/services", "host": ["{{baseUrl}}"], "path": ["api", "services"] }
          }
        },
        {
          "name": "Get Service (Public)",
          "request": {
            "method": "GET",
            "url": { "raw": "{{baseUrl}}/api/services/{{serviceId}}", "host": ["{{baseUrl}}"], "path": ["api", "services", "{{serviceId}}"] }
          }
        },
        {
          "name": "Update Service (JWT)",
          "request": {
            "method": "PUT",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Updated Service\",\n  \"price\": 2000\n}"
            },
            "url": { "raw": "{{baseUrl}}/api/services/{{serviceId}}", "host": ["{{baseUrl}}"], "path": ["api", "services", "{{serviceId}}"] }
          }
        },
        {
          "name": "Delete Service (JWT)",
          "request": {
            "method": "DELETE",
            "header": [{ "key": "Authorization", "value": "Bearer {{token}}" }],
            "url": { "raw": "{{baseUrl}}/api/services/{{serviceId}}", "host": ["{{baseUrl}}"], "path": ["api", "services", "{{serviceId}}"] }
          }
        },
        {
          "name": "Create Service - No Auth (should 401)",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Unauthorized\",\n  \"price\": 100\n}"
            },
            "url": { "raw": "{{baseUrl}}/api/services", "host": ["{{baseUrl}}"], "path": ["api", "services"] }
          }
        }
      ]
    }
  ]
}
```

**Step 3: Commit**

```bash
git add README.md postman/
git commit -m "Add comprehensive README and Postman collection"
```

---

### Task 16: Final Verification

**Step 1: Start PostgreSQL and verify local run**

Run:
```bash
docker-compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

Verify: Server starts on port 3000

**Step 2: Run full test suite**

Run: `npm test`
Expected: All unit and integration tests pass

**Step 3: Run linter**

Run: `npm run lint`
Expected: No errors

**Step 4: Final commit if any adjustments needed**

```bash
git add -A
git commit -m "Final adjustments and verification"
```
