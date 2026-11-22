import * as clientModel from '../models/clientModel.js';
import ValidationError from '../utils/ValidationError.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';

// 2.1.1 Implement client login and logout
export const login = async (user) => {
    if (!user.username || !user.password) {
        throw new ValidationError("Username and password required", 400);
    }

    const existing = await clientModel.findClientByUsername(user.username);

    if (existing.length === 0) {
        throw new ValidationError("Invalid username or password", 400);
    }

    const client = existing[0];

    if (client.account_status !== 'Active') {
        throw new ValidationError("Account is inactive. Please contact admin.", 403);
    }

    const isCorrectPassword = await bcrypt.compare(user.password, client.password);

    if (!isCorrectPassword) {
        throw new ValidationError("Invalid username or password", 400);
    }

    return {
        user_id: client.user_id,
        client_id: client.client_id,
        username: client.username,
        full_name: client.full_name,
        role: client.role
    };
};

export const logout = async () => {
    return "Logout successful";
};

