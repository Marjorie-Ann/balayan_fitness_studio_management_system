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

// 1.2.1 Create Client Account
export const createClientAccount = async (req, res) => {
    try {
        const newClient = await adminService.createClientAccount(req.body);
        res.status(201).json({
            success: true,
            message: "Client account created successfully.",
            data: newClient
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to create client account.",
            error: error.message
        });
    }
};

// 1.2.2 Create Trainer Account
export const createTrainerAccount = async (req, res) => {
    try {
        const newTrainer = await adminService.createTrainerAccount(req.body);
        res.status(201).json({
            success: true,
            message: "Trainer account created successfully.",
            data: newTrainer
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to create trainer account.",
            error: error.message
        });
    }
};

// Get all clients (for Frontend dropdowns)
export const getAllClients = async (req, res) => {
    try {
        const clients = await adminService.getAllClients();
        res.status(200).json({
            success: true,
            message: "Clients retrieved successfully.",
            data: clients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve clients.",
            error: error.message
        });
    }
};
