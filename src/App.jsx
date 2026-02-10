import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import TodaysDeals from './pages/TodaysDeals';
import NewArrivals from './pages/NewArrivals';
import BestSellers from './pages/BestSellers';
import MyOrders from './pages/MyOrders';
import TrackDelivery from './pages/TrackDelivery';
import CategoryPage from './pages/CategoryPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentMethods from './pages/PaymentMethods';
import AdminDashboard from './admin/AdminDashboard';
import AdminPrices from './admin/AdminPrices';
import AdminOffers from './admin/AdminOffers';
import AdminOrders from './admin/AdminOrders';
import AdminSettings from './admin/AdminSettings';
import AdminLogin from './admin/AdminLogin';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/prices" element={<AdminPrices />} />
          <Route path="/admin/offers" element={<AdminOffers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<AllProducts />} />
                <Route path="/deals" element={<TodaysDeals />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/best-sellers" element={<BestSellers />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/track-delivery" element={<TrackDelivery />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-methods" element={<PaymentMethods />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
