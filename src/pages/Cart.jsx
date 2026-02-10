import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import './Cart.css';

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const updateQuantity = (productId, change) => {
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.discount 
        ? item.price * (1 - item.discount / 100) 
        : item.price;
      return sum + (price * item.quantity);
    }, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <main className="cart-page empty-cart">
        <div className="empty-cart-content">
          <ShoppingBag size={80} />
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = calculateSubtotal();
  const deliveryFee = subtotal > 100 ? 0 : 10;
  const total = subtotal + deliveryFee;

  return (
    <main className="cart-page">
      <h1>Shopping Cart</h1>
      
      <div className="cart-container">
        <div className="cart-items">
          {cart.map(item => {
            const itemPrice = item.discount 
              ? item.price * (1 - item.discount / 100) 
              : item.price;
            
            return (
              <div key={item.id} className="cart-item">
                <img src={item.image || '/placeholder.png'} alt={item.name} />
                
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  {item.discount && (
                    <span className="item-discount">-{item.discount}% OFF</span>
                  )}
                </div>
                
                <div className="item-price">
                  {item.discount && (
                    <span className="original-price">AED {item.price.toFixed(2)}</span>
                  )}
                  <span className="current-price">AED {itemPrice.toFixed(2)}</span>
                </div>
                
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, -1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="item-total">
                  AED {(itemPrice * item.quantity).toFixed(2)}
                </div>
                
                <button 
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                  title="Remove item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-row">
            <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>AED {subtotal.toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? 'FREE' : `AED ${deliveryFee.toFixed(2)}`}</span>
          </div>
          
          {subtotal < 100 && (
            <div className="free-delivery-notice">
              Add AED {(100 - subtotal).toFixed(2)} more for free delivery!
            </div>
          )}
          
          <div className="summary-divider"></div>
          
          <div className="summary-row total">
            <span>Total</span>
            <span>AED {total.toFixed(2)}</span>
          </div>
          
          <button 
            className="btn btn-primary checkout-btn"
            onClick={proceedToCheckout}
          >
            Proceed to Checkout
          </button>
          
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Cart;
