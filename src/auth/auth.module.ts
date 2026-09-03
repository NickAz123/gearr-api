import { Module } from "@nestjs/common";

import { PasswordService } from "./password.service";

/**
 * Home for credential handling. Currently just password hashing; the
 * login/logout/dashboard routes that were commented out in `routes/login.js`
 * belong here when they are implemented.
 */
@Module({
    providers: [PasswordService],
    exports: [PasswordService],
})
export class AuthModule {}
