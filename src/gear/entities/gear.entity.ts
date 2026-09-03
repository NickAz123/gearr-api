/** A row of the `gear` table. */
export interface Gear {
    id: number;
    user_id: number;
    name: string;
    brand: string | null;
    model: string | null;
    purchase_date: Date | null;
    usage_km: string | null;
    notes: string | null;
    created_at: Date;
    retired_at: Date | null;
    last_updated: Date | null;
    is_deleted: boolean;
    status_id: number;
}

/** The projection returned by `PUT /gear/:id`. */
export type CreatedGear = Pick<
    Gear,
    | "id"
    | "user_id"
    | "name"
    | "brand"
    | "model"
    | "purchase_date"
    | "usage_km"
    | "notes"
    | "last_updated"
>;
