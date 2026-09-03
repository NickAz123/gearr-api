import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./auth/auth.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { envValidationSchema } from "./config/env.validation";
import { DatabaseModule } from "./database/database.module";
import { GearModule } from "./gear/gear.module";
import { RedisModule } from "./redis/redis.module";
import { UsersModule } from "./users/users.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            validationSchema: envValidationSchema,
            validationOptions: { abortEarly: false },
        }),
        DatabaseModule,
        RedisModule,
        AuthModule,
        UsersModule,
        GearModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class AppModule {}
