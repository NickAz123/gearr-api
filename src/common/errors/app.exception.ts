import { HttpException } from "@nestjs/common";

import { ALL_ERRORS, AppErrorCode, SYS_ERROR_CODES } from "./error-codes";

export interface AppErrorBody {
    status: "error" | "fail";
    code: string;
    message: string;
}

/**
 * Nest-native replacement for the old `sendError(res, code)` helper.
 *
 * Throwing this anywhere in a controller/service produces exactly the response
 * body the Express version emitted, so existing API consumers are unaffected.
 */
export class AppException extends HttpException {
    readonly code: string;

    constructor(code: AppErrorCode, customMessage?: string) {
        const definition = ALL_ERRORS[code] ?? SYS_ERROR_CODES.SYS_SERVER_ERROR;

        const body: AppErrorBody = {
            status: definition.status >= 500 ? "error" : "fail",
            code,
            message: customMessage ?? definition.message,
        };

        super(body, definition.status);
        this.code = code;
    }
}
