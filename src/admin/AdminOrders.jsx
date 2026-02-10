import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    fetch('/api/admin/orders').then(res => res.json()).then(setOrders);
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setOrders(orders.map(o => o.id === id ? {...o, status} : o));
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content"><h1>Orders</h1></div>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/prices">Manage Prices</Link>
          <Link to="/admin/offers">Manage Offers</Link>
          <Link to="/admin/orders" className="active">View Orders</Link>
          <Link to="/admin/settings">Settings</Link>
        </nav>
      </header>
      <main className="admin-content">
        <div className="orders-table card">
          <table>
            <thead>
              <tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Delivery</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.name}<br/><small>{order.phone}</small></td>
                  <td>{order.items?.length || 0} items</td>
                  <td>AED {order.total}</td>
                  <td>{order.deliveryType === 'delivery' ? `${order.area}, ${order.address}` : 'Pickup'}</td>
                  <td>
                    <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
