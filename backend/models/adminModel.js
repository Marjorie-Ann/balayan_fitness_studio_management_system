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

// ==========================================
// 1.3 MEMBERSHIP MANAGEMENT
// ==========================================

// Check if client exists
export const findClientById = async (clientId) => {
    const [rows] = await db.query("SELECT * FROM clients WHERE client_id = ?", [clientId]);
    return rows[0];
};

// 1.3.2 Sync expired memberships automatically based on current date
export const syncMembershipStatuses = async () => {
    await db.query(`
        UPDATE memberships 
        SET status = 'Expired' 
        WHERE expiration_date < CURDATE() AND status = 'Active'
    `);
    await db.query(`
        UPDATE memberships 
        SET status = 'Active' 
        WHERE expiration_date >= CURDATE() AND start_date <= CURDATE() AND status = 'Expired'
    `);
};

// 1.3.1 Create Membership Record
export const createMembership = async ({ client_id, membership_type, start_date, expiration_date, status }) => {
    const [result] = await db.query(
        `INSERT INTO memberships (client_id, membership_type, start_date, expiration_date, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [client_id, membership_type, start_date, expiration_date, status]
    );
    return result.insertId;
};

// Get all memberships (with client info)
export const getAllMemberships = async () => {
    const [rows] = await db.query(`
        SELECT 
            m.membership_id,
            m.client_id,
            c.full_name,
            c.email,
            c.contact_number,
            c.qr_code,
            m.membership_type,
            DATE_FORMAT(m.start_date, '%Y-%m-%d') AS start_date,
            DATE_FORMAT(m.expiration_date, '%Y-%m-%d') AS expiration_date,
            m.status      
        FROM memberships m
        INNER JOIN clients c ON m.client_id = c.client_id
        ORDER BY m.membership_id DESC
    `);
    return rows;
};

// Find single membership by ID
export const findMembershipById = async (membershipId) => {
    const [rows] = await db.query(
        `SELECT 
            m.membership_id,
            m.client_id,
            c.full_name,
            m.membership_type,
            DATE_FORMAT(m.start_date, '%Y-%m-%d') AS start_date,
            DATE_FORMAT(m.expiration_date, '%Y-%m-%d') AS expiration_date,
            m.status
         FROM memberships m
         INNER JOIN clients c ON m.client_id = c.client_id
         WHERE m.membership_id = ?`,
        [membershipId]
    );
    return rows[0];
};

// 1.3.1 Update Membership Record
export const updateMembershipById = async (membershipId, { membership_type, start_date, expiration_date, status }) => {
    const [result] = await db.query(
        `UPDATE memberships 
         SET membership_type = ?, start_date = ?, expiration_date = ?, status = ?
         WHERE membership_id = ?`,
        [membership_type, start_date, expiration_date, status, membershipId]
    );
    return result.affectedRows;
};

export const getAllUsers = async () => {
    const [rows] = await db.query(`
        SELECT 
            u.user_id, u.username, u.role, u.account_status,
            COALESCE(c.full_name, t.full_name, 'System Admin') AS full_name,
            COALESCE(c.email, t.email) AS email,
            COALESCE(c.contact_number, t.contact_number) AS contact_number
        FROM users u
        LEFT JOIN clients c ON u.user_id = c.user_id
        LEFT JOIN trainers t ON u.user_id = t.user_id
        ORDER BY u.user_id DESC
    `);
    return rows;
};

export const findUserById = async (userId) => {
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    return rows[0];
};

export const deleteUserById = async (userId) => {
    const [result] = await db.query("DELETE FROM users WHERE user_id = ?", [userId]);
    return result.affectedRows;
};

