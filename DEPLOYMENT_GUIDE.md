# Robo Al Ain - Deployment Guide

## Quick Start (Development)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start backend server (Terminal 1):
   ```bash
   npm run server
   ```

3. Start frontend dev server (Terminal 2):
   ```bash
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin (password: admin123)

## Production Deployment

### Option 1: Single Server Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Serve everything from one server:
   ```bash
   # Install serve globally
   npm install -g serve
   
   # Start backend
   node server/index.js &
   
   # Serve frontend
   serve -s dist -l 3000
   ```

### Option 2: Separate Frontend/Backend

**Frontend (Vercel/Netlify):**
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variable: `VITE_API_URL=https://your-backend.com`

**Backend (Heroku/Railway):**
1. Push `server/` folder
2. Add Procfile: `web: node index.js`
3. Deploy

### Option 3: VPS Deployment

```bash
# On your server
git clone <your-repo>
cd robo-al-ain-supermarket
npm install
npm run build

# Install PM2
npm install -g pm2

# Start backend with PM2
pm2 start server/index.js --name robo-backend

# Serve frontend with nginx
# Configure nginx to serve dist/ folder and proxy /api to localhost:5000
```

## Environment Variables

Create `.env` file:
```
PORT=5000
NODE_ENV=production
```

## Admin Access

Default credentials:
- URL: `/admin/login`
- Password: `admin123`

**Change this in production!**

Edit `src/admin/AdminLogin.jsx` to update password or add proper authentication.

## Features Checklist

- [x] Favicon & title
- [x] Multi-page admin dashboard
- [x] Real-time sync
- [x] Price management
- [x] Offers management
- [x] Cart & checkout
- [x] Location selection
- [x] Order management
- [x] Analytics & reports
- [x] Notifications
- [x] Working footer links
- [x] Dynamic payment methods
- [x] API configuration
- [x] Vite integration

## Support

For issues or customization, contact:
- Email: orders@roboalain.ae
- Phone: +971 3 123 4567
