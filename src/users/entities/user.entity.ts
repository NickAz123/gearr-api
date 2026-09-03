/** A row of the `users` table. */
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    email: string;
    created_at: Date;
    last_updated: Date;
    is_deleted: boolean;
}

/** The projection returned by write endpoints — never includes the hash. */
export type PublicUser = Omit<
    User,
    "password" | "created_at" | "is_deleted"
> & { last_updated?: Date };

/** `users` joined with `users_settings`, as served by `GET /users/:id?settings=true`. */
export interface UserWithSettings extends User {
    unit_of_measure: string | null;
    user_type_id: number | null;
}
