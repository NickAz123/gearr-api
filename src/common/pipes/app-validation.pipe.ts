import { ParseIntPipe, ValidationPipe } from "@nestjs/common";

import { AppException } from "../errors/app.exception";
import { AppErrorCode } from "../errors/error-codes";

/**
 * A `ValidationPipe` that reports failures using the API's own error codes
 * instead of Nest's default 400 body — the Express routes hand-checked required
 * fields and answered with e.g. `USER_OBJECT_INVALID`.
 */
export function appValidationPipe(code: AppErrorCode): ValidationPipe {
    return new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        exceptionFactory: () => new AppException(code),
    });
}

/** `ParseIntPipe` that rejects non-numeric route ids with a domain error code. */
export function parseIdPipe(code: AppErrorCode): ParseIntPipe {
    return new ParseIntPipe({
        exceptionFactory: () => new AppException(code),
    });
}
