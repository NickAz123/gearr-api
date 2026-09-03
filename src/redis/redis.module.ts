import {
    Global,
    Inject,
    Logger,
    Module,
    OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createClient, RedisClientType } from "redis";

import { REDIS_CLIENT } from "./redis.constants";

/**
 * Provides a *connected* Redis client for the session store.
 *
 * The Express version built the client against `redis://localhost:${PORT}` (the
 * HTTP port, 9000) and never called `.connect()`, so session persistence never
 * worked. The URL now comes from `REDIS_URL` and connection is awaited at boot.
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService],
            useFactory: async (
                config: ConfigService,
            ): Promise<RedisClientType> => {
                const logger = new Logger("RedisModule");
                const client: RedisClientType = createClient({
                    url: config.getOrThrow<string>("REDIS_URL"),
                });

                client.on("error", (err) =>
                    logger.error(`Redis client error: ${String(err)}`),
                );

                await client.connect();
                logger.log("Redis connected");

                return client;
            },
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
    private readonly logger = new Logger(RedisModule.name);

    constructor(
        @Inject(REDIS_CLIENT) private readonly client: RedisClientType,
    ) {}

    async onApplicationShutdown(): Promise<void> {
        await this.client.quit();
        this.logger.log("Redis connection closed");
    }
}
