import { useState, useEffect } from "react";

// 12-hour format (6:00 AM - 10:00 PM) 
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
};

const DashboardPage = ({ trainer, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // States para sa Appointment Review & Rejection Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const trainerName = trainer?.full_name || trainer?.username || "Trainer";
  const userId = trainer?.user_id;

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:3000/trainer/notifications/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      });

    fetch(`http://localhost:3000/trainer/appointments/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAppointments(data);
      });
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    const keyword = searchQuery.toLowerCase();
    return (
      n.text.toLowerCase().includes(keyword) ||
      n.type.toLowerCase().includes(keyword)
    );
  });

  const filteredAppointments = appointments.filter((app) => {
    const keyword = searchQuery.toLowerCase();
    const withinGymHours =
      app.start_time >= "06:00:00" && app.end_time <= "22:00:00";

    return (
      withinGymHours &&
      (app.full_name.toLowerCase().includes(keyword) ||
        app.appointment_date.toLowerCase().includes(keyword) ||
        app.appointment_status.toLowerCase().includes(keyword))
    );
  });

  const markAllAsRead = async () => {
    await fetch(`http://localhost:3000/trainer/notifications/${userId}/read`, {
      method: "PUT",
    });
    setNotifications(notifications.map((n) => ({ ...n, read: 1 })));
  };

  const openReviewModal = (app) => {
    setSelectedApp(app);
    setRejectionReason(app.rejection_reason || "");
  };

  const closeReviewModal = () => {
    setSelectedApp(null);
    setRejectionReason("");
  };

  const handleAppointmentAction = async (id, newStatus) => {
    const reasonToSave =
      newStatus === "Rejected" ? rejectionReason.trim() : null;

    if (newStatus === "Rejected" && !reasonToSave) {
      alert("Please type the reason for rejecting this appointment.");
      return;
    }

    await fetch(`http://localhost:3000/trainer/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        rejection_reason: reasonToSave,
      }),
    });

    setAppointments(
      appointments.map((app) =>
        app.appointment_id === id
          ? {
              ...app,
              appointment_status: newStatus,
              rejection_reason: reasonToSave,
            }
          : app
      )
    );

    closeReviewModal();
  };

  return (
    <div className="dash-wrapper">
      <header className="dash-header">
        <h2>Welcome, {trainerName}</h2>

        <input
          type="text"
          className="dash-search"
          placeholder="Search notifications, clients, appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="dash-actions">
          <div className="notif-box">
            <button onClick={() => setShowNotif(!showNotif)}>
              Notifications ({unreadCount})
            </button>

            {showNotif && (
              <div className="notif-menu">
                {filteredNotifications.length === 0 ? (
                  <p>No notifications found</p>
                ) : (
                  filteredNotifications.map((n) => (
                    <p
                      key={n.id}
                      style={{ fontWeight: n.read ? "normal" : "bold" }}
                    >
                      <strong>[{n.type}]</strong> {n.text}
                    </p>
                  ))
                )}

                {unreadCount > 0 && (
                  <button onClick={markAllAsRead}>Mark all as read</button>
                )}
              </div>
            )}
          </div>

          <button onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      <main className="dash-content">
        <div className="dash-box">
          <h3>Appointment Requests</h3>

          <div className="table-scroll">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: "#666" }}>
                      No appointment requests found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((app) => (
                    <tr key={app.appointment_id}>
                      <td>{app.full_name}</td>
                      <td>{app.appointment_date.split("T")[0]}</td>
                      <td>
                        {formatTime(app.start_time)} - {formatTime(app.end_time)}
                      </td>
                      <td>
                        <strong>{app.appointment_status}</strong>
                        {app.rejection_reason && (
                          <p
                            style={{
                              color: "#dc2626",
                              fontSize: "12px",
                              margin: "4px 0 0",
                            }}
                          >
                            Reason: {app.rejection_reason}
                          </p>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-review"
                          onClick={() => openReviewModal(app)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Appointment Review & Rejection Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Appointment Review</h3>

            <div className="review-details">
              <p>
                <strong>Client Name:</strong> {selectedApp.full_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedApp.email || "N/A"}
              </p>
              <p>
                <strong>Contact Number:</strong>{" "}
                {selectedApp.contact_number || "N/A"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedApp.appointment_date.split("T")[0]}
              </p>
              <p>
                <strong>Time:</strong> {formatTime(selectedApp.start_time)} -{" "}
                {formatTime(selectedApp.end_time)}
              </p>
              <p>
                <strong>Current Status:</strong>{" "}
                {selectedApp.appointment_status}
              </p>
              {selectedApp.rejection_reason && (
                <p style={{ color: "#dc2626" }}>
                  <strong>Rejection Reason:</strong>{" "}
                  {selectedApp.rejection_reason}
                </p>
              )}
            </div>

            {selectedApp.appointment_status === "Pending" ? (
              <div className="reject-section">
                <label htmlFor="rejectReason">
                  <strong>Reason for Rejection (required if rejecting):</strong>
                </label>
                <textarea
                  id="rejectReason"
                  rows="3"
                  placeholder="Type your reason here (e.g., Schedule conflict, fully booked)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />

                <div className="modal-buttons">
                  <button
                    className="btn-accept"
                    onClick={() =>
                      handleAppointmentAction(
                        selectedApp.appointment_id,
                        "Accepted"
                      )
                    }
                  >
                    Accept
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() =>
                      handleAppointmentAction(
                        selectedApp.appointment_id,
                        "Rejected"
                      )
                    }
                  >
                    Reject
                  </button>
                  <button className="btn-close" onClick={closeReviewModal}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-buttons">
                <button className="btn-close" onClick={closeReviewModal}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;