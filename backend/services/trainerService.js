import * as trainerModel from '../models/trainerModel.js';
import ValidationError from '../utils/ValidationError.js';

const MAX_CLIENTS_PER_TRAINER = 35;

// Trainer login (plain text password check)
export const login = async (user) => {
    if (!user.username || !user.password) {
        throw new ValidationError("Username and password are required", 400);
    }

    const existing = await trainerModel.findTrainerByUsername(user.username);

    if (existing.length === 0) {
        throw new ValidationError("Trainer account not found.", 404);
    }

    const trainer = existing[0];

    if (trainer.account_status !== 'Active') {
        throw new ValidationError("Account is inactive. Please contact admin.", 403);
    }

    if (trainer.password !== user.password) {
        throw new ValidationError("Invalid username or password.", 401);
    }

    return {
        message: "Login successful",
        trainer: {
            user_id: trainer.user_id,
            username: trainer.username,
            full_name: trainer.full_name || trainer.username
        }
    };
};

export const logout = async () => {
    return "Logout successful";
};

// Trainer change password (plain text)
export const changePassword = async (data) => {
    if (!data.username || !data.newPassword || !data.confirmPassword) {
        throw new ValidationError("All fields are required", 400);
    }

    if (data.newPassword !== data.confirmPassword) {
        throw new ValidationError("New password and confirm password do not match", 400);
    }

    const existing = await trainerModel.findTrainerByUsername(data.username);

    if (existing.length === 0) {
        throw new ValidationError("Trainer account not found. Please contact admin.", 404);
    }

    const trainer = existing[0];

    if (trainer.account_status !== 'Active') {
        throw new ValidationError("Account is inactive. Please contact admin.", 403);
    }

    await trainerModel.updatePassword(trainer.user_id, data.newPassword);
    return "Password updated successfully";
};

export const fetchNotifications = async (userId) => {
    return await trainerModel.getNotificationsByUserId(userId);
};

export const readAllNotifications = async (userId) => {
    await trainerModel.markNotificationsAsRead(userId);
    return "All notifications marked as read";
};

export const fetchAppointments = async (userId) => {
    return await trainerModel.getAppointmentsByUserId(userId);
};

export const changeAppointmentStatus = async (appointmentId, status, rejectionReason) => {
    if (!['Accepted', 'Rejected'].includes(status)) {
        throw new ValidationError("Invalid appointment status.", 400);
    }

    if (status === 'Rejected' && (!rejectionReason || !rejectionReason.trim())) {
        throw new ValidationError("Rejection reason is required.", 400);
    }

    // Kapag i-a-Accept, i-check kung lagpas na sa 35 clients ang trainer
    if (status === 'Accepted') {
        const appointment = await trainerModel.getAppointmentDetails(appointmentId);
        if (!appointment) {
            throw new ValidationError("Appointment not found.", 404);
        }

        const { activeClients, isExistingClient } = await trainerModel.getTrainerClientStats(
            appointment.trainer_id,
            appointment.client_id
        );

        if (!isExistingClient && activeClients >= MAX_CLIENTS_PER_TRAINER) {
            throw new ValidationError(
                `Trainer has already reached the maximum limit of ${MAX_CLIENTS_PER_TRAINER} clients. Please reject and advise the client to select another available trainer.`,
                400
            );
        }
    }

    await trainerModel.updateAppointmentStatus(
        appointmentId,
        status,
        status === 'Rejected' ? rejectionReason.trim() : null
    );
    return "Appointment updated";
};

export const fetchAllTrainers = async () => {
    return await trainerModel.getAllTrainers();
};

export const fetchAvailability = async (userId) => {
    return await trainerModel.getAvailabilityByUserId(userId);
};

export const addAvailability = async (userId, data) => {
    const { trainer_id, available_date, start_time, end_time } = data;

    if (!trainer_id || !available_date || !start_time || !end_time) {
        throw new ValidationError("Trainer, date, start time, and end time are required.", 400);
    }

    // Check kung umabot na sa 35 clients ang napiling trainer
    const { activeClients } = await trainerModel.getTrainerClientStats(trainer_id);
    if (activeClients >= MAX_CLIENTS_PER_TRAINER) {
        throw new ValidationError(
            `This trainer already handles ${MAX_CLIENTS_PER_TRAINER}/${MAX_CLIENTS_PER_TRAINER} clients (Full). Please select another available trainer.`,
            400
        );
    }

    // Bawal ang nakalipas na petsa
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (available_date < todayStr) {
        throw new ValidationError("Cannot add availability for a past date.", 400);
    }

    if (start_time < "06:00" || end_time > "22:00") {
        throw new ValidationError("Schedule must be between 6:00 AM and 10:00 PM only.", 400);
    }

    if (start_time >= end_time) {
        throw new ValidationError("End time must be after start time.", 400);
    }

    try {
        const created = await trainerModel.createAvailabilitySlot(trainer_id, available_date, start_time, end_time);
        if (!created) {
            throw new ValidationError("Selected trainer not found.", 404);
        }
        return {
            availability_id: created.insertId,
            trainer_id: created.trainer_id,
            user_id: created.user_id,
            full_name: created.full_name,
            available_date,
            start_time,
            end_time,
            slot_status: 'Available'
        };
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new ValidationError("This trainer already has this exact schedule slot.", 400);
        }
        throw err;
    }
};

export const removeAvailability = async (availabilityId) => {
    const deleted = await trainerModel.deleteAvailabilitySlot(availabilityId);
    if (deleted === 0) {
        throw new ValidationError("Cannot delete a booked or non-existent slot.", 400);
    }
    return "Availability slot deleted";
};