/**
 * Central registry of application error codes.
 *
 * Ported from the previous `constants/*Errors.js` files. Each code maps to an
 * HTTP status and a default message; `AppException` turns a code into a
 * response body of `{ status, code, message }`.
 */
export interface ErrorDefinition {
    status: number;
    message: string;
}

export const SYS_ERROR_CODES = {
    SYS_SERVER_ERROR: {
        status: 500,
        message: "Internal Server Error.",
    },
} as const satisfies Record<string, ErrorDefinition>;

export const USER_ERROR_CODES = {
    USER_NOT_FOUND: {
        status: 404,
        message: "User Not Found.",
    },
    USER_ALREADY_EXISTS: {
        status: 409,
        message: "User Email or Username already exists.",
    },
    USER_OBJECT_INVALID: {
        status: 400,
        message: "User Object is invalid.",
    },
    USER_UPDATE_FAIL: {
        status: 500,
        message: "Failed to update user.",
    },
    USER_PASSWORD_MISMATCH: {
        status: 500,
        message: "Password mismatched",
    },
    USER_UNAUTHORIZED: {
        status: 401,
        message: "You do not have permission to access this resource.",
    },
    USER_FIELD_EMPTY: {
        status: 400,
        message: "Field cannot be empty",
    },
} as const satisfies Record<string, ErrorDefinition>;

export const GEAR_ERROR_CODES = {
    GEAR_NOT_FOUND: {
        status: 404,
        message: "Gear Not Found.",
    },
    GEAR_ALREADY_EXISTS: {
        status: 409,
        message: "Gear already exists.",
    },
    GEAR_OBJECT_INVALID: {
        status: 400,
        message: "Gear Object is invalid.",
    },
    GEAR_UPDATE_FAIL: {
        status: 500,
        message: "Failed to update gear.",
    },
    GEAR_UNAUTHORIZED: {
        status: 401,
        message: "You do not have permission to access this resource.",
    },
    GEAR_FIELD_EMPTY: {
        status: 400,
        message: "Field cannot be empty",
    },
} as const satisfies Record<string, ErrorDefinition>;

export const ALL_ERRORS = {
    ...SYS_ERROR_CODES,
    ...USER_ERROR_CODES,
    ...GEAR_ERROR_CODES,
} as const;

export type AppErrorCode = keyof typeof ALL_ERRORS;
