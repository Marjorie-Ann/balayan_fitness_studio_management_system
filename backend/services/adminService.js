import bcrypt from "bcryptjs";
import crypto from "crypto";
import QRCode from "qrcode";
import * as adminModel from "../models/adminModel.js";
import ValidationError from "../utils/ValidationError.js";

// ==================== DASHBOARD SUMMARY (1.1.1) ====================

export const getDashboardSummary = async () => {
    await adminModel.syncMembershipStatuses();

    const totalRegisteredMembers = await adminModel.countRegisteredMembers();
    const activeMemberships = await adminModel.countActiveMemberships();
    const expiredMemberships = await adminModel.countExpiredMemberships();
    const todayAttendance = await adminModel.countTodayAttendance();

    return {
        totalRegisteredMembers,
        activeMemberships,
        expiredMemberships,
        todayAttendance
    };
};

// Get all clients for frontend dropdown selection
export const getAllClients = async () => {
    return await adminModel.getAllClients();
};

