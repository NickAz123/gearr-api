import { Inject, Injectable } from "@nestjs/common";
import { Pool, PoolClient } from "pg";

import { PG_POOL } from "../database/database.constants";
import { buildSetClause, ColumnMap } from "../database/sql-builder";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PublicUser, User, UserWithSettings } from "./entities/user.entity";

/** Request keys the API permits on an update, mapped to their columns. */
const UPDATABLE_COLUMNS: ColumnMap = {
    firstName: "first_name",
    lastName: "last_name",
    userName: "username",
    email: "email",
};

const PUBLIC_COLUMNS = "id, first_name, last_name, username, email";

/** Direct port of `models/userModels.js`. All SQL for `users` lives here. */
@Injectable()
export class UsersRepository {
    constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

    async findAll(): Promise<User[]> {
        const result = await this.pool.query<User>(
            "SELECT * FROM users WHERE is_deleted = FALSE",
        );
        return result.rows;
    }

    async findById(id: number): Promise<User | undefined> {
        const result = await this.pool.query<User>(
            "SELECT * FROM users WHERE id = $1 AND is_deleted = FALSE LIMIT 1",
            [id],
        );
        return result.rows[0];
    }

    async findByIdWithSettings(
        id: number,
    ): Promise<UserWithSettings | undefined> {
        const result = await this.pool.query<UserWithSettings>(
            `SELECT u.*, us.unit_of_measure, us.user_type_id
             FROM users u
             LEFT JOIN users_settings us ON us.user_id = u.id
             WHERE u.id = $1 AND u.is_deleted = FALSE
             LIMIT 1`,
            [id],
        );
        return result.rows[0];
    }

    /**
     * Inserts the user and its default settings row.
     *
     * The Express version issued these as two independent statements, so a
     * failure on the settings insert left a user with no settings. They now run
     * in one transaction.
     */
    async create(
        firstName: string,
        lastName: string,
        userName: string,
        passwordHash: string,
        email: string,
    ): Promise<PublicUser> {
        return this.withTransaction(async (client) => {
            const result = await client.query<PublicUser>(
                `INSERT INTO users (first_name, last_name, username, password, email)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING ${PUBLIC_COLUMNS}`,
                [firstName, lastName, userName, passwordHash, email],
            );

            const created = result.rows[0];
            await client.query(
                "INSERT INTO users_settings (user_id) VALUES ($1)",
                [created.id],
            );

            return created;
        });
    }

    /** Returns `null` when the body carried no updatable field. */
    async update(
        id: number,
        fields: UpdateUserDto,
    ): Promise<PublicUser | null> {
        const { assignments, values, nextIndex } = buildSetClause(
            UPDATABLE_COLUMNS,
            fields,
        );

        if (assignments.length === 0) {
            return null;
        }

        assignments.push("last_updated = NOW()");
        values.push(id);

        const result = await this.pool.query<PublicUser>(
            `UPDATE users
             SET ${assignments.join(", ")}
             WHERE id = $${nextIndex} AND is_deleted = FALSE
             RETURNING ${PUBLIC_COLUMNS}, last_updated`,
            values,
        );

        return result.rows[0] ?? null;
    }

    async updatePassword(
        id: number,
        newPasswordHash: string,
    ): Promise<{ id: number } | undefined> {
        // The Express version returned `result.row[0]` (a typo for `rows`),
        // which threw on every call and surfaced as USER_UPDATE_FAIL.
        const result = await this.pool.query<{ id: number }>(
            `UPDATE users
             SET password = $1, last_updated = NOW()
             WHERE id = $2 AND is_deleted = FALSE
             RETURNING id`,
            [newPasswordHash, id],
        );
        return result.rows[0];
    }

    async softDelete(id: number): Promise<{ id: number } | undefined> {
        const result = await this.pool.query<{ id: number }>(
            "UPDATE users SET is_deleted = TRUE WHERE id = $1 RETURNING id",
            [id],
        );
        return result.rows[0];
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
