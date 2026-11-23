import * as trainerService from '../services/trainerService.js';

// 3.7.1 trainer login/Signin backend
export const login = async (req, res) => {
    const { username, password } = req.body;
    const user = { username, password };

    try {
        const result = await trainerService.login(user);
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