import { useState, useEffect } from "react";

const DashboardPage = ({ trainer, onLogout }) => {
  const [showNotif, setShowNotif] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const trainerName = trainer?.full_name || trainer?.username || "Trainer";
  const userId = trainer?.user_id;

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:3000/trainer/notifications/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((err) => console.error("Error fetching notifications:", err));
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      await fetch(`http://localhost:3000/trainer/notifications/${userId}/read`, {
        method: "PUT",
      });
      setNotifications(notifications.map((n) => ({ ...n, read: 1 })));
    } catch (err) {
      console.error("Error updating notifications:", err);
    }
  };

  return (
    <div className="dash-wrapper">
      <header className="dash-header">
        <h2>Welcome, {trainerName}</h2>

        <div className="dash-actions">
          <div className="notif-box">
            <button onClick={() => setShowNotif(!showNotif)}>
              Notifications ({unreadCount})
            </button>

            {showNotif && (
              <div className="notif-menu">
                {notifications.length === 0 ? (
                  <p>No notifications</p>
                ) : (
                  notifications.map((n) => (
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
        {/* Notifications lang muna ang laman */}
      </main>
    </div>
  );
};

export default DashboardPage;