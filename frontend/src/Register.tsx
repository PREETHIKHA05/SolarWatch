import React, { useState } from 'react';

export default function Register({ onRegister, onShowLogin }) {
  const [buildingName, setBuildingName] = useState('');
  const [city, setCity] = useState('');
  const [meterId, setMeterId] = useState('');
  const [numPanels, setNumPanels] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="centered-form">
      <div className="form-card">
        <h2>Register a new building</h2>
        <p>Create your account and add your first site</p>
        <div className="form-row">
          <div>
            <label>Building Name</label>
            <input type="text" placeholder="e.g., Horizon Tower" value={buildingName} onChange={e => setBuildingName(e.target.value)} />
          </div>
          <div>
            <label>City / Location</label>
            <input type="text" placeholder="e.g., Austin" value={city} onChange={e => setCity(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Smart Meter ID</label>
            <input type="text" placeholder="e.g., SM-9031221" value={meterId} onChange={e => setMeterId(e.target.value)} />
          </div>
          <div>
            <label>Number of Solar Panels</label>
            <input type="number" placeholder="e.g., 120" value={numPanels} onChange={e => setNumPanels(e.target.value)} />
          </div>
        </div>
        <label>Contact Email</label>
        <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="primary-btn" onClick={() => onRegister({ buildingName, city, meterId, numPanels, email, password })}>Register</button>
        <div className="form-footer">
          Already have an account? <span className="link" onClick={onShowLogin}>Back to login</span>
        </div>
      </div>
    </div>
  );
}
