# Robo Al Ain - Online Supermarket

A complete full-stack e-commerce platform for Robo Al Ain supermarket built with React, Vite, and Node.js.

## Features

### Customer Features
- 🛒 Full shopping cart functionality
- 📦 Product browsing by categories
- 🎯 Special offers and deals section
- 🚚 Delivery location selection
- 💳 Multiple payment methods
- 📱 Responsive mobile design
- 🔔 Order notifications
- 📍 Store pickup option

### Admin Features
- 📊 Real-time dashboard with analytics
- 📈 Sales charts and reports (weekly, monthly, yearly)
- 💰 Price management for all products
- 🏷️ Dynamic offers management
- 📦 Order management and tracking
- 🔔 Admin notifications for all events
- ⚙️ Settings management (API keys, payment methods, etc.)
- 📥 Download reports (PDF format)
- 🎨 Multi-page admin panel

## Technology Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Express.js
- **Data Storage**: JSON files (can be migrated to database)
- **Styling**: Custom CSS with CSS Variables

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup Instructions

1. **Extract the project files**
   ```bash
   unzip robo-al-ain-supermarket.zip
   cd robo-al-ain-supermarket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run server
   ```
   The API server will run on http://localhost:5000

4. **Start the frontend development server** (in a new terminal)
   ```bash
   npm run dev
   ```
   The app will run on http://localhost:3000

5. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Default admin credentials: (create on first login)

## Project Structure

```
robo-al-ain-supermarket/
├── public/
│   ├── favicon.ico          # Site favicon
│   └── logo.png             # Company logo
├── src/
│   ├── components/          # Reusable components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── *.css
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── AllProducts.jsx
│   │   └── *.css
│   ├── admin/               # Admin panel
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminPrices.jsx
│   │   ├── AdminOffers.jsx
│   │   ├── AdminOrders.jsx
│   │   ├── AdminSettings.jsx
│   │   └── *.css
│   ├── App.jsx              # Main app component
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── server/
│   ├── index.js             # Express server
│   └── data/                # JSON data storage
│       ├── products.json
│       ├── orders.json
│       ├── offers.json
│       ├── settings.json
│       └── notifications.json
├── package.json
├── vite.config.js
└── README.md
```

## Features Implementation

### 1. Favicon & Title
✅ Favicon added to `/public/favicon.ico`
✅ Page title set to "Robo Al Ain"

### 2. Admin Panel
✅ **Multi-page admin dashboard**
   - `/admin` - Main dashboard with analytics
   - `/admin/prices` - Product price management
   - `/admin/offers` - Create and manage offers
   - `/admin/orders` - View and manage orders
   - `/admin/settings` - API keys and settings

✅ **Real-time sync** - All changes update immediately
✅ **Analytics Dashboard** with:
   - Sales charts (daily, weekly, monthly, yearly)
   - Category distribution pie chart
   - Order status bar chart
   - Key metrics (sales, orders, products, etc.)
   - Download reports feature

### 3. Offers Management
✅ Admin can create, edit, and delete offers
✅ Offers display on homepage automatically
✅ Active/inactive toggle
✅ Date range selection

### 4. Cart & Checkout
✅ Full cart functionality
✅ Quantity adjustment
✅ **Location selection** during checkout
   - Delivery to multiple areas in Al Ain
   - Store pickup option
✅ Multiple payment methods
✅ Order confirmation

### 5. Admin Order Management
✅ All orders display in `/admin/orders`
✅ Order details with customer info
✅ Delivery location visible
✅ Status updates (pending, processing, completed)

### 6. Reports & Analytics
✅ Weekly, monthly, yearly reports
✅ Download as PDF (endpoint ready)
✅ Sales by category
✅ Order statistics

### 7. Notifications
✅ Real-time notifications for:
   - New orders
   - Stock updates
   - Price changes
   - Offer activations
✅ Notification bell in header
✅ Admin notification panel

### 8. Footer Improvements
✅ All quick links work
✅ All categories link to pages
✅ **Dynamic payment methods** - Each payment method is a clickable button
✅ Payment methods page at `/payment-methods`
✅ Contact information with icons

### 9. API Settings
✅ Admin can configure:
   - Email API keys
   - SMS API keys
   - Payment gateway keys
   - Delivery settings
   - Site information
✅ Large text area (supports up to 1MB of data)

### 10. Vite Integration
✅ Built with Vite for fast development
✅ Hot module replacement
✅ Optimized production builds

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/offers/active` - Get active offers
- `GET /api/payment-methods` - Get available payment methods
- `POST /api/orders` - Create new order
- `GET /api/notifications` - Get user notifications

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/sales?period=week|month|year` - Sales data
- `GET /api/admin/category-sales` - Sales by category
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/orders/:id` - Update order
- `GET /api/admin/products` - All products
- `PUT /api/admin/products/:id` - Update product
- `POST /api/admin/products` - Add product
- `GET /api/admin/offers` - All offers
- `POST /api/admin/offers` - Create offer
- `PUT /api/admin/offers/:id` - Update offer
- `DELETE /api/admin/offers/:id` - Delete offer
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/notifications` - Admin notifications
- `GET /api/admin/reports/:type?period=week` - Download reports

## Configuration

### Environment Variables (Optional)
Create a `.env` file in the root:

```env
PORT=5000
NODE_ENV=development
```

### Customization
- **Colors**: Edit CSS variables in `src/App.css`
- **Logo**: Replace `/public/logo.png`
- **Favicon**: Replace `/public/favicon.ico`
- **Default data**: Edit files in `server/data/`

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## Deployment

### Option 1: Deploy to Vercel/Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set up the backend separately (e.g., on Heroku, Railway, or VPS)

### Option 2: Deploy to VPS
1. Upload files to server
2. Install Node.js on server
3. Run `npm install`
4. Use PM2 to run the server: `pm2 start server/index.js`
5. Set up nginx as reverse proxy
6. Serve frontend from `dist/` folder

## Support & Customization

For support or custom development:
- Email: orders@roboalain.ae
- Phone: +971 3 123 4567

## License

Copyright © 2024 Robo Al Ain. All rights reserved.

## Changelog

### Version 1.0.0
- Initial release with all requested features
- Full e-commerce functionality
- Comprehensive admin panel
- Real-time notifications
- Analytics dashboard
- Report generation
- API configuration
- Mobile responsive design
