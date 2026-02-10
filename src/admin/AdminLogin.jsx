import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = () => {
    if (password === 'admin123') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      alert('Invalid password');
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5'}}>
      <div className="card" style={{padding: '40px', maxWidth: '400px', width: '100%'}}>
        <h1>Admin Login</h1>
        <p style={{marginBottom: '20px'}}>Enter password to continue</p>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyPress={e => e.key === 'Enter' && login()} />
        <button className="btn btn-primary" style={{width: '100%', marginTop: '15px'}} onClick={login}>Login</button>
        <p style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>Default password: admin123</p>
      </div>
    </div>
  );
}
