import { useState } from 'react';

// 2.1.1 Implement client login
const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:3000/client/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (!res.ok) return setError(data.error || 'Invalid login details');

            localStorage.setItem('clientUser', JSON.stringify(data.message));
            onLogin(data.message);
        } catch {
            setError('Cannot connect to server.');
        }
    };

    return (
        <section id="formContainer">
            <header>
                <h1>Balayan Fitness Studio</h1>
                <small>2.1.1 Client Portal Access</small>
            </header>

            {error && <p className="status-message error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                />

                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                    <input
                        id="password"
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowPass(!showPass)}>
                        {showPass ? 'Hide' : 'Show'}
                    </button>
                </div>

                <button type="submit">Log In</button>
            </form>
        </section>
    );
};

export default LoginForm;