import { useState } from "react";
import FormContainer from "../components/FormContainer";
import HeaderContainer from "../components/HeaderContainer";

const SignInPage = ({ onGoToChangePassword }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleSignIn = (e) => {
    e.preventDefault();
    setStatus({
      type: "error",
      text: "Sign In is not yet functional.",
    });
    setUsername("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <FormContainer>
      <HeaderContainer subtitle="Trainer Portal Sign In" />

      {status.text && (
        <p className={`status-message ${status.type}`}>{status.text}</p>
      )}

      <form onSubmit={handleSignIn} autoComplete="off">
        <div className="input-fields">
          <label htmlFor="SignInUsername">Username</label>
          <input
            type="text"
            id="SignInUsername"
            name="SignInUsername"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-fields">
          <label htmlFor="SignInPassword">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="SignInPassword"
              name="SignInPassword"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                /* Nakabukas na mata (kapag nakikita ang password) */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                /* Mata na may slash (kapag nakatago ang password) */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <button type="submit">Sign In</button>
          <button type="button" onClick={onGoToChangePassword}>Change Password</button>
        </div>
      </form>
    </FormContainer>
    
  );
};

export default SignInPage;