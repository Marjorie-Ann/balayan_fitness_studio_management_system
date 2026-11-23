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

// ==================== ACCOUNT CREATION (1.2) ====================

// read - check kung existing na ang username sa users table
export const findUserByUsername = async (username) => {
    const [rows] = await pool.query(
        "SELECT user_id FROM users WHERE username = ?",
        [username]
    );
    return rows[0];
};

// read - check kung existing na ang email sa clients table
export const findClientByEmail = async (email) => {
    const [rows] = await pool.query(
        "SELECT client_id FROM clients WHERE email = ?",
        [email]
    );
    return rows[0];
};

// read - check kung existing na ang email sa trainers table
export const findTrainerByEmail = async (email) => {
    const [rows] = await pool.query(
        "SELECT trainer_id FROM trainers WHERE email = ?",
        [email]
    );
    return rows[0];
};

// insert - 1.2.1 Create Client Account (users + clients table)
export const insertClientAccount = async (clientData) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert sa `users` table
        const [userResult] = await connection.query(
            "INSERT INTO users (username, password, role, account_status) VALUES (?, ?, 'Client', 'Active')",
            [clientData.username, clientData.hashedPassword]
        );
        const userId = userResult.insertId;

        // 2. Insert sa `clients` table
        const [clientResult] = await connection.query(
            "INSERT INTO clients (user_id, full_name, email, contact_number, qr_code) VALUES (?, ?, ?, ?, ?)",
            [userId, clientData.full_name, clientData.email, clientData.contact_number, clientData.qr_code]
        );
        const clientId = clientResult.insertId;

        await connection.commit();
        return { user_id: userId, client_id: clientId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// insert - 1.2.2 Create Trainer Account (users + trainers table)
export const insertTrainerAccount = async (trainerData) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert sa `users` table
        const [userResult] = await connection.query(
            "INSERT INTO users (username, password, role, account_status) VALUES (?, ?, 'Trainer', 'Active')",
            [trainerData.username, trainerData.hashedPassword]
        );
        const userId = userResult.insertId;

        // 2. Insert sa `trainers` table
        const [trainerResult] = await connection.query(
            "INSERT INTO trainers (user_id, full_name, email, contact_number) VALUES (?, ?, ?, ?)",
            [userId, trainerData.full_name, trainerData.email, trainerData.contact_number]
        );
        const trainerId = trainerResult.insertId;

        await connection.commit();
        return { user_id: userId, trainer_id: trainerId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Get all clients (for Frontend dropdowns in Membership & Cash Payment forms)
export const getAllClients = async () => {
    const [rows] = await db.query(`
        SELECT 
            c.client_id,
            c.user_id,
            c.full_name,
            c.email,
            c.contact_number,
            c.qr_code,
            u.account_status
        FROM clients c
        INNER JOIN users u ON c.user_id = u.user_id
        ORDER BY c.full_name ASC
    `);
    return rows;
};

