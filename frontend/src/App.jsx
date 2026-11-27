import React, { useState } from 'react';
import WelcomePage from './pages/WelcomePage';
import SignInPage from './pages/SignInPage';
import ChangePassword from './pages/ChangePassword';
import DashboardPage from './pages/DashboardPage';
import './style.css';

export default function App() {
  const [page, setPage] = useState('welcome');
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('welcome');
  };

  if (page === 'welcome') {
    return <WelcomePage onEnterLogin={() => setPage('signin')} />;
  }

  if (page === 'dashboard' && currentUser) {
    const role = currentUser.role?.toLowerCase();

    // Temporary placeholder habang ginagawa pa ng mga kasama mo ang Admin at Client dashboards
    if (role === 'admin' || role === 'client') {
      return (
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1 className="welcome-title">
              <span>{role.toUpperCase()}</span> Dashboard
            </h1>
            <p className="welcome-subtitle">
              Under development. Once ready, your teammates can connect their
              page component here.
            </p>
            <div className="welcome-actions">
              <button
                type="button"
                className="btn-welcome-login"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Trainer Dashboard
    return <DashboardPage trainer={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="app-wrapper">
      {page === 'signin' ? (
        <SignInPage
          onBackToWelcome={() => setPage('welcome')}
          onGoToChangePassword={() => setPage('changepass')}
          onLoginSuccess={(loggedUser) => {
            setCurrentUser(loggedUser);
            setPage('dashboard');
          }}
        />
      ) : (
        <ChangePassword onBackToSignIn={() => setPage('signin')} />
      )}
    </div>
  );
}