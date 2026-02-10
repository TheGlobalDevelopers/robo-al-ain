import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Bell, Menu, X } from 'lucide-react';
import './Header.css';

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load cart count
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0));
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    // Fetch notifications
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <header className="header">
      <div className="header-top">
        <div className="container header-container">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="Robo Al Ain" className="logo-img" />
            <span>Robo Al Ain</span>
          </Link>

          <div className="search-bar">
            <input type="text" placeholder="Search for products..." />
            <button>Search</button>
          </div>

          <div className="header-actions">
            <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={24} />
              {notifications.length > 0 && (
                <span className="badge">{notifications.length}</span>
              )}
              {showNotifications && (
                <div className="notifications-dropdown">
                  {notifications.length === 0 ? (
                    <p>No new notifications</p>
                  ) : (
                    notifications.map((notif, index) => (
                      <div key={index} className="notification-item">
                        <p>{notif.message}</p>
                        <small>{new Date(notif.date).toLocaleDateString()}</small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link to="/my-orders" className="header-icon">
              <User size={24} />
              <span>Account</span>
            </Link>

            <Link to="/cart" className="cart-icon">
              <ShoppingCart size={24} />
              <span className="cart-count">{cartCount}</span>
              <span>Cart</span>
            </Link>
          </div>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="container">
          <Link to="/products" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
          <Link to="/deals" onClick={() => setMobileMenuOpen(false)}>Today's Deals</Link>
          <Link to="/new-arrivals" onClick={() => setMobileMenuOpen(false)}>New Arrivals</Link>
          <Link to="/best-sellers" onClick={() => setMobileMenuOpen(false)}>Best Sellers</Link>
          <Link to="/category/fresh" onClick={() => setMobileMenuOpen(false)}>Fresh</Link>
          <Link to="/category/dairy-eggs" onClick={() => setMobileMenuOpen(false)}>Dairy & Eggs</Link>
          <Link to="/category/meat-poultry" onClick={() => setMobileMenuOpen(false)}>Meat & Poultry</Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
