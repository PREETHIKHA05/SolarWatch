import React, { useState } from 'react';

export default function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="centered-form">
      <div className="form-card">
        <h2>Welcome back</h2>
        <p>Login to your SolarWatch dashboard</p>
        <label>Email</label>
        <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="primary-btn" onClick={() => onLogin(email, password)}>Login</button>
        <div className="form-footer">
          New here? <span className="link" onClick={onShowRegister}>Register a new building</span>
        </div>
      </div>
    </div>
  );
}
