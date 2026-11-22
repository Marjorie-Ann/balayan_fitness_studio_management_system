import * as clientService from '../services/clientService.js';

// 2.1.1 Implement client login and logout
export const login = async (req, res) => {
    const { username, password } = req.body;
    const user = { username, password };

    try {
        const result = await clientService.login(user);
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

export const logout = async (req, res) => {
    try {
        const result = await clientService.logout();
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

