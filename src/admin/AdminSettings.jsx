import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  
  useEffect(() => {
    fetch('/api/admin/settings').then(res => res.json()).then(setSettings);
  }, []);

  const saveSettings = async () => {
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    alert('Settings saved!');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content"><h1>Settings</h1></div>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/prices">Manage Prices</Link>
          <Link to="/admin/offers">Manage Offers</Link>
          <Link to="/admin/orders">View Orders</Link>
          <Link to="/admin/settings" className="active">Settings</Link>
        </nav>
      </header>
      <main className="admin-content">
        <div className="settings-form card">
          <h3>Site Information</h3>
          <label>Site Name</label>
          <input value={settings.siteName || ''} onChange={e => setSettings({...settings, siteName: e.target.value})} />
          
          <label>Email</label>
          <input value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} />
          
          <label>Phone</label>
          <input value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} />
          
          <h3 style={{marginTop: '30px'}}>API Configuration</h3>
          <label>Email API Key</label>
          <textarea rows="3" value={settings.apiKeys?.email || ''} onChange={e => setSettings({...settings, apiKeys: {...settings.apiKeys, email: e.target.value}})} />
          
          <label>SMS API Key</label>
          <textarea rows="3" value={settings.apiKeys?.sms || ''} onChange={e => setSettings({...settings, apiKeys: {...settings.apiKeys, sms: e.target.value}})} />
          
          <label>Payment Gateway API Key</label>
          <textarea rows="3" value={settings.apiKeys?.payment || ''} onChange={e => setSettings({...settings, apiKeys: {...settings.apiKeys, payment: e.target.value}})} />
          
          <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>
        </div>
      </main>
    </div>
  );
}
