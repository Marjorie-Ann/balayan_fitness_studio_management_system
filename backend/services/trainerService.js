import * as trainerModel from '../models/trainerModel.js';
import ValidationError from '../utils/ValidationError.js';
import bcrypt from 'bcryptjs';

// Trainer login and logout (hindi pa functional ang login - stub/placeholder pa lang)
export const login = async (user) => {
    if (!user.username || !user.password) {
        throw new ValidationError("Username and password required", 400);
    }

    throw new ValidationError("Trainer login is not yet enabled.", 501);
};

export const logout = async () => {
    return "Logout successful";
};

// Trainer change password (walang currentPassword at walang length/strength limit)
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

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(data.newPassword, salt);

    await trainerModel.updatePassword(trainer.user_id, hashedPassword);
    return "Password updated successfully";
};