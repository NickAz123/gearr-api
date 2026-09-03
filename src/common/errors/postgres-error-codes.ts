/**
 * The subset of PostgreSQL SQLSTATE codes the API reacts to.
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_NOT_NULL_VIOLATION = "23502";

/** Narrows an unknown thrown value to something carrying a SQLSTATE `code`. */
export function pgErrorCode(err: unknown): string | undefined {
    if (typeof err === "object" && err !== null && "code" in err) {
        const { code } = err as { code?: unknown };
        return typeof code === "string" ? code : undefined;
    }
    return undefined;
}
