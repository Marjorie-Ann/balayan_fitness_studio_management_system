import { useState, useEffect } from "react";

const DashboardPage = ({ trainer, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);

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
    return (
      app.full_name.toLowerCase().includes(keyword) ||
      app.appointment_date.toLowerCase().includes(keyword) ||
      app.appointment_status.toLowerCase().includes(keyword)
    );
  });

  const markAllAsRead = async () => {
    await fetch(`http://localhost:3000/trainer/notifications/${userId}/read`, {
      method: "PUT",
    });
    setNotifications(notifications.map((n) => ({ ...n, read: 1 })));
  };

  const handleAppointmentAction = async (id, newStatus) => {
    let reason = null;
    if (newStatus === "Rejected") {
      reason = prompt("Enter reason for rejection (optional):") || null;
    }

    await fetch(`http://localhost:3000/trainer/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, rejection_reason: reason }),
    });

    setAppointments(
      appointments.map((app) =>
        app.appointment_id === id
          ? { ...app, appointment_status: newStatus, rejection_reason: reason }
          : app
      )
    );
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
                      <td>{app.start_time} - {app.end_time}</td>
                      <td>
                        <strong>{app.appointment_status}</strong>
                        {app.rejection_reason && (
                          <p style={{ color: "#dc2626", fontSize: "12px", margin: 0 }}>
                            Reason: {app.rejection_reason}
                          </p>
                        )}
                      </td>
                      <td>
                        {app.appointment_status === "Pending" ? (
                          <>
                            <button
                              className="btn-accept"
                              onClick={() =>
                                handleAppointmentAction(app.appointment_id, "Accepted")
                              }
                            >
                              Accept
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() =>
                                handleAppointmentAction(app.appointment_id, "Rejected")
                              }
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span>Done</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;