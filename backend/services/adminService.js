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

// ==================== ACCOUNT CREATION (1.2) ====================

// 1.2.1 Create Client Account
export const createClientAccount = async (data) => {
    const { full_name, email, contact_number, username, password } = data;

    // 1. Check required fields
    if (!full_name || !email || !contact_number || !username || !password) {
        throw new ValidationError("All fields (full_name, email, contact_number, username, password) are required.");
    }

    // 2. Check contact_number length (varchar(11) sa database)
    if (contact_number.length > 11) {
        throw new ValidationError("Contact number must not exceed 11 digits.");
    }

    // 3. Check kung existing na ang username o email
    const existingUser = await adminModel.findUserByUsername(username);
    if (existingUser) {
        throw new ValidationError("Username is already taken.", 409);
    }

    const existingEmail = await adminModel.findClientByEmail(email);
    if (existingEmail) {
        throw new ValidationError("Email is already registered to another client.", 409);
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Generate unique QR code value (e.g., BFS-CLT-A1B2C3D4)
    const uniqueCode = `BFS-CLT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // 6. Save sa database
    const created = await adminModel.insertClientAccount({
        full_name,
        email,
        contact_number,
        username,
        hashedPassword,
        qr_code: uniqueCode
    });

    // 7. Generate scannable QR Code image (Base64 Data URL) para ma-display agad sa frontend
    const qrCodeImage = await QRCode.toDataURL(uniqueCode);

    return {
        client_id: created.client_id,
        user_id: created.user_id,
        full_name,
        email,
        contact_number,
        username,
        qr_code: uniqueCode,
        qr_code_image: qrCodeImage
    };
};

