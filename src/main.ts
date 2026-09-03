import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { RedisStore } from "connect-redis";
import session from "express-session";
import type { RedisClientType } from "redis";

import { AppModule } from "./app.module";
import { REDIS_CLIENT } from "./redis/redis.constants";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);
    const logger = new Logger("Bootstrap");

    app.enableShutdownHooks();

    // Session storage, backed by the connected Redis client from RedisModule.
    const redisClient = app.get<RedisClientType>(REDIS_CLIENT);
    const ttlSeconds = config.getOrThrow<number>("SESSION_TTL_SECONDS");

    app.use(
        session({
            store: new RedisStore({
                client: redisClient,
                prefix: "gearr:session:",
                ttl: ttlSeconds,
            }),
            secret: config.getOrThrow<string>("SECRET_KEY"),
            resave: false, // Prevents resaving unchanged sessions
            saveUninitialized: false, // Avoids creating blank sessions for guests
            cookie: {
                httpOnly: true, // Prevents XSS attacks from reading cookie data
                secure: config.get<boolean>("SESSION_COOKIE_SECURE") ?? false,
                maxAge: ttlSeconds * 1000, // Cookie lifetime matching the Redis TTL
            },
        }),
    );

    // Deliberately no global ValidationPipe: global pipes run *before*
    // parameter-level ones, so a global pipe would reject invalid bodies with
    // its own generic 400 and pre-empt the per-route `appValidationPipe(code)`
    // that produces this API's domain error codes (USER_OBJECT_INVALID, ...).
    // Every handler taking a body or query declares its own pipe instead.

    const port = config.getOrThrow<number>("PORT");
    await app.listen(port);
    logger.log(`Server running on port ${port}`);
}

void bootstrap();
