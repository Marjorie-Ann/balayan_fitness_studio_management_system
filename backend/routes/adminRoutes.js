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

// 1.2.2 Create Trainer Account
router.post("/trainers", createTrainerAccount);

// User Management
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUserAccount);

// 1.3.1 & 1.3.2 Membership Management
router.post("/memberships", createMembership);
router.get("/memberships", getAllMemberships);
router.put("/memberships/:id", updateMembership);


export default router;