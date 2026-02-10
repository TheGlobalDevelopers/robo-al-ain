import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, ShoppingCart, Users, Package, TrendingUp, 
  Download, Calendar, Bell, Settings 
} from 'lucide-react';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    lowStock: 0
  });
  
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [period, setPeriod] = useState('week'); // week, month, year
  
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    fetchDashboardData();
  }, [navigate, period]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch sales data
      const salesRes = await fetch(`/api/admin/sales?period=${period}`);
      const salesDataRes = await salesRes.json();
      setSalesData(salesDataRes);

      // Fetch category data
      const categoryRes = await fetch('/api/admin/category-sales');
      const categoryDataRes = await categoryRes.json();
      setCategoryData(categoryDataRes);

      // Fetch recent orders
      const ordersRes = await fetch('/api/admin/recent-orders');
      const ordersData = await ordersRes.json();
      setRecentOrders(ordersData.slice(0, 5));

      // Fetch notifications
      const notifRes = await fetch('/api/admin/notifications');
      const notifData = await notifRes.json();
      setNotifications(notifData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const downloadReport = async (reportType) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportType}?period=${period}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  const COLORS = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6'];

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <div className="admin-header-actions">
            <div className="notification-bell">
              <Bell size={24} />
              {notifications.length > 0 && (
                <span className="notification-count">{notifications.length}</span>
              )}
            </div>
            <Link to="/admin/settings" className="settings-btn">
              <Settings size={24} />
            </Link>
            <button 
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem('adminAuth');
                navigate('/admin/login');
              }}
            >
              Logout
            </button>
          </div>
        </div>
        
        <nav className="admin-nav">
          <Link to="/admin" className="active">Dashboard</Link>
          <Link to="/admin/prices">Manage Prices</Link>
          <Link to="/admin/offers">Manage Offers</Link>
          <Link to="/admin/orders">View Orders</Link>
          <Link to="/admin/settings">Settings</Link>
        </nav>
      </header>

      <main className="admin-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#2ecc71' }}>
              <DollarSign size={28} />
            </div>
            <div className="stat-info">
              <h3>Today's Sales</h3>
              <p className="stat-value">AED {stats.todaySales.toFixed(2)}</p>
              <small>+12% from yesterday</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3498db' }}>
              <ShoppingCart size={28} />
            </div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.totalOrders}</p>
              <small>{stats.pendingOrders} pending</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f39c12' }}>
              <Package size={28} />
            </div>
            <div className="stat-info">
              <h3>Total Products</h3>
              <p className="stat-value">{stats.totalProducts}</p>
              <small>{stats.lowStock} low stock</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#9b59b6' }}>
              <TrendingUp size={28} />
            </div>
            <div className="stat-info">
              <h3>This Month</h3>
              <p className="stat-value">AED {stats.monthSales.toFixed(2)}</p>
              <small>+24% from last month</small>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="period-selector">
          <Calendar size={20} />
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          
          <div className="download-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => downloadReport('sales')}
            >
              <Download size={18} />
              Download Sales Report
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => downloadReport('inventory')}
            >
              <Download size={18} />
              Download Inventory Report
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-grid">
          {/* Sales Chart */}
          <div className="chart-card">
            <h3>Sales Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#2ecc71" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#3498db" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="chart-card">
            <h3>Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Status */}
          <div className="chart-card full-width">
            <h3>Orders by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { status: 'Pending', count: stats.pendingOrders },
                  { status: 'Processing', count: Math.floor(stats.totalOrders * 0.3) },
                  { status: 'Completed', count: stats.completedOrders },
                  { status: 'Cancelled', count: Math.floor(stats.totalOrders * 0.05) }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2ecc71" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders">
          <h3>Recent Orders</h3>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>AED {order.total.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="view-btn">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="notifications-panel">
            <h3>Recent Notifications</h3>
            <div className="notifications-list">
              {notifications.slice(0, 5).map((notif, index) => (
                <div key={index} className={`notification-item ${notif.type}`}>
                  <span className="notification-icon">
                    {notif.type === 'order' && '🛒'}
                    {notif.type === 'stock' && '📦'}
                    {notif.type === 'payment' && '💳'}
                  </span>
                  <div className="notification-content">
                    <p>{notif.message}</p>
                    <small>{new Date(notif.date).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
