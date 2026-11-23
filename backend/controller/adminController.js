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
// ==========================================
// 1.3 MEMBERSHIP MANAGEMENT CONTROLLERS
// ==========================================

// 1.3.1 Create Membership
export const createMembership = async (req, res) => {
    try {
        const membership = await adminService.createMembership(req.body);
        res.status(201).json({
            success: true,
            message: "Membership record created successfully.",
            data: membership
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
            message: "Failed to create membership record.",
            error: error.message
        });
    }
};

// 1.3.2 Get All Memberships (with auto-checked Active/Expired status)
export const getAllMemberships = async (req, res) => {
    try {
        const memberships = await adminService.getAllMemberships();
        res.status(200).json({
            success: true,
            message: "Membership records retrieved successfully.",
            data: memberships
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve membership records.",
            error: error.message
        });
    }
};

// 1.3.1 Update Membership
export const updateMembership = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMembership = await adminService.updateMembership(id, req.body);
        res.status(200).json({
            success: true,
            message: "Membership record updated successfully.",
            data: updatedMembership
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
            message: "Failed to update membership record.",
            error: error.message
        });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        res.status(200).json({ success: true, message: "User accounts retrieved successfully.", data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve user accounts.", error: error.message });
    }
};

export const deleteUserAccount = async (req, res) => {
    try {
        const deletedUser = await adminService.deleteUserAccount(req.params.id);
        res.status(200).json({ success: true, message: "User account deleted successfully.", data: deletedUser });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Failed to delete user account.", error: error.message });
    }
};

// ==========================================
// 1.4 CASH PAYMENT MANAGEMENT CONTROLLERS
// ==========================================

// 1.4.1 Record Cash Payment
export const recordCashPayment = async (req, res) => {
    try {
        const payment = await adminService.recordCashPayment(req.body);
        const statusMsg = payment.payment_status === "Paid"
            ? "Cash payment confirmed and recorded as Paid."
            : "Payment saved as Pending (awaiting Admin cash receipt confirmation).";

        res.status(201).json({
            success: true,
            message: statusMsg,
            data: payment
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
            message: "Failed to record cash payment.",
            error: error.message
        });
    }
};

// 1.4.2 View Payment Records (Search & Filter)
export const getAllPayments = async (req, res) => {
    try {
        const { search, date, status } = req.query;
        const payments = await adminService.getAllPayments({ search, date, status });
        res.status(200).json({
            success: true,
            message: "Payment records retrieved successfully.",
            data: payments
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
            message: "Failed to retrieve payment records.",
            error: error.message
        });
    }
};

// Confirm Cash Received (marks Pending payment as Paid)
export const confirmCashPayment = async (req, res) => {
    try {
        const payment = await adminService.confirmCashPayment(req.params.id);
        res.status(200).json({
            success: true,
            message: "Cash payment confirmed and marked as Paid.",
            data: payment
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
            message: "Failed to confirm cash payment.",
            error: error.message
        });
    }
};

