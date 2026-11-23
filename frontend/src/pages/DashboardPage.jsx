import React, { useState } from 'react';

export default function DashboardPage({ trainerName = 'Trainer', onLogout }) {
  // Search & Notifications
  const [search, setSearch] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([
    'New appointment request from Juan Dela Cruz (Tomorrow, 8:00 AM)',
    'New appointment request from Lhea Bathan (May 20, 2:00 PM)'
  ]);

  // Available Slots
  const [slots, setSlots] = useState([
    { id: 1, date: '2026-05-20', time: '08:00 AM - 09:00 AM', status: 'Open' },
    { id: 2, date: '2026-05-20', time: '10:00 AM - 11:00 AM', status: 'Booked' },
    { id: 3, date: '2026-05-21', time: '02:00 PM - 03:00 PM', status: 'Open' }
  ]);
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('08:00 AM - 09:00 AM');

  // Appointment Requests
  const [appointments, setAppointments] = useState([
    { id: 1, client: 'Juan Dela Cruz', date: '2026-05-20', time: '08:00 AM - 09:00 AM', status: 'Pending' },
    { id: 2, client: 'Marjorie Dela Cuesta', date: '2026-05-20', time: '10:00 AM - 11:00 AM', status: 'Accepted' },
    { id: 3, client: 'Lhea Bathan', date: '2026-05-21', time: '02:00 PM - 03:00 PM', status: 'Pending' }
  ]);

  // Fitness Progress & BMI
  const [clientName, setClientName] = useState('Juan Dela Cruz');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [remarks, setRemarks] = useState('');
  const [progressList, setProgressList] = useState([
    { id: 1, client: 'Juan Dela Cruz', height: 172, weight: 71.5, bmi: '24.2 (Normal)', remarks: 'Good upper-body progress' },
    { id: 2, client: 'Lhea Bathan', height: 162, weight: 68.0, bmi: '25.9 (Overweight)', remarks: 'Continue 3x cardio' }
  ]);

  // Live BMI Calculation
  let bmiResult = '';
  if (height > 0 && weight > 0) {
    const m = height / 100;
    const bmi = (weight / (m * m)).toFixed(1);
    let label = 'Normal';
    if (bmi < 18.5) label = 'Underweight';
    else if (bmi >= 25 && bmi < 30) label = 'Overweight';
    else if (bmi >= 30) label = 'Obese';
    bmiResult = `${bmi} (${label})`;
  }

  // Add Available Slot
  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!slotDate) return;
    setSlots([...slots, { id: Date.now(), date: slotDate, time: slotTime, status: 'Open' }]);
    setSlotDate('');
  };

  // Delete Slot
  const handleDeleteSlot = (id) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  // Accept or Reject Appointment
  const handleUpdateStatus = (id, newStatus) => {
    setAppointments(
      appointments.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  // Save Fitness Progress
  const handleSaveProgress = (e) => {
    e.preventDefault();
    if (!height || !weight || !remarks) return;
    setProgressList([
      { id: Date.now(), client: clientName, height, weight, bmi: bmiResult, remarks },
      ...progressList
    ]);
    setHeight('');
    setWeight('');
    setRemarks('');
  };

  // Simple Search Filter
  const keyword = search.toLowerCase();
  const filteredAppointments = appointments.filter(
    (a) => a.client.toLowerCase().includes(keyword) || a.status.toLowerCase().includes(keyword)
  );
  const filteredSlots = slots.filter(
    (s) => s.date.includes(keyword) || s.time.toLowerCase().includes(keyword)
  );
  const filteredProgress = progressList.filter(
    (p) => p.client.toLowerCase().includes(keyword) || p.remarks.toLowerCase().includes(keyword)
  );

  return (
    <div className="dash-wrapper">
      {/* TOP BAR */}
      <header className="dash-header">
        <div>
          <h2>BALAYAN FITNESS STUDIO</h2>
          <small>Trainer Dashboard — Welcome, {trainerName}</small>
        </div>

        <input
          type="text"
          className="dash-search"
          placeholder="Search client, date, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="dash-actions">
          <div className="notif-box">
            <button type="button" onClick={() => setShowNotif(!showNotif)}>
              Notifications ({notifications.length})
            </button>
            {showNotif && (
              <div className="notif-menu">
                {notifications.length === 0 ? (
                  <p>No notifications</p>
                ) : (
                  notifications.map((n, index) => <p key={index}>{n}</p>)
                )}
                {notifications.length > 0 && (
                  <button type="button" onClick={() => setNotifications([])}>
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>

          <button type="button" className="btn-logout" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="dash-content">
        {/* SUMMARY CARDS */}
        <div className="summary-row">
          <div className="summary-card">
            <span>Pending Requests</span>
            <h3>{appointments.filter((a) => a.status === 'Pending').length}</h3>
          </div>
          <div className="summary-card">
            <span>Accepted Sessions</span>
            <h3>{appointments.filter((a) => a.status === 'Accepted').length}</h3>
          </div>
          <div className="summary-card">
            <span>Open Slots</span>
            <h3>{slots.filter((s) => s.status === 'Open').length}</h3>
          </div>
          <div className="summary-card">
            <span>Progress Logs</span>
            <h3>{progressList.length}</h3>
          </div>
        </div>

        {/* 1. APPOINTMENT REQUESTS */}
        <section className="dash-box">
          <h3>Appointment Requests</h3>
          <table className="simple-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((app) => (
                <tr key={app.id}>
                  <td>{app.client}</td>
                  <td>{app.date}</td>
                  <td>{app.time}</td>
                  <td>{app.status}</td>
                  <td>
                    {app.status === 'Pending' ? (
                      <>
                        <button className="btn-accept" onClick={() => handleUpdateStatus(app.id, 'Accepted')}>
                          Accept
                        </button>
                        <button className="btn-reject" onClick={() => handleUpdateStatus(app.id, 'Rejected')}>
                          Reject
                        </button>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 2. AVAILABLE SLOTS OF TRAINER */}
        <section className="dash-box">
          <h3>Available Slots of Trainer</h3>
          <form className="inline-form" onSubmit={handleAddSlot}>
            <input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              required
            />
            <select value={slotTime} onChange={(e) => setSlotTime(e.target.value)}>
              <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
              <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
            </select>
            <button type="submit" className="btn-gold">Add Slot</button>
          </form>

          <table className="simple-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.map((slot) => (
                <tr key={slot.id}>
                  <td>{slot.date}</td>
                  <td>{slot.time}</td>
                  <td>{slot.status}</td>
                  <td>
                    {slot.status === 'Open' ? (
                      <button className="btn-reject" onClick={() => handleDeleteSlot(slot.id)}>
                        Remove
                      </button>
                    ) : (
                      <span>Booked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 3. FITNESS PROGRESS & BMI */}
        <section className="dash-box">
          <h3>Fitness Progress &amp; BMI</h3>
          <form className="inline-form" onSubmit={handleSaveProgress}>
            <select value={clientName} onChange={(e) => setClientName(e.target.value)}>
              <option value="Juan Dela Cruz">Juan Dela Cruz</option>
              <option value="Marjorie Dela Cuesta">Marjorie Dela Cuesta</option>
              <option value="Lhea Bathan">Lhea Bathan</option>
            </select>

            <input
              type="number"
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />

            <input
              type="number"
              step="0.1"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Trainer remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
            />

            <button type="submit" className="btn-gold">Save</button>
          </form>

          {bmiResult && (
            <p className="bmi-live">
              Calculated BMI: <strong>{bmiResult}</strong>
            </p>
          )}

          <table className="simple-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Height</th>
                <th>Weight</th>
                <th>BMI</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredProgress.map((item) => (
                <tr key={item.id}>
                  <td>{item.client}</td>
                  <td>{item.height} cm</td>
                  <td>{item.weight} kg</td>
                  <td><strong>{item.bmi}</strong></td>
                  <td>{item.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}