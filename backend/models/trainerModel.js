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

// Get notifications
export const getNotificationsByUserId = async (userId) => {
    const [rows] = await pool.query(
        'SELECT notification_id AS id, notification_type AS type, message AS text, notification_date AS date, is_read AS `read` FROM notifications WHERE user_id = ? ORDER BY notification_date DESC',
        [userId]
    );
    return rows;
};

// Mark notifications as read
export const markNotificationsAsRead = async (userId) => {
    const [result] = await pool.query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
        [userId]
    );
    return result;
};

// Get appointment requests (newest at top)
export const getAppointmentsByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT a.appointment_id, a.client_id, a.appointment_date, a.start_time, a.end_time, a.appointment_status, a.rejection_reason, c.full_name
         FROM appointments a
         JOIN trainers t ON a.trainer_id = t.trainer_id
         JOIN clients c ON a.client_id = c.client_id
         WHERE t.user_id = ?
         ORDER BY a.appointment_id DESC`,
        [userId]
    );
    return rows;
};

// Accept or Reject appointment request
export const updateAppointmentStatus = async (appointmentId, status, rejectionReason = null) => {
    const [result] = await pool.query(
        'UPDATE appointments SET appointment_status = ?, rejection_reason = ? WHERE appointment_id = ?',
        [status, rejectionReason, appointmentId]
    );
    return result.affectedRows;
};