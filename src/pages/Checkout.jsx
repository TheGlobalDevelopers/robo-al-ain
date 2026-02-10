import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';
import './Checkout.css';

function Checkout() {
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Customer Info
    name: '',
    email: '',
    phone: '',
    
    // Delivery Info
    deliveryType: 'delivery',
    address: '',
    area: '',
    building: '',
    floor: '',
    apartment: '',
    landmark: '',
    
    // Payment Info
    paymentMethod: 'cod',
    notes: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      navigate('/cart');
    }
    setCart(savedCart);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => {
      const price = item.discount 
        ? item.price * (1 - item.discount / 100) 
        : item.price;
      return sum + (price * item.quantity);
    }, 0);
    
    const deliveryFee = formData.deliveryType === 'delivery' 
      ? (subtotal > 100 ? 0 : 10) 
      : 0;
    
    return { subtotal, deliveryFee, total: subtotal + deliveryFee };
  };

  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      return formData.name && formData.email && formData.phone;
    }
    if (stepNumber === 2) {
      if (formData.deliveryType === 'delivery') {
        return formData.address && formData.area;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const submitOrder = async () => {
    if (!validateStep(step)) {
      alert('Please fill in all required fields');
      return;
    }

    const { subtotal, deliveryFee, total } = calculateTotal();
    
    const orderData = {
      ...formData,
      items: cart,
      subtotal,
      deliveryFee,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Clear cart
        localStorage.setItem('cart', JSON.stringify([]));
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Show success and redirect
        alert(`Order placed successfully! Order ID: ${result.orderId}`);
        navigate('/my-orders');
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const { subtotal, deliveryFee, total } = calculateTotal();

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>
      
      <div className="checkout-container">
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Contact Info</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Delivery</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Payment</span>
          </div>
        </div>

        <div className="checkout-content">
          {/* Step 1: Contact Information */}
          {step === 1 && (
            <div className="step-content">
              <h2>Contact Information</h2>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+971 XX XXX XXXX"
                  required
                />
              </div>

              <div className="step-actions">
                <button className="btn btn-primary" onClick={nextStep}>
                  Continue to Delivery
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Information */}
          {step === 2 && (
            <div className="step-content">
              <h2>Delivery Information</h2>
              
              <div className="delivery-type">
                <label className={`delivery-option ${formData.deliveryType === 'delivery' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="delivery"
                    checked={formData.deliveryType === 'delivery'}
                    onChange={handleInputChange}
                  />
                  <Truck size={24} />
                  <div>
                    <strong>Home Delivery</strong>
                    <small>Delivered to your doorstep</small>
                  </div>
                </label>

                <label className={`delivery-option ${formData.deliveryType === 'pickup' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={formData.deliveryType === 'pickup'}
                    onChange={handleInputChange}
                  />
                  <MapPin size={24} />
                  <div>
                    <strong>Store Pickup</strong>
                    <small>Collect from our store</small>
                  </div>
                </label>
              </div>

              {formData.deliveryType === 'delivery' && (
                <>
                  <div className="form-group">
                    <label>Area *</label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select your area</option>
                      <option value="al-ain-mall">Al Ain Mall</option>
                      <option value="al-jimi">Al Jimi</option>
                      <option value="al-mutawaa">Al Mutawaa</option>
                      <option value="al-tawia">Al Tawia</option>
                      <option value="al-khabisi">Al Khabisi</option>
                      <option value="falaj-hazza">Falaj Hazza</option>
                      <option value="zakher">Zakher</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Building</label>
                      <input
                        type="text"
                        name="building"
                        value={formData.building}
                        onChange={handleInputChange}
                        placeholder="Building name/number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Floor</label>
                      <input
                        type="text"
                        name="floor"
                        value={formData.floor}
                        onChange={handleInputChange}
                        placeholder="Floor number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Apartment</label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        placeholder="Apt number"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Landmark (Optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="Nearby landmark"
                    />
                  </div>
                </>
              )}

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={prevStep}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={nextStep}>
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="step-content">
              <h2>Payment Method</h2>
              
              <div className="payment-methods">
                <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                  />
                  <div className="payment-icon">💵</div>
                  <div>
                    <strong>Cash on Delivery</strong>
                    <small>Pay when you receive</small>
                  </div>
                </label>

                <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                  />
                  <div className="payment-icon">💳</div>
                  <div>
                    <strong>Credit/Debit Card</strong>
                    <small>Secure payment</small>
                  </div>
                </label>
              </div>

              <div className="form-group">
                <label>Special Instructions (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for delivery..."
                  rows="4"
                />
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={prevStep}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={submitOrder}>
                  <CheckCircle size={20} />
                  Place Order (AED {total.toFixed(2)})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          
          <div className="summary-items">
            {cart.map(item => {
              const itemPrice = item.discount 
                ? item.price * (1 - item.discount / 100) 
                : item.price;
              
              return (
                <div key={item.id} className="summary-item">
                  <img src={item.image || '/placeholder.png'} alt={item.name} />
                  <div className="summary-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <span className="item-price">
                    AED {(itemPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>AED {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `AED ${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total</span>
              <span>AED {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
