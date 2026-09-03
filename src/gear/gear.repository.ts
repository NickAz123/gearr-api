import { Inject, Injectable } from "@nestjs/common";
import { Pool, PoolClient } from "pg";

import { PG_POOL } from "../database/database.constants";
import { buildInsertClause, ColumnMap } from "../database/sql-builder";
import { CreateGearDto } from "./dto/create-gear.dto";
import { CreatedGear, Gear } from "./entities/gear.entity";

/** Request keys the API permits on a create, mapped to their columns. */
const INSERTABLE_COLUMNS: ColumnMap = {
    name: "name",
    brand: "brand",
    model: "model",
    purchaseDate: "purchase_date",
    usage: "usage_km",
    notes: "notes",
};

const RETURNED_COLUMNS =
    "id, user_id, name, brand, model, purchase_date, usage_km, notes, last_updated";

/** Direct port of `models/gearModels.js`. All SQL for `gear` lives here. */
@Injectable()
export class GearRepository {
    constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

    async findById(id: number): Promise<Gear | undefined> {
        const result = await this.pool.query<Gear>(
            "SELECT * FROM gear WHERE is_deleted = FALSE AND id = $1 LIMIT 1",
            [id],
        );
        return result.rows[0];
    }

    async findByUserId(userId: number): Promise<Gear[]> {
        const result = await this.pool.query<Gear>(
            "SELECT * FROM gear WHERE is_deleted = FALSE AND user_id = $1",
            [userId],
        );
        return result.rows;
    }

    /**
     * Inserts the gear and its companion `gear_health` row. As with users, the
     * two statements now share a transaction so a half-created record cannot be
     * left behind.
     */
    async create(userId: number, fields: CreateGearDto): Promise<CreatedGear> {
        const { columns, placeholders, values } = buildInsertClause(
            INSERTABLE_COLUMNS,
            fields,
            {
                columns: ["user_id"],
                placeholders: ["$1"],
                values: [userId],
                nextIndex: 2,
            },
        );

        // Always stamp creation/update time.
        columns.push("last_updated");
        placeholders.push("NOW()");

        return this.withTransaction(async (client) => {
            const result = await client.query<CreatedGear>(
                `INSERT INTO gear (${columns.join(", ")})
                 VALUES (${placeholders.join(", ")})
                 RETURNING ${RETURNED_COLUMNS}`,
                values,
            );

            const created = result.rows[0];
            await client.query(
                "INSERT INTO gear_health (gear_id) VALUES ($1)",
                [created.id],
            );

            return created;
        });
    }

    private async withTransaction<T>(
        work: (client: PoolClient) => Promise<T>,
    ): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            const result = await work(client);
            await client.query("COMMIT");
            return result;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
}
