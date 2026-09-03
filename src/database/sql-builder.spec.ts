import { buildInsertClause, buildSetClause, ColumnMap } from "./sql-builder";

const COLUMNS: ColumnMap = {
    firstName: "first_name",
    email: "email",
};

describe("buildSetClause", () => {
    it("only emits assignments for supplied fields", () => {
        const { assignments, values, nextIndex } = buildSetClause(COLUMNS, {
            email: "a@b.c",
        });

        expect(assignments).toEqual(["email = $1"]);
        expect(values).toEqual(["a@b.c"]);
        expect(nextIndex).toBe(2);
    });

    it("ignores keys outside the allow-list", () => {
        const { assignments } = buildSetClause(COLUMNS, {
            is_deleted: true,
            firstName: "Jane",
        });

        expect(assignments).toEqual(["first_name = $1"]);
    });
});

describe("buildInsertClause", () => {
    it("appends to the seed columns and continues the placeholder sequence", () => {
        const clause = buildInsertClause(
            COLUMNS,
            { firstName: "Jane", email: "a@b.c" },
            {
                columns: ["user_id"],
                placeholders: ["$1"],
                values: [7],
                nextIndex: 2,
            },
        );

        expect(clause.columns).toEqual(["user_id", "first_name", "email"]);
        expect(clause.placeholders).toEqual(["$1", "$2", "$3"]);
        expect(clause.values).toEqual([7, "Jane", "a@b.c"]);
    });
});
