import * as trainerService from '../services/trainerService.js';

// 3.7.1 trainer login/Signin backend
export const login = async (req, res) => {
    const { username, password } = req.body;
    const user = { username, password };

    try {
        const result = await trainerService.login(user);
        res.status(200).json({
            success: true,
            message: result.message,
            trainer: result.trainer
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
};

// Trainer change password
export const changePassword = async (req, res) => {
    const { username, newPassword, confirmPassword } = req.body;
    const data = { username, newPassword, confirmPassword };

    try {
        const result = await trainerService.changePassword(data);
        res.status(200).json({
            success: true,
            message: result
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
};

// Trainer Notification
export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await trainerService.fetchNotifications(req.params.userId);
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

export const markAllRead = async (req, res, next) => {
    try {
        const message = await trainerService.readAllNotifications(req.params.userId);
        res.status(200).json({ message });
    } catch (error) {
        next(error);
    }
};

export const getAppointments = async (req, res, next) => {
    try {
        const data = await trainerService.fetchAppointments(req.params.userId);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

export const updateAppointment = async (req, res, next) => {
    try {
        const { status, rejection_reason } = req.body;
        const message = await trainerService.changeAppointmentStatus(req.params.appointmentId, status, rejection_reason);
        res.status(200).json({ message });
    } catch (error) {
        next(error);
    }
};

export const getAvailability = async (req, res, next) => {
    try {
        const data = await trainerService.fetchAvailability(req.params.userId);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

export const postAvailability = async (req, res) => {
    try {
        const newSlot = await trainerService.addAvailability(req.params.userId, req.body);
        res.status(201).json(newSlot);
    } catch (e) {
        res.status(e.statusCode || 500).json({
            error: e.message || "Failed to add availability"
        });
    }
};

export const deleteAvailability = async (req, res) => {
    try {
        const message = await trainerService.removeAvailability(req.params.availabilityId);
        res.status(200).json({ message });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            error: e.message || "Failed to delete availability"
        });
    }
};

export const getAllTrainers = async (req, res, next) => {
    try {
        const trainers = await trainerService.fetchAllTrainers();
        res.status(200).json(trainers);
    } catch (error) {
        next(error);
    }
};