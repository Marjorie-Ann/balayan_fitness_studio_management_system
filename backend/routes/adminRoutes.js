import express from "express";
import {
    getDashboardSummary,
    createClientAccount,
    createTrainerAccount,
    getAllClients,
    getAllUsers,
    deleteUserAccount,
    createMembership,
    getAllMemberships,
    updateMembership,
    recordCashPayment,
    getAllPayments,
    confirmCashPayment,
    scanQrAttendance,
    getAllAttendance
} from "../controller/adminController.js";

const router = express.Router();

// 1.1.1 Display Dashboard Summary
router.get("/dashboard-summary", getDashboardSummary);

// 1.2.1 Create Client Account
router.post("/clients", createClientAccount);
router.get("/clients", getAllClients);


export default router;