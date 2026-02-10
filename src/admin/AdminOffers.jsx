import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', discount: 0, category: '',
    startDate: '', endDate: '', active: true
  });

  useEffect(() => {
    fetch('/api/admin/offers')
      .then(res => res.json())
      .then(setOffers);
  }, []);

  const saveOffer = async () => {
    await fetch('/api/admin/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowForm(false);
    fetch('/api/admin/offers').then(res => res.json()).then(setOffers);
  };

  const deleteOffer = async (id) => {
    if (confirm('Delete this offer?')) {
      await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
      setOffers(offers.filter(o => o.id !== id));
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Offers Management</h1>
        </div>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/prices">Manage Prices</Link>
          <Link to="/admin/offers" className="active">Manage Offers</Link>
          <Link to="/admin/orders">View Orders</Link>
          <Link to="/admin/settings">Settings</Link>
        </nav>
      </header>
      
      <main className="admin-content">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Create New Offer
        </button>

        {showForm && (
          <div className="offer-form card" style={{marginTop: '20px'}}>
            <h3>New Offer</h3>
            <input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <input type="number" placeholder="Discount %" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
            <input placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            <button className="btn btn-primary" onClick={saveOffer}>Save Offer</button>
          </div>
        )}

        <div className="offers-grid" style={{marginTop: '20px'}}>
          {offers.map(offer => (
            <div key={offer.id} className="offer-card card">
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <div><strong>{offer.discount}% OFF</strong></div>
              <p>Valid: {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}</p>
              <div style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
                <button className="btn btn-danger" onClick={() => deleteOffer(offer.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
