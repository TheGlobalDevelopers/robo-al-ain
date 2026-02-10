import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Sparkles, Tag } from 'lucide-react';
import './Home.css';

function Home() {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
    fetchFeaturedProducts();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers/active');
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products/featured');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show notification
    showNotification('Added to cart!', 'success');
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  return (
    <main className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Robo Al Ain</h1>
          <p>Your trusted online supermarket - 1000+ products delivered fresh to your door</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      </section>

      {/* Active Offers Section */}
      {offers.length > 0 && (
        <section className="offers-section">
          <div className="section-header">
            <Tag size={28} />
            <h2>Special Offers</h2>
          </div>
          <div className="offers-grid">
            {offers.map(offer => (
              <div key={offer.id} className="offer-card">
                <div className="offer-badge">{offer.discount}% OFF</div>
                <img src={offer.image || '/placeholder.png'} alt={offer.title} />
                <div className="offer-content">
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  <p className="offer-validity">Valid until: {new Date(offer.endDate).toLocaleDateString()}</p>
                  <Link to={`/category/${offer.category}`} className="btn btn-secondary">
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Categories */}
      <section className="categories-section">
        <div className="section-header">
          <ShoppingBag size={28} />
          <h2>Shop by Category</h2>
        </div>
        <div className="categories-grid">
          <Link to="/category/fresh" className="category-card">
            <div className="category-icon">🥗</div>
            <h3>Fresh</h3>
          </Link>
          <Link to="/category/dairy-eggs" className="category-card">
            <div className="category-icon">🥛</div>
            <h3>Dairy & Eggs</h3>
          </Link>
          <Link to="/category/meat-poultry" className="category-card">
            <div className="category-icon">🍖</div>
            <h3>Meat & Poultry</h3>
          </Link>
          <Link to="/category/bakery-bread" className="category-card">
            <div className="category-icon">🍞</div>
            <h3>Bakery & Bread</h3>
          </Link>
          <Link to="/category/beverages" className="category-card">
            <div className="category-icon">🥤</div>
            <h3>Beverages</h3>
          </Link>
          <Link to="/category/frozen-foods" className="category-card">
            <div className="category-icon">🧊</div>
            <h3>Frozen Foods</h3>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="section-header">
          <Sparkles size={28} />
          <h2>Featured Products</h2>
        </div>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                {product.discount && (
                  <span className="discount-badge">-{product.discount}%</span>
                )}
                <img src={product.image || '/placeholder.png'} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <div className="product-price">
                    {product.discount ? (
                      <>
                        <span className="original-price">AED {product.price}</span>
                        <span className="discounted-price">
                          AED {(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="current-price">AED {product.price}</span>
                    )}
                  </div>
                  <button 
                    className="btn btn-primary add-to-cart"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="quick-links-section">
        <div className="section-header">
          <TrendingUp size={28} />
          <h2>Popular Sections</h2>
        </div>
        <div className="quick-links-grid">
          <Link to="/deals" className="quick-link-card">
            <Tag size={40} />
            <h3>Today's Deals</h3>
            <p>Save big on selected items</p>
          </Link>
          <Link to="/new-arrivals" className="quick-link-card">
            <Sparkles size={40} />
            <h3>New Arrivals</h3>
            <p>Check out our latest products</p>
          </Link>
          <Link to="/best-sellers" className="quick-link-card">
            <TrendingUp size={40} />
            <h3>Best Sellers</h3>
            <p>Most popular items</p>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
