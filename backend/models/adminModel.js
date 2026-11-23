import pool from "../config/db.js";
const db = pool;

// ==================== DASHBOARD SUMMARY (1.1.1) ====================

export const countRegisteredMembers = async () => {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM clients");
    return rows[0].total;
};

export const countActiveMemberships = async () => {
    const [rows] = await pool.query(`
        SELECT COUNT(*) AS total
        FROM memberships m
        INNER JOIN (
            SELECT client_id, MAX(membership_id) AS latest_id
            FROM memberships
            GROUP BY client_id
        ) latest ON m.membership_id = latest.latest_id
        WHERE m.status = 'Active'
    `);
    return rows[0].total;
};

export const countExpiredMemberships = async () => {
    const [rows] = await pool.query(`
        SELECT COUNT(*) AS total
        FROM memberships m
        INNER JOIN (
            SELECT client_id, MAX(membership_id) AS latest_id
            FROM memberships
            GROUP BY client_id
        ) latest ON m.membership_id = latest.latest_id
        WHERE m.status = 'Expired'
    `);
    return rows[0].total;
};

export const countTodayAttendance = async () => {
    const [rows] = await pool.query(
        "SELECT COUNT(*) AS total FROM attendance WHERE attendance_date = CURDATE()"
    );
    return rows[0].total;
};

