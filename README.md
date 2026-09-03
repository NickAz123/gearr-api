# GEARR API

`v2.0.0` — NestJS

REST API for tracking gear (bikes, boards, …), their parts and maintenance.
Backed by PostgreSQL, with Redis-backed sessions.

(see wiki for details)

## Stack

| Concern     | Choice                                              |
| ----------- | --------------------------------------------------- |
| Framework   | NestJS 11 (Express platform), TypeScript            |
| Database    | PostgreSQL via `pg` — raw parameterised SQL, no ORM |
| Sessions    | `express-session` + `connect-redis`                 |
| Validation  | `class-validator` / `class-transformer` DTOs        |
| Config      | `@nestjs/config` with Joi schema validation         |

## Layout

```
src/
  main.ts                  bootstrap: session middleware, shutdown hooks
  app.module.ts            root module, global exception filter
  config/                  environment variable schema
  common/
    errors/                error-code registry, AppException, PG error codes
    filters/               AllExceptionsFilter -> { status, code, message }
    pipes/                 validation/parse pipes that raise domain error codes
  database/                pg Pool provider + dynamic SQL builders
  redis/                   connected Redis client provider
  auth/                    PasswordService (bcrypt); future login routes
  users/                   controller -> service -> repository (+ DTOs, entity)
  gear/                    controller -> service -> repository (+ DTOs, entity)
db/init.sql                schema and seed data
```

The layering mirrors the previous Express app: **controller** (HTTP shape and
status codes) → **service** (business rules, error-code mapping) →
**repository** (all SQL). The pool is injected rather than imported as a
singleton, so repositories are unit-testable.

## Getting started

```bash
cp '!EXAMPLE.env' .env     # then set SECRET_KEY
npm install
npm run dev                # starts postgres + redis, then nest in watch mode
```

Or run everything in containers:

```bash
docker compose up --build
```

## Scripts

| Script                | Does                                             |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Start db + redis containers, then Nest in watch  |
| `npm run start:dev`   | Nest in watch mode only                          |
| `npm run build`       | Compile to `dist/`                               |
| `npm run start:prod`  | Run the compiled build                           |
| `npm test`            | Unit tests                                       |
| `npm run lint`        | ESLint + Prettier                                |
| `npm run db:up/down`  | Start / stop db + redis containers               |
| `npm run db:reset`    | Drop volumes and re-seed from `db/init.sql`      |
| `npm run psql`        | psql shell into the db container                 |

## Endpoints

| Method   | Path                          | Notes                                    |
| -------- | ----------------------------- | ---------------------------------------- |
| `GET`    | `/users`                      | All non-deleted users                    |
| `GET`    | `/users/:id`                  | `?settings=true` joins `users_settings`  |
| `PUT`    | `/users`                      | Create; also seeds a settings row        |
| `PATCH`  | `/users/:id`                  | Partial update of name/username/email    |
| `PATCH`  | `/users/:id/update-password`  | Verifies current password; `204`         |
| `DELETE` | `/users/:id/delete`           | Soft delete; `204`                       |
| `GET`    | `/gear/:id`                   | Single gear item                         |
| `GET`    | `/gear/user-gear/:id`         | All gear for a user                      |
| `PUT`    | `/gear/:id`                   | Create gear for user `:id`; seeds health |

### Errors

Every failure returns the same envelope:

```json
{ "status": "fail", "code": "USER_NOT_FOUND", "message": "User Not Found." }
```

`status` is `"fail"` for 4xx and `"error"` for 5xx. Codes are defined in
`src/common/errors/error-codes.ts`; raise one by throwing
`new AppException('USER_NOT_FOUND')` anywhere in a service.

## Environment

See `!EXAMPLE.env`. All variables are validated at boot — the process exits
immediately if any required one is missing or malformed.
