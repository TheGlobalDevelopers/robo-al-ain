import React, { useState, useEffect } from 'react';
import './AllProducts.css';

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <main className="all-products">
      <h1>All Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {product.discount > 0 && <span className="discount-badge">-{product.discount}%</span>}
            <img src={product.image || '/placeholder.png'} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="category">{product.category}</p>
            <div className="price">
              {product.discount > 0 ? (
                <>
                  <span className="original">AED {product.price}</span>
                  <span className="discounted">AED {(product.price * (1 - product.discount/100)).toFixed(2)}</span>
                </>
              ) : (
                <span className="current">AED {product.price}</span>
              )}
            </div>
            <button className="btn btn-primary" onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </main>
  );
}
