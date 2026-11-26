import { useState } from 'react';

// 2.1.1 Logout, 2.1.2 Change Password Trigger, 2.5.1 Client Notifications
const ClientHeader = ({ client, notifications, onMarkRead, onOpenPassword, onLogout }) => {
    const [openNotif, setOpenNotif] = useState(false);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const handleLogout = async () => {
        await fetch('http://localhost:3000/client/logout', { method: 'POST' }).catch(() => {});
        localStorage.removeItem('clientUser');
        onLogout();
    };

    return (
        <div className="dash-header">
            <div>
                <h2>BALAYAN FITNESS STUDIO</h2>
                <small>Client Dashboard • {client.full_name} (@{client.username})</small>
            </div>

            <div className="dash-actions">
                {/* 2.5.1 Notifications */}
                <div className="notif-box">
                    <button type="button" onClick={() => setOpenNotif(!openNotif)}>
                        Notifications {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>

                    {openNotif && (
                        <div className="notif-menu">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong>Notifications</strong>
                                <span className="obj-tag">2.5.1</span>
                            </div>

                            {notifications.length === 0 ? (
                                <p style={{ fontSize: '12px', color: '#666' }}>No notifications yet.</p>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.notification_id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                                        <strong>{n.title}</strong>
                                        <span>{n.message}</span>
                                        <small>{new Date(n.created_at).toLocaleString()}</small>
                                        {!n.is_read && (
                                            <button className="read-btn" onClick={() => onMarkRead(n.notification_id)}>
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* 2.1.2 Change Password */}
                <button type="button" onClick={onOpenPassword}>Change Password</button>

                {/* 2.1.1 Logout */}
                <button type="button" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default ClientHeader;