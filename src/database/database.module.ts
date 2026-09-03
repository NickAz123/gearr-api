import {
    Global,
    Inject,
    Logger,
    Module,
    OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Pool } from "pg";

import { PG_POOL } from "./database.constants";

/**
 * Replaces the old module-level singleton in `db.js`. The pool is now a provider
 * so repositories receive it by injection (and tests can substitute a fake), and
 * it is closed cleanly on shutdown.
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: PG_POOL,
            inject: [ConfigService],
            useFactory: (config: ConfigService): Pool =>
                new Pool({
                    host: config.getOrThrow<string>("DB_HOST"),
                    port: config.getOrThrow<number>("DB_PORT"),
                    database: config.getOrThrow<string>("DB_NAME"),
                    user: config.getOrThrow<string>("DB_USER"),
                    password: config.getOrThrow<string>("DB_PASSWORD"),
                }),
        },
    ],
    exports: [PG_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
    private readonly logger = new Logger(DatabaseModule.name);

    constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

    async onApplicationShutdown(): Promise<void> {
        await this.pool.end();
        this.logger.log("Postgres pool closed");
    }
}
