import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import type { Response } from "express";

import { AppErrorBody } from "../errors/app.exception";
import { SYS_ERROR_CODES } from "../errors/error-codes";

/**
 * Normalises every escaping exception into the API's `{ status, code, message }`
 * envelope, so an unhandled service error looks the same as a deliberate
 * `AppException` — the Express version achieved this by funnelling everything
 * through `sendError(res, 'SYS_SERVER_ERROR')` in each route's catch block.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();

            if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
                this.logger.error(exception.message, exception.stack);
            }

            response.status(status).json(this.toAppErrorBody(body, status));
            return;
        }

        this.logger.error(
            "Unhandled exception",
            exception instanceof Error ? exception.stack : String(exception),
        );

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: "error",
            code: "SYS_SERVER_ERROR",
            message: SYS_ERROR_CODES.SYS_SERVER_ERROR.message,
        } satisfies AppErrorBody);
    }

    /** Reshapes Nest's built-in exception bodies into our envelope. */
    private toAppErrorBody(body: unknown, status: number): AppErrorBody {
        if (
            typeof body === "object" &&
            body !== null &&
            "code" in body &&
            "message" in body
        ) {
            return body as AppErrorBody;
        }

        const message =
            typeof body === "string"
                ? body
                : typeof body === "object" && body !== null && "message" in body
                  ? String((body as { message: unknown }).message)
                  : SYS_ERROR_CODES.SYS_SERVER_ERROR.message;

        return {
            status:
                status >= HttpStatus.INTERNAL_SERVER_ERROR ? "error" : "fail",
            code:
                status >= HttpStatus.INTERNAL_SERVER_ERROR
                    ? "SYS_SERVER_ERROR"
                    : "REQUEST_INVALID",
            message,
        };
    }
}
