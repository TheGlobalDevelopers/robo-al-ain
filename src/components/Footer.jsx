import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, CreditCard } from 'lucide-react';
import './Footer.css';

function Footer() {
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    // Fetch payment methods from API
    fetch('/api/payment-methods')
      .then(res => res.json())
      .then(data => setPaymentMethods(data))
      .catch(() => {
        // Default payment methods
        setPaymentMethods([
          { id: 1, name: 'Credit Card', icon: '💳', enabled: true },
          { id: 2, name: 'Cash on Delivery', icon: '💵', enabled: true },
          { id: 3, name: 'Apple Pay', icon: '🍎', enabled: true }
        ]);
      });
  }, []);

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/logo.png" alt="Robo Al Ain" />
              <h3>Robo Al Ain</h3>
            </div>
            <p className="footer-tagline">
              Your trusted online supermarket in Al Ain. 1000+ products delivered fresh to your door.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="WhatsApp">💬</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/deals">Today's Deals</Link></li>
              <li><Link to="/new-arrivals">New Arrivals</Link></li>
              <li><Link to="/best-sellers">Best Sellers</Link></li>
              <li><Link to="/my-orders">My Orders</Link></li>
              <li><Link to="/track-delivery">Track Delivery</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/category/fresh">Fresh</Link></li>
              <li><Link to="/category/dairy-eggs">Dairy & Eggs</Link></li>
              <li><Link to="/category/meat-poultry">Meat & Poultry</Link></li>
              <li><Link to="/category/bakery-bread">Bakery & Bread</Link></li>
              <li><Link to="/category/beverages">Beverages</Link></li>
              <li><Link to="/category/frozen-foods">Frozen Foods</Link></li>
              <li><Link to="/category/deals">Deals</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul className="contact-list">
              <li>
                <MapPin size={18} />
                <span>Al Ain Mall, Al Ain<br />United Arab Emirates</span>
              </li>
              <li>
                <Phone size={18} />
                <a href="tel:+97131234567">+971 3 123 4567</a>
              </li>
              <li>
                <Mail size={18} />
                <a href="mailto:orders@roboalain.ae">orders@roboalain.ae</a>
              </li>
              <li>
                <Clock size={18} />
                <span>Delivery: 8 AM - 10 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="footer-middle">
        <div className="container">
          <div className="payment-methods">
            <h4>We Accept:</h4>
            <div className="payment-icons">
              {paymentMethods.filter(pm => pm.enabled).map(method => (
                <Link 
                  key={method.id} 
                  to="/payment-methods" 
                  className="payment-method-btn"
                  title={method.name}
                >
                  <span className="payment-icon">{method.icon}</span>
                  <span className="payment-name">{method.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2024 Robo Al Ain. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Return Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
