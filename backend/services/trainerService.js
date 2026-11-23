import * as trainerModel from '../models/trainerModel.js';
import ValidationError from '../utils/ValidationError.js';

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