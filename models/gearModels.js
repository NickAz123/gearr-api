import pool from '../db.js';

export async function getGearById(id){
    const result = await pool.query(`SELECT * FROM gear WHERE is_deleted = false AND id = $1 LIMIT 1;`, [id]);
    return result.rows[0];
}

export async function getGearByUserId(id){
    const result = await pool.query(`SELECT * FROM gear WHERE is_deleted = false AND user_id = $1;`, [id]);
    return result.rows;
}

export async function addGear(userId, fields){
    const allowedFields = {
        name: "name",
        brand: "brand",
        model: "model", 
        purchaseDate: "purchase_date",
        usage: "usage_km",
        notes: "notes"
    }

    const columns = ["user_id"];
    const placeholders = ["$1"];
    const values = [userId];
    let paramIndex = 2;

    for (const [key, column] of Object.entries(allowedFields)) {
        if (fields[key] != undefined) {
            columns.push(column);
            placeholders.push(`$${paramIndex}`);
            values.push(fields[key]);
            paramIndex++;
        }
    }

    // Always stamp creation/update time
    columns.push("last_updated");
    placeholders.push("NOW()");

    const query = `INSERT INTO gear (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING id, user_id, name, brand, model, purchase_date, usage_km, notes, last_updated`;

    const result = await pool.query(query, values);

    const newId = result.rows[0].id;
    await addGearHealth(newId);
    
    return result.rows[0];

}

//Private
async function addGearHealth(id){
    return await pool.query(`INSERT INTO gear_health (gear_id) VALUES ($1)`, [id]);
}