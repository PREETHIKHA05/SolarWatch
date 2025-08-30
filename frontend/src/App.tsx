

import React, { useState, useEffect } from 'react';
import './App.css';

import Login from './Login';
import Register from './Register';
// ...existing code...

const cities = [
  'Ambattur',
  'Anna Nagar',
  'T Nagar',
  'Velachery',
  'Adyar',
  'Tambaram',
  'Porur',
  'Guindy',
  'Mylapore',
  'Perambur',
];

const buildings = [
  {
    name: 'Aurora Center', location: 'South Field', status: 'maintenance', power: 0, maxPower: 400, efficiency: 0, temperature: 25, color: '#ffd700',
  },
  {
    name: 'Sundial Plaza', location: 'East Field', status: 'online', power: 316, maxPower: 400, efficiency: 79, temperature: 49, color: '#ffd700',
  },
  {
    name: 'Helios Park', location: 'East Field', status: 'offline', power: 0, maxPower: 400, efficiency: 0, temperature: 22, color: '#ffd700',
  },
  {
    name: 'Ambattur Tech Park', location: 'West Field', status: 'online', power: 364, maxPower: 400, efficiency: 91, temperature: 41, color: '#00c853',
  },
  {
    name: 'Anna Nagar Plaza', location: 'West Field', status: 'online', power: 348, maxPower: 400, efficiency: 87, temperature: 44, color: '#00c853',
  },
  {
    name: 'Velachery Mall', location: 'Central Field', status: 'online', power: 304, maxPower: 400, efficiency: 76, temperature: 51, color: '#ffd700',
  },
];
function App() {
  const [page, setPage] = useState('login');
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    async function fetchWeather() {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const apiUrl = import.meta.env.VITE_WEATHER_API_URL;
      try {
        const res = await fetch(`${apiUrl}?q=${selectedCity}&appid=${apiKey}&units=metric`);
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        setWeather(null);
      }
    }
    fetchWeather();
  }, [selectedCity]);

  if (page === 'login') {
    return <Login onLogin={() => setPage('dashboard')} onShowRegister={() => setPage('register')} />;
  }
  if (page === 'register') {
    return <Register onRegister={() => setPage('dashboard')} onShowLogin={() => setPage('login')} />;
  }

  return (
    <>
      {page === 'weather' ? (
          <div className="app-bg">
            <header className="header">
              <span className="logo">☀️ SolarWatch</span>
              <nav>
                <a href="#" onClick={() => setPage('dashboard')}>Dashboard</a>
                <a href="#" onClick={() => setPage('weather')}>Weather</a>
                <a href="#">Settings</a>
              </nav>
            </header>
            <main className="main-content">
              <h1 className="dashboard-title">Weather</h1>
              <div className="city-select-row">
                <span>Selected City:</span>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="city-select"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="weather-row" style={{marginBottom:'32px',width:'100%',display:'flex',justifyContent:'center'}}>
                <div className="weather-card" style={{background:'#23252b',borderRadius:'16px',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',padding:'24px 32px',minWidth:'320px',maxWidth:'340px',color:'#fff',display:'flex',flexDirection:'column',alignItems:'center'}}>
                  {weather ? (
                    <>
                      <div style={{fontSize:'1.2rem',fontWeight:'600'}}>{selectedCity} Weather</div>
                      <div style={{fontSize:'2.2rem',fontWeight:'700',margin:'8px 0'}}>{Math.round(weather.main.temp)}°C</div>
                      <div style={{fontSize:'1.1rem',marginBottom:'6px'}}>{weather.weather[0].main} ({weather.weather[0].description})</div>
                      <div style={{fontSize:'1rem',color:'#ffd700'}}>Humidity: {weather.main.humidity}%</div>
                      <div style={{fontSize:'1rem',color:'#00c853'}}>Wind: {weather.wind.speed} m/s</div>
                      <div style={{fontSize:'1rem',color:'#bdbdbd'}}>Pressure: {weather.main.pressure} hPa</div>
                      <div style={{fontSize:'1rem',color:'#bdbdbd'}}>Feels Like: {Math.round(weather.main.feels_like)}°C</div>
                      <div style={{fontSize:'1rem',color:'#bdbdbd'}}>Min/Max: {Math.round(weather.main.temp_min)}°C / {Math.round(weather.main.temp_max)}°C</div>
                      <div style={{fontSize:'1rem',color:'#bdbdbd'}}>Visibility: {weather.visibility / 1000} km</div>
                      <div style={{fontSize:'1rem',color:'#bdbdbd'}}>Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</div>
                      <div style={{fontSize:'1rem',color:'#bdbdbd'}}>Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</div>
                    </>
                  ) : (
                    <div>Loading weather...</div>
                  )}
                </div>
              </div>
            </main>
          </div>
        ) : (
          <div className="app-bg">
            <header className="header">
              <span className="logo">☀️ SolarWatch</span>
              <nav>
                <a href="#" onClick={() => setPage('dashboard')}>Dashboard</a>
                <a href="#" onClick={() => setPage('weather')}>Weather</a>
                <a href="#">Settings</a>
              </nav>
            </header>
            <main className="main-content">
              <h1 className="dashboard-title">Dashboard</h1>
              <div className="city-select-row">
                <span>Selected City:</span>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="city-select"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <h2 className="section-title">Your Buildings</h2>
              <div className="buildings-row">
                {buildings.map(building => (
                  <div className="building-card" key={building.name}>
                    <div className="panel-header">
                      <span className="panel-title">{building.name}</span>
                      <span className={`panel-status-dot ${building.status}`}></span>
                      <span className="panel-status-label">
                        {building.status === 'online' && 'Online'}
                        {building.status === 'offline' && 'Offline'}
                        {building.status === 'maintenance' && 'Maintenance'}
                      </span>
                    </div>
                    <div className="panel-location">{building.location}</div>
                    <div className="panel-row">
                      <span role="img" aria-label="power">⚡</span> Power Output
                      <span className="panel-value">{building.power}W / {building.maxPower}W</span>
                    </div>
                    <div className="panel-bar-bg">
                      <div className="panel-bar" style={{ width: `${building.power / building.maxPower * 100}%`, background: building.color }}></div>
                    </div>
                    <div className="panel-row">
                      <span role="img" aria-label="efficiency">📊</span> Efficiency
                      <span className="panel-value">{building.efficiency}%</span>
                    </div>
                    <div className="panel-bar-bg">
                      <div className="panel-bar" style={{ width: `${building.efficiency}%`, background: building.efficiency > 0 ? building.color : '#44454a' }}></div>
                    </div>
                    <div className="panel-row">
                      <span role="img" aria-label="expected">📈</span> Expected
                      <span className="panel-value">{building.maxPower}W</span>
                    </div>
                  </div>
                ))}
              </div>
              <h2 className="section-title">Weather</h2>
              <div className="weather-row" style={{marginBottom:'32px',width:'100%',display:'flex',justifyContent:'center'}}>
                <div className="weather-card" style={{background:'#23252b',borderRadius:'16px',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',padding:'24px 32px',minWidth:'320px',maxWidth:'340px',color:'#fff',display:'flex',flexDirection:'column',alignItems:'center'}}>
                  {weather ? (
                    <>
                      <div style={{fontSize:'1.2rem',fontWeight:'600'}}>{selectedCity} Weather</div>
                      <div style={{fontSize:'2.2rem',fontWeight:'700',margin:'8px 0'}}>{Math.round(weather.main.temp)}°C</div>
                      <div style={{fontSize:'1.1rem',marginBottom:'6px'}}>{weather.weather[0].main}</div>
                      <div style={{fontSize:'1rem',color:'#ffd700'}}>Humidity: {weather.main.humidity}%</div>
                      <div style={{fontSize:'1rem',color:'#00c853'}}>Wind: {weather.wind.speed} m/s</div>
                    </>
                  ) : (
                    <div>Loading weather...</div>
                  )}
                </div>
              </div>
              <h2 className="section-title">Analytics</h2>
              <div className="analytics-row">
                <div className="analytics-card">
                  <div>City-wide Generation (kW)</div>
                  <div style={{width:'340px',height:'160px',background:'#23252b',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',color:'#ffd700',fontSize:'1.2rem'}}>Graph Placeholder</div>
                </div>
                <div className="analytics-card">
                  <div>Active vs Inactive Panels</div>
                  <div style={{width:'340px',height:'160px',background:'#23252b',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',color:'#00c853',fontSize:'1.2rem'}}>Graph Placeholder</div>
                </div>
                <div className="analytics-card">
                  <div>Weather vs Output</div>
                  <div style={{width:'340px',height:'160px',background:'#23252b',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',color:'#ffa600',fontSize:'1.2rem'}}>Graph Placeholder</div>
                </div>
              </div>
            </main>
          </div>
        )}
      </>
    );
}

export default App;
