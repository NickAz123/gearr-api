/**
 * Helpers for the "allow-list driven dynamic SQL" pattern the API is built on:
 * a map of camelCase request keys -> snake_case columns decides which of the
 * caller's fields reach the database, and every value goes in as a placeholder.
 *
 * Extracted from the near-duplicate loops in the old `userModels.updateUser`
 * and `gearModels.addGear`.
 */
export type ColumnMap = Readonly<Record<string, string>>;

/** Any plain object (a DTO, a parsed body) whose keys are matched against the map. */
export type PartialFields = object;

function read(fields: PartialFields, key: string): unknown {
    return (fields as Record<string, unknown>)[key];
}

export interface SetClause {
    /** e.g. `['first_name = $1', 'email = $2']` */
    assignments: string[];
    values: unknown[];
    /** The next free placeholder index. */
    nextIndex: number;
}

/** Builds the `SET` assignments of an `UPDATE` from the supplied fields. */
export function buildSetClause(
    columnMap: ColumnMap,
    fields: PartialFields,
    startIndex = 1,
): SetClause {
    const assignments: string[] = [];
    const values: unknown[] = [];
    let paramIndex = startIndex;

    for (const [key, column] of Object.entries(columnMap)) {
        const value = read(fields, key);

        if (value !== undefined && value !== null) {
            assignments.push(`${column} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    return { assignments, values, nextIndex: paramIndex };
}

export interface InsertClause {
    columns: string[];
    placeholders: string[];
    values: unknown[];
    nextIndex: number;
}

/** Builds the column/placeholder/value triple of an `INSERT` from the fields. */
export function buildInsertClause(
    columnMap: ColumnMap,
    fields: PartialFields,
    seed: InsertClause = {
        columns: [],
        placeholders: [],
        values: [],
        nextIndex: 1,
    },
): InsertClause {
    const columns = [...seed.columns];
    const placeholders = [...seed.placeholders];
    const values = [...seed.values];
    let paramIndex = seed.nextIndex;

    for (const [key, column] of Object.entries(columnMap)) {
        const value = read(fields, key);

        if (value !== undefined && value !== null) {
            columns.push(column);
            placeholders.push(`$${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    return { columns, placeholders, values, nextIndex: paramIndex };
}
