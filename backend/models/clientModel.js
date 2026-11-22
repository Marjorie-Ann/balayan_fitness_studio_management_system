import pool from '../config/db.js';

// 2.1.1 Implement client login
export const findClientByUsername = async (username) => {
    const [rows] = await pool.query(
        "SELECT u.user_id, u.username, u.password, u.role, u.account_status, c.client_id, c.full_name, c.email, c.contact_number, c.qr_code FROM users u JOIN clients c ON u.user_id = c.user_id WHERE u.username = ? AND u.role = 'Client'",
        [username]
    );
    return rows;
};

