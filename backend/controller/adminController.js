import * as adminService from "../services/adminService.js";
import ValidationError from "../utils/ValidationError.js";

// 1.1.1 Display Dashboard Summary
export const getDashboardSummary = async (req, res) => {
    try {
        const summary = await adminService.getDashboardSummary();
        res.status(200).json({
            success: true,
            message: "Dashboard summary retrieved successfully.",
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard summary.",
            error: error.message
        });
    }
};

