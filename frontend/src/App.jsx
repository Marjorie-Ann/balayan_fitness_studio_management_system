import React, { useState } from 'react';
import SignInPage from './pages/SignInPage';
import ChangePassword from './pages/ChangePassword';
import DashboardPage from './pages/DashboardPage';
import './style.css';

export default function App() {
  const [page, setPage] = useState('signin');
  const [trainerName, setTrainerName] = useState('Trainer');

  if (page === 'dashboard') {
    return (
      <DashboardPage
        trainerName={trainerName}
        onLogout={() => setPage('signin')}
      />
    );
  }

  return (
    <div className="app-wrapper">
      {page === 'signin' ? (
        <SignInPage
          onGoToChangePassword={() => setPage('changepass')}
          onLoginSuccess={(name) => {
            setTrainerName(name);
            setPage('dashboard');
          }}
        />
      ) : (
        <ChangePassword onBackToSignIn={() => setPage('signin')} />
      )}
    </div>
  );
}