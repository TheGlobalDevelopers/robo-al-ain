import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Edit2, Save } from 'lucide-react';

export default function AdminPrices() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState({});

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const updateProduct = async (id, updates) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    setProducts(products.map(p => p.id === id ? {...p, ...updates} : p));
    setEditing({});
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Price Management</h1>
        </div>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/prices" className="active">Manage Prices</Link>
          <Link to="/admin/offers">Manage Offers</Link>
          <Link to="/admin/orders">View Orders</Link>
          <Link to="/admin/settings">Settings</Link>
        </nav>
      </header>
      
      <main className="admin-content">
        <div className="prices-table card">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price (AED)</th>
                <th>Discount (%)</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    {editing[product.id] ? (
                      <input type="number" defaultValue={product.price} id={`price-${product.id}`} />
                    ) : (
                      `AED ${product.price}`
                    )}
                  </td>
                  <td>
                    {editing[product.id] ? (
                      <input type="number" defaultValue={product.discount} id={`discount-${product.id}`} />
                    ) : (
                      `${product.discount}%`
                    )}
                  </td>
                  <td>
                    {editing[product.id] ? (
                      <input type="number" defaultValue={product.stock} id={`stock-${product.id}`} />
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td>
                    {editing[product.id] ? (
                      <button className="btn btn-primary" onClick={() => {
                        const price = parseFloat(document.getElementById(`price-${product.id}`).value);
                        const discount = parseFloat(document.getElementById(`discount-${product.id}`).value);
                        const stock = parseInt(document.getElementById(`stock-${product.id}`).value);
                        updateProduct(product.id, { price, discount, stock });
                      }}>
                        <Save size={16} /> Save
                      </button>
                    ) : (
                      <button className="btn btn-secondary" onClick={() => setEditing({...editing, [product.id]: true})}>
                        <Edit2 size={16} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
