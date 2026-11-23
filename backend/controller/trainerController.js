import * as trainerService from '../services/trainerService.js';

// Implement trainer login
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