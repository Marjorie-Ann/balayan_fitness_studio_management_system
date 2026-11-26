import React, { useState } from 'react';
import SignInPage from './pages/SignInPage';
import ChangePassword from './pages/ChangePassword';
import DashboardPage from './pages/DashboardPage';
import './style.css';

export default function App() {
  const [page, setPage] = useState('signin');
  const [trainer, setTrainer] = useState(null);

  if (page === 'dashboard') {
    return (
      <DashboardPage
        trainer={trainer}
        onLogout={() => {
          setTrainer(null);
          setPage('signin');
        }}
      />
    );
  }

  return (
    <div className="app-wrapper">
      {page === 'signin' ? (
        <SignInPage
          onGoToChangePassword={() => setPage('changepass')}
          onLoginSuccess={(loggedTrainer) => {
            setTrainer(loggedTrainer);
            setPage('dashboard');
          }}
        />
      ) : (
        <ChangePassword onBackToSignIn={() => setPage('signin')} />
      )}
    </div>
  );
}