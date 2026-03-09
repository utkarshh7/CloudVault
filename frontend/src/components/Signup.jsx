import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Signup({ onSwitch }) {
  const { signup, confirmSignup, login } = useAuth();
  const [step, setStep] = useState("signup"); // signup | confirm
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signup(email, password);
      setStep("confirm");
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmSignup(email, code);
      // Auto-login after confirmation
      await login(email, password);
    } catch (err) {
      setError(err.message || "Confirmation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="url(#g2)" />
            <path d="M14 20l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="g2" x1="4" y1="4" x2="36" y2="36">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <span>CloudVault</span>
        </div>

        {step === "signup" ? (
          <>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Your private cloud drive awaits</p>

            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?
              <button onClick={onSwitch}>Sign in</button>
            </div>
          </>
        ) : (
          <>
            <h1 className="auth-title">Verify your email</h1>
            <p className="auth-subtitle">
              We sent a code to <strong style={{color: 'var(--text)'}}>{email}</strong>
            </p>

            <form onSubmit={handleConfirm}>
              <div className="form-group">
                <label className="form-label">Verification code</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  required
                  style={{ fontFamily: 'var(--mono)', letterSpacing: '0.2em', fontSize: '1.1rem' }}
                />
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Verifying…" : "Verify & sign in"}
              </button>
            </form>

            <div className="auth-switch">
              <button onClick={() => setStep("signup")}>← Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
