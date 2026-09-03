import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/** Injectable replacement for `helpers/bcryptHelpers.js`. */
@Injectable()
export class PasswordService {
    hash(plainText: string): Promise<string> {
        return bcrypt.hash(plainText, SALT_ROUNDS);
    }

    /**
     * Note the argument order: bcrypt expects (plain text, hash). The Express
     * version called `comparePassword(user.password, currentPassword)` — hash
     * first — so a password change could never succeed.
     */
    compare(plainText: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plainText, hash);
    }
}
