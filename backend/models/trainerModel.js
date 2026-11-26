import pool from '../config/db.js';

// 3.7.1 Trainer login & change password lookup
export const findTrainerByUsername = async (username) => {
    const [rows] = await pool.query(
        "SELECT u.user_id, u.username, u.password, u.role, u.account_status, t.trainer_id, t.full_name FROM users u LEFT JOIN trainers t ON u.user_id = t.user_id WHERE u.username = ? AND u.role = 'Trainer'",
        [username]
    );
    return rows;
};

// Trainer change password
export const updatePassword = async (userId, hashedPassword) => {
    const [result] = await pool.query(
        "UPDATE users SET password = ? WHERE user_id = ?",
        [hashedPassword, userId]
    );
    return result.affectedRows;
};

export const getNotificationsByUserId = async (userId) => {
    const [rows] = await db.query(
        'SELECT notification_id AS id, notification_type AS type, message AS text, notification_date AS date, is_read AS `read` FROM notifications WHERE user_id = ? ORDER BY notification_date DESC',
        [userId]
    );
    return rows;
};

export const markNotificationsAsRead = async (userId) => {
    const [result] = await db.query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
        [userId]
    );
    return result;
};