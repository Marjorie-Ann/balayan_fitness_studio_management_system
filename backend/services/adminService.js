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

// 1.2.2 Create Trainer Account
export const createTrainerAccount = async (data) => {
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

    const existingEmail = await adminModel.findTrainerByEmail(email);
    if (existingEmail) {
        throw new ValidationError("Email is already registered to another trainer.", 409);
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save sa database
    const created = await adminModel.insertTrainerAccount({
        full_name,
        email,
        contact_number,
        username,
        hashedPassword
    });

    return {
        trainer_id: created.trainer_id,
        user_id: created.user_id,
        full_name,
        email,
        contact_number,
        username
    };
};

// ==========================================
// 1.3 MEMBERSHIP MANAGEMENT SERVICES
// ==========================================

// Helper: 1.3.2 Determine Active or Expired status from start_date & expiration_date
const computeMembershipStatus = (startDateStr, expirationDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDateStr);
    const expiration = new Date(expirationDateStr);

    if (isNaN(start.getTime()) || isNaN(expiration.getTime())) {
        throw new ValidationError("Invalid start_date or expiration_date format. Use YYYY-MM-DD.", 400);
    }

    if (expiration < start) {
        throw new ValidationError("Expiration date cannot be earlier than start date.", 400);
    }

    // Active if expiration date is today or in the future
    return expiration >= today ? "Active" : "Expired";
};

// 1.3.1 Create Membership Record
export const createMembership = async (membershipData) => {
    const { client_id, membership_type, start_date, expiration_date } = membershipData;

    if (!client_id || !membership_type || !start_date || !expiration_date) {
        throw new ValidationError("All fields (client_id, membership_type, start_date, expiration_date) are required.", 400);
    }

    const client = await adminModel.findClientById(client_id);
    if (!client) {
        throw new ValidationError("Client not found.", 404);
    }

    const status = computeMembershipStatus(start_date, expiration_date);

    const membershipId = await adminModel.createMembership({
        client_id,
        membership_type,
        start_date,
        expiration_date,
        status
    });

    return await adminModel.findMembershipById(membershipId);
};

// 1.3.2 Get All Memberships (syncs statuses first)
export const getAllMemberships = async () => {
    await adminModel.syncMembershipStatuses();
    return await adminModel.getAllMemberships();
};

// 1.3.1 & 1.3.2 Update Membership Record
export const updateMembership = async (membershipId, updateData) => {
    const existing = await adminModel.findMembershipById(membershipId);
    if (!existing) {
        throw new ValidationError("Membership record not found.", 404);
    }

    const membership_type = updateData.membership_type || existing.membership_type;
    const start_date = updateData.start_date || existing.start_date;
    const expiration_date = updateData.expiration_date || existing.expiration_date;

    // Auto-compute status based on dates unless manually overridden with valid value
    let status = computeMembershipStatus(start_date, expiration_date);
    if (updateData.status && ["Active", "Expired"].includes(updateData.status)) {
        status = updateData.status;
    }

    await adminModel.updateMembershipById(membershipId, {
        membership_type,
        start_date,
        expiration_date,
        status
    });

    return await adminModel.findMembershipById(membershipId);
};

export const getAllUsers = async () => {
    return await adminModel.getAllUsers();
};

export const deleteUserAccount = async (userId) => {
    const existingUser = await adminModel.findUserById(userId);
    if (!existingUser) {
        throw new ValidationError("User account not found.", 404);
    }
    await adminModel.deleteUserById(userId);
    return { user_id: existingUser.user_id, username: existingUser.username, role: existingUser.role };
};

// ==========================================
// 1.4 CASH PAYMENT MANAGEMENT SERVICES
// ==========================================

// Helper: Generate unique transaction ID (e.g., TXN-20261120-4821)
const generateTransactionId = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `TXN-${yyyy}${mm}${dd}-${randomPart}`;
};

// 1.4.1 Record Cash Payment
export const recordCashPayment = async (paymentData) => {
    const {
        client_id,
        membership_id,
        amount,
        payment_date,
        payment_method,
        cash_received
    } = paymentData;

    if (!client_id || amount === undefined || amount === null || amount === "") {
        throw new ValidationError("Client ID and payment amount are required.", 400);
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new ValidationError("Payment amount must be greater than 0.", 400);
    }

    // Enforce Cash payment method only
    if (payment_method && payment_method.toLowerCase() !== "cash") {
        throw new ValidationError("Only Cash payments are accepted for this transaction.", 400);
    }

    // Verify client exists
    const client = await adminModel.findClientById(client_id);
    if (!client) {
        throw new ValidationError("Selected client does not exist.", 404);
    }

    // Verify membership exists if membership_id is provided
    if (membership_id) {
        const membership = await adminModel.findMembershipById(membership_id);
        if (!membership) {
            throw new ValidationError("Selected membership record does not exist.", 404);
        }
        if (Number(membership.client_id) !== Number(client_id)) {
            throw new ValidationError("Membership record does not belong to the selected client.", 400);
        }
    }

    // Mark as 'Paid' only after Admin confirms cash has been received
    const isConfirmed = cash_received === true || cash_received === "true" || cash_received === 1;
    const payment_status = isConfirmed ? "Paid" : "Pending";

    const transaction_id = generateTransactionId();

    const paymentId = await adminModel.createPayment({
        transaction_id,
        client_id,
        membership_id: membership_id || null,
        amount: numericAmount.toFixed(2),
        payment_status,
        payment_date: payment_date || null
    });

    return await adminModel.findPaymentById(paymentId);
};

// 1.4.2 View Payment Records (with search and filters)
export const getAllPayments = async (filters) => {
    if (filters?.status && !["Paid", "Pending"].includes(filters.status)) {
        throw new ValidationError("Invalid payment status filter. Use 'Paid' or 'Pending'.", 400);
    }
    return await adminModel.getAllPayments(filters);
};

// Confirm cash received for an existing Pending payment
export const confirmCashPayment = async (paymentId) => {
    const existing = await adminModel.findPaymentById(paymentId);
    if (!existing) {
        throw new ValidationError("Payment record not found.", 404);
    }
    if (existing.payment_status === "Paid") {
        throw new ValidationError("Payment is already marked as Paid.", 400);
    }

    await adminModel.confirmCashPaymentById(paymentId);
    return await adminModel.findPaymentById(paymentId);
};

// ==========================================
// 1.5 QR CODE ATTENDANCE MANAGEMENT SERVICES
// ==========================================

// 1.5.1 Scan and Check QR Code to Record Attendance
export const scanQrAttendance = async (qrCodeInput) => {
    const qrCode = typeof qrCodeInput === "string" ? qrCodeInput.trim() : "";

    if (!qrCode) {
        throw new ValidationError("QR code is required.", 400);
    }

    // 1. Find client account using QR code
    const client = await adminModel.findClientByQrCode(qrCode);
    if (!client) {
        throw new ValidationError("Invalid QR code. No client account found.", 404);
    }

    if (client.account_status !== "Active") {
        throw new ValidationError(`Access denied. ${client.full_name}'s account is inactive.`, 403);
    }

    // 2. Sync membership statuses first so expired dates are up to date
    await adminModel.syncMembershipStatuses();

    // 3. Check if client has an active membership
    const activeMembership = await adminModel.findActiveMembershipByClientId(client.client_id);
    if (!activeMembership) {
        const latest = await adminModel.findLatestMembershipByClientId(client.client_id);
        if (latest) {
            throw new ValidationError(
                `Access denied. ${client.full_name}'s ${latest.membership_type} membership expired on ${latest.expiration_date}.`,
                403
            );
        }
        throw new ValidationError(
            `Access denied. ${client.full_name} has no active membership record.`,
            403
        );
    }

    // 4. Prevent duplicate check-in on the same day
    const existingToday = await adminModel.findTodayAttendanceByClientId(client.client_id);
    if (existingToday) {
        throw new ValidationError(
            `${client.full_name} has already checked in today at ${existingToday.time_in}.`,
            409
        );
    }

    // 5. Record attendance (client_id, CURDATE(), CURTIME())
    const attendanceId = await adminModel.createAttendanceRecord(client.client_id);
    const attendanceRecord = await adminModel.findAttendanceById(attendanceId);

    return {
        ...attendanceRecord,
        membership_type: activeMembership.membership_type,
        expiration_date: activeMembership.expiration_date
    };
};

// 1.5.2 View and Search Attendance Records
export const getAllAttendance = async (filters) => {
    return await adminModel.getAllAttendance(filters);
};