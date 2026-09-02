import pool from '../db.js';

export async function getAllUsers() {
    const result = await pool.query('SELECT * FROM USERS WHERE IS_DELETED = FALSE');
    return result.rows;
}

export async function getUserById(id){
    const result = await pool.query(`SELECT * FROM USERS WHERE ID = $1 AND IS_DELETED = FALSE LIMIT 1`,[id]);
    return result.rows[0];
}

export async function getUserWithSettingsById(id){
    const result = await pool.query(`SELECT u.*, us.unit_of_measure, us.user_type_id FROM USERS u LEFT JOIN USERS_SETTINGS us ON us.user_id = u.id WHERE u.id = $1 AND u.is_deleted = FALSE LIMIT 1`,[id]);
    return result.rows[0];
}

export async function addUser(firstName, lastName, userName, password, email){
    const result = await pool.query(`INSERT INTO USERS (first_name, last_name, username, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, username, email`, [firstName, lastName, userName, password, email] )

    const newId = result.rows[0].id;

    await addUserSettings(newId);

    return result.rows[0];
}

export async function updateUser(id, fields){
    const allowedFields = {
        firstName: "first_name",
        lastName: "last_name",
        userName: "username",
        email: "email"
    }

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key,column] of Object.entries(allowedFields)){
        if (fields[key] != undefined){
            setClause.push(`${column} = $${paramIndex}`);
            values.push(fields[key]);
            paramIndex++;
        }
    }

    if (setClause.length === 0){
        return null;
    }

    setClause.push(`last_updated = NOW()`);
    values.push(id);

    const query = `UPDATE USERS
    SET ${setClause.join(',')} 
    WHERE id = $${paramIndex} 
    RETURNING id, first_name, last_name, username, email, last_updated`

    const result = await pool.query(query, values); 
    return result.rows[0]; 
}

export async function updateUserPassword(id, newPasswordHash){
    const result = await pool.query(`UPDATE users SET password = $1 WHERE id = $2 RETURNING id`,[newPasswordHash, id]);
    return result.row[0]
}

export async function softDeleteUser(id){
    const result = await pool.query(`UPDATE USERS SET IS_DELETED = TRUE WHERE ID = $1 RETURNING id`, [id]);
    return result;
}   

//Private
async function addUserSettings(id){
    return await pool.query(`INSERT INTO USERS_SETTINGS (user_id) VALUES ($1);`, [id])
}