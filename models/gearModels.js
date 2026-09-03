import pool from '../db.js';

export async function getGearById(id){
    const result = await pool.query(`SELECT * FROM gear WHERE is_deleted = false AND id = $1 LIMIT 1;`, {id});
    return result.rows[0];
}

export async function getGearByUserId(id){
    const result = await pool.query(`SELECT * FROM gear WHERE is_deleted = false AND user_id = $1;`, {id});
    return result.rows;
}