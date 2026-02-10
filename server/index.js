const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const OFFERS_FILE = path.join(DATA_DIR, 'offers.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const initializeDataFiles = () => {
  const defaultData = {
    products: [
      {
        id: 1,
        name: 'Fresh Tomatoes',
        category: 'fresh',
        price: 12.50,
        discount: 0,
        image: '/images/tomatoes.jpg',
        stock: 100,
        featured: true
      },
      {
        id: 2,
        name: 'Organic Milk',
        category: 'dairy-eggs',
        price: 15.00,
        discount: 10,
        image: '/images/milk.jpg',
        stock: 50,
        featured: true
      }
    ],
    orders: [],
    offers: [],
    settings: {
      siteName: 'Robo Al Ain',
      email: 'orders@roboalain.ae',
      phone: '+971 3 123 4567',
      address: 'Al Ain Mall, Al Ain, UAE',
      deliveryHours: '8 AM - 10 PM',
      freeDeliveryThreshold: 100,
      deliveryFee: 10,
      paymentMethods: [
        { id: 1, name: 'Credit Card', icon: '💳', enabled: true },
        { id: 2, name: 'Cash on Delivery', icon: '💵', enabled: true },
        { id: 3, name: 'Apple Pay', icon: '🍎', enabled: true }
      ],
      apiKeys: {
        email: '',
        sms: '',
        payment: ''
      }
    },
    notifications: []
  };

  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultData.products, null, 2));
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(defaultData.orders, null, 2));
  }
  if (!fs.existsSync(OFFERS_FILE)) {
    fs.writeFileSync(OFFERS_FILE, JSON.stringify(defaultData.offers, null, 2));
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultData.settings, null, 2));
  }
  if (!fs.existsSync(NOTIFICATIONS_FILE)) {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(defaultData.notifications, null, 2));
  }
};

initializeDataFiles();

// Helper functions
const readJSONFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeJSONFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const addNotification = (message, type = 'info') => {
  const notifications = readJSONFile(NOTIFICATIONS_FILE);
  notifications.unshift({
    id: Date.now(),
    message,
    type,
    date: new Date().toISOString(),
    read: false
  });
  writeJSONFile(NOTIFICATIONS_FILE, notifications.slice(0, 100)); // Keep last 100
};

// ==================== PUBLIC API ENDPOINTS ====================

// Get featured products
app.get('/api/products/featured', (req, res) => {
  const products = readJSONFile(PRODUCTS_FILE);
  res.json(products.filter(p => p.featured));
});

// Get all products
app.get('/api/products', (req, res) => {
  const products = readJSONFile(PRODUCTS_FILE);
  res.json(products);
});

// Get products by category
app.get('/api/products/category/:category', (req, res) => {
  const products = readJSONFile(PRODUCTS_FILE);
  res.json(products.filter(p => p.category === req.params.category));
});

// Get active offers
app.get('/api/offers/active', (req, res) => {
  const offers = readJSONFile(OFFERS_FILE);
  const activeOffers = offers.filter(offer => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);
    return offer.active && now >= start && now <= end;
  });
  res.json(activeOffers);
});

// Get payment methods
app.get('/api/payment-methods', (req, res) => {
  const settings = readJSONFile(SETTINGS_FILE);
  res.json(settings.paymentMethods || []);
});

// Get notifications
app.get('/api/notifications', (req, res) => {
  const notifications = readJSONFile(NOTIFICATIONS_FILE);
  res.json(notifications.filter(n => !n.read));
});

// Create order
app.post('/api/orders', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE);
  const newOrder = {
    id: orders.length + 1,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  writeJSONFile(ORDERS_FILE, orders);
  
  addNotification(`New order #${newOrder.id} received from ${req.body.name}`, 'order');
  
  res.json({ success: true, orderId: newOrder.id });
});

// ==================== ADMIN API ENDPOINTS ====================

// Admin stats
app.get('/api/admin/stats', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE);
  const products = readJSONFile(PRODUCTS_FILE);
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);
  const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekStart);
  const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthStart);
  
  res.json({
    todaySales: todayOrders.reduce((sum, o) => sum + o.total, 0),
    weekSales: weekOrders.reduce((sum, o) => sum + o.total, 0),
    monthSales: monthOrders.reduce((sum, o) => sum + o.total, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock < 10).length
  });
});

// Sales data for charts
app.get('/api/admin/sales', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE);
  const period = req.query.period || 'week';
  
  const data = [];
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayOrders = orders.filter(o => 
      o.createdAt.split('T')[0] === dateStr
    );
    
    data.push({
      date: dateStr,
      sales: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length
    });
  }
  
  res.json(data);
});

// Category sales
app.get('/api/admin/category-sales', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE);
  const categorySales = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!categorySales[item.category]) {
        categorySales[item.category] = 0;
      }
      categorySales[item.category] += item.price * item.quantity;
    });
  });
  
  const data = Object.entries(categorySales).map(([name, value]) => ({
    name,
    value
  }));
  
  res.json(data);
});

// Recent orders
app.get('/api/admin/recent-orders', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE);
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map(order => ({
      id: order.id,
      customerName: order.name,
      total: order.total,
      status: order.status,
      date: order.createdAt
    }));
  
  res.json(recentOrders);
});

// Get all orders (admin)
app.get('/api/admin/orders', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE);
  res.json(orders);
});

// Update order status
app.put('/api/admin/orders/:id', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE);
  const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
  
  if (orderIndex !== -1) {
    orders[orderIndex] = { ...orders[orderIndex], ...req.body };
    writeJSONFile(ORDERS_FILE, orders);
    addNotification(`Order #${req.params.id} status updated to ${req.body.status}`, 'order');
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Get all products (admin)
app.get('/api/admin/products', (req, res) => {
  const products = readJSONFile(PRODUCTS_FILE);
  res.json(products);
});

// Update product
app.put('/api/admin/products/:id', (req, res) => {
  const products = readJSONFile(PRODUCTS_FILE);
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  
  if (productIndex !== -1) {
    products[productIndex] = { ...products[productIndex], ...req.body };
    writeJSONFile(PRODUCTS_FILE, products);
    addNotification(`Product "${req.body.name}" updated`, 'stock');
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Add product
app.post('/api/admin/products', (req, res) => {
  const products = readJSONFile(PRODUCTS_FILE);
  const newProduct = {
    id: Math.max(...products.map(p => p.id), 0) + 1,
    ...req.body
  };
  
  products.push(newProduct);
  writeJSONFile(PRODUCTS_FILE, products);
  addNotification(`New product "${req.body.name}" added`, 'stock');
  res.json({ success: true, id: newProduct.id });
});

// Get all offers (admin)
app.get('/api/admin/offers', (req, res) => {
  const offers = readJSONFile(OFFERS_FILE);
  res.json(offers);
});

// Add/Update offer
app.post('/api/admin/offers', (req, res) => {
  const offers = readJSONFile(OFFERS_FILE);
  const newOffer = {
    id: Math.max(...offers.map(o => o.id), 0) + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  offers.push(newOffer);
  writeJSONFile(OFFERS_FILE, offers);
  addNotification(`New offer "${req.body.title}" created`, 'info');
  res.json({ success: true, id: newOffer.id });
});

// Update offer
app.put('/api/admin/offers/:id', (req, res) => {
  const offers = readJSONFile(OFFERS_FILE);
  const offerIndex = offers.findIndex(o => o.id === parseInt(req.params.id));
  
  if (offerIndex !== -1) {
    offers[offerIndex] = { ...offers[offerIndex], ...req.body };
    writeJSONFile(OFFERS_FILE, offers);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Offer not found' });
  }
});

// Delete offer
app.delete('/api/admin/offers/:id', (req, res) => {
  const offers = readJSONFile(OFFERS_FILE);
  const filteredOffers = offers.filter(o => o.id !== parseInt(req.params.id));
  writeJSONFile(OFFERS_FILE, filteredOffers);
  res.json({ success: true });
});

// Get settings
app.get('/api/admin/settings', (req, res) => {
  const settings = readJSONFile(SETTINGS_FILE);
  res.json(settings);
});

// Update settings
app.put('/api/admin/settings', (req, res) => {
  const settings = readJSONFile(SETTINGS_FILE);
  const updatedSettings = { ...settings, ...req.body };
  writeJSONFile(SETTINGS_FILE, updatedSettings);
  addNotification('Settings updated', 'info');
  res.json({ success: true });
});

// Get admin notifications
app.get('/api/admin/notifications', (req, res) => {
  const notifications = readJSONFile(NOTIFICATIONS_FILE);
  res.json(notifications);
});

// Mark notification as read
app.put('/api/admin/notifications/:id/read', (req, res) => {
  const notifications = readJSONFile(NOTIFICATIONS_FILE);
  const notifIndex = notifications.findIndex(n => n.id === parseInt(req.params.id));
  
  if (notifIndex !== -1) {
    notifications[notifIndex].read = true;
    writeJSONFile(NOTIFICATIONS_FILE, notifications);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// Download reports
app.get('/api/admin/reports/:type', (req, res) => {
  const { type } = req.params;
  const period = req.query.period || 'week';
  
  // In a real app, you would generate PDF here
  // For now, we'll just return JSON
  
  if (type === 'sales') {
    const orders = readJSONFile(ORDERS_FILE);
    res.json({
      report: 'sales',
      period,
      data: orders,
      generated: new Date().toISOString()
    });
  } else if (type === 'inventory') {
    const products = readJSONFile(PRODUCTS_FILE);
    res.json({
      report: 'inventory',
      data: products,
      generated: new Date().toISOString()
    });
  } else {
    res.status(400).json({ error: 'Invalid report type' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
