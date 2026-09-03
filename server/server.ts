import express from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { spotsRouter } from './routes/spots';
import { broadcastRouter } from './routes/broadcast';
import { subscriptionsRouter } from './routes/subscriptions';
import { ordersRouter } from './routes/orders';
import { vendorRouter } from './routes/vendor';
import { dbAdminRouter } from './routes/dbAdmin';
import { database } from './db/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());

// Basic CORS header helper for API development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Root / Dashboard endpoint - Solves "Cannot GET /"
app.get('/', (req, res) => {
  // If client wants JSON, send JSON status
  if (req.headers.accept && !req.headers.accept.includes('text/html') && req.headers.accept.includes('application/json')) {
    return res.json({
      status: 'online',
      message: 'Nearby Food Stall & Cycle Idli Finder API Server is running',
      frontendUrl: 'http://localhost:3000',
      port: PORT,
      uptimeSeconds: Math.floor(process.uptime()),
      endpoints: {
        health: '/api/health',
        spots: '/api/spots',
        dbStats: '/api/db/stats',
        subscriptions: '/api/subscriptions/plans',
        smsGateway: '/api/auth/sms-gateway-status'
      }
    });
  }

  // Otherwise render a modern, visually striking status dashboard
  const stats = database.getStats();
  const recentOtps = database.getRecentOtps(5);
  const uptimeMins = Math.floor(process.uptime() / 60);
  const uptimeSecs = Math.floor(process.uptime() % 60);

  const otpRowsHtml = recentOtps.length > 0
    ? recentOtps.map(o => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
        <td style="padding: 10px 14px; font-family: monospace; color: #f59e0b; font-weight: 700; font-size: 16px;">
          ${o.otp_code}
          <button onclick="navigator.clipboard.writeText('${o.otp_code}'); alert('Copied OTP ${o.otp_code} to clipboard!')" style="margin-left: 8px; background: rgba(245,158,11,0.2); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer;">Copy</button>
        </td>
        <td style="padding: 10px 14px; font-family: monospace; color: #e2e8f0;">+91 ${o.phone}</td>
        <td style="padding: 10px 14px; color: #94a3b8;">${o.role || 'Customer'}</td>
        <td style="padding: 10px 14px; color: ${o.is_verified ? '#10b981' : '#f59e0b'}; font-weight: 600;">${o.is_verified ? '✓ Verified' : '⏳ Pending'}</td>
        <td style="padding: 10px 14px; color: #64748b; font-size: 12px;">${new Date(o.created_at).toLocaleTimeString()}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="5" style="padding: 16px; text-align: center; color: #94a3b8;">No OTPs generated yet. Try logging in from the app!</td></tr>';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Street Radar • API Backend Server</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #0f172a;
          color: #f8fafc;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 16px;
        }
        .container {
          max-width: 920px;
          width: 100%;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .logo-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.5);
        }
        .title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse 1.8s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .hero-banner {
          background: linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(245, 158, 11, 0.1));
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .hero-text h2 {
          font-size: 19px;
          font-weight: 700;
          margin-bottom: 6px;
          color: #fef08a;
        }
        .hero-text p {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.5;
        }
        .btn-launch {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f59e0b);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          box-shadow: 0 10px 20px -5px rgba(234, 88, 12, 0.5);
          transition: all 0.2s ease;
        }
        .btn-launch:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 25px -4px rgba(234, 88, 12, 0.7);
        }
        .grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 18px;
        }
        .card-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .card-value {
          font-size: 22px;
          font-weight: 800;
          color: #f8fafc;
        }
        .card-sub {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }
        .section-title {
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .endpoints-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }
        .endpoint-card {
          display: block;
          text-decoration: none;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px 16px;
          transition: all 0.2s;
        }
        .endpoint-card:hover {
          border-color: rgba(245, 158, 11, 0.5);
          background: rgba(30, 41, 59, 0.9);
          transform: translateY(-2px);
        }
        .endpoint-method {
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          margin-right: 8px;
        }
        .endpoint-path {
          font-family: monospace;
          font-size: 13px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .endpoint-desc {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 6px;
        }
        .table-wrap {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 28px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          background: rgba(15, 23, 42, 0.8);
          padding: 12px 14px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .footer {
          text-align: center;
          font-size: 13px;
          color: #64748b;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <header class="header">
          <div class="logo-wrap">
            <div class="logo-icon">🍲</div>
            <div>
              <h1 class="title">Street Radar API Server</h1>
              <p class="subtitle">Nearby Food Stall & Cycle Idli Finder • Backend Service</p>
            </div>
          </div>
          <div class="status-badge">
            <div class="pulse-dot"></div>
            <span>Online • Port ${PORT}</span>
          </div>
        </header>

        <!-- Hero Notice for Frontend -->
        <section class="hero-banner">
          <div class="hero-text">
            <h2>Looking for the Web Application?</h2>
            <p>You are viewing the API backend server. The interactive Street Radar application with live maps, cycle GPS broadcast, and sound alerts is hosted on port 3000.</p>
          </div>
          <a href="http://localhost:3000" target="_blank" class="btn-launch">
            <span>🚀 Open Street Radar App</span>
            <span style="font-size: 12px; opacity: 0.85;">(:3000)</span>
          </a>
        </section>

        <!-- System Stats Cards -->
        <div class="grid-cards">
          <div class="card">
            <div class="card-label">Server Health</div>
            <div class="card-value" style="color: #34d399;">Active 100%</div>
            <div class="card-sub">Uptime: ${uptimeMins}m ${uptimeSecs}s</div>
          </div>
          <div class="card">
            <div class="card-label">Database Storage</div>
            <div class="card-value" style="color: #60a5fa;">SQLite 3</div>
            <div class="card-sub">Size: ${stats.fileSizeKb} (WAL Mode)</div>
          </div>
          <div class="card">
            <div class="card-label">Registered Spots</div>
            <div class="card-value" style="color: #f59e0b;">${stats.tables.food_spots || 0}</div>
            <div class="card-sub">Stalls & Cycle Vendors</div>
          </div>
          <div class="card">
            <div class="card-label">Total Users</div>
            <div class="card-value" style="color: #a78bfa;">${stats.tables.users || 0}</div>
            <div class="card-sub">Accounts & Profiles</div>
          </div>
        </div>

        <!-- Endpoints List -->
        <h3 class="section-title">⚡ Available API Endpoints</h3>
        <div class="endpoints-list">
          <a href="/api/health" class="endpoint-card" target="_blank">
            <div><span class="endpoint-method">GET</span><span class="endpoint-path">/api/health</span></div>
            <p class="endpoint-desc">Live health check and server process uptime.</p>
          </a>
          <a href="/api/spots" class="endpoint-card" target="_blank">
            <div><span class="endpoint-method">GET</span><span class="endpoint-path">/api/spots</span></div>
            <p class="endpoint-desc">List all food spots, coordinates, and menu items.</p>
          </a>
          <a href="/api/db/stats" class="endpoint-card" target="_blank">
            <div><span class="endpoint-method">GET</span><span class="endpoint-path">/api/db/stats</span></div>
            <p class="endpoint-desc">Database metrics, table record counts and sizes.</p>
          </a>
          <a href="/api/auth/sms-gateway-status" class="endpoint-card" target="_blank">
            <div><span class="endpoint-method">GET</span><span class="endpoint-path">/api/auth/sms-gateway-status</span></div>
            <p class="endpoint-desc">Telecom SMS provider and carrier delivery status.</p>
          </a>
          <a href="/api/subscriptions/plans" class="endpoint-card" target="_blank">
            <div><span class="endpoint-method">GET</span><span class="endpoint-path">/api/subscriptions/plans</span></div>
            <p class="endpoint-desc">Vendor subscription pricing and feature tiers.</p>
          </a>
          <a href="/api/orders" class="endpoint-card" target="_blank">
            <div><span class="endpoint-method">GET</span><span class="endpoint-path">/api/orders</span></div>
            <p class="endpoint-desc">Order management and customer token tracking.</p>
          </a>
        </div>

        <!-- Recent OTP Codes Table -->
        <h3 class="section-title">📱 Recent OTP Codes (Debug & Test Helper)</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>OTP Code</th>
                <th>Mobile Number</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${otpRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <footer class="footer">
          Nearby Food Stall & Cycle Idli Finder • API running on Bun & Express
        </footer>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Nearby Food Stall & Cycle Idli Finder API Server',
    database: 'SQLite 3 Persistent',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/spots', spotsRouter);
app.use('/api/broadcast', broadcastRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/vendor', vendorRouter);
app.use('/api/db', dbAdminRouter);

// Fallback 404 Handler - Prevents "Cannot GET /xyz" raw Express errors
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>404 - Not Found • Street Radar API</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
          .box { background: #1e293b; padding: 40px; border-radius: 16px; border: 1px solid #334155; max-width: 480px; }
          h1 { color: #f59e0b; margin-bottom: 12px; }
          p { color: #94a3b8; margin-bottom: 24px; }
          a { display: inline-block; background: #ea580c; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; margin: 4px; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>404 Endpoint Not Found</h1>
          <p>The path <code>${req.path}</code> does not exist on this API server.</p>
          <a href="/">Go to API Dashboard</a>
          <a href="http://localhost:3000">Go to Street Radar App</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: 'The requested route does not exist on this server.',
    availableEndpoints: [
      '/',
      '/api/health',
      '/api/spots',
      '/api/db/stats',
      '/api/auth/sms-gateway-status',
      '/api/subscriptions/plans'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Food Radar Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`💾 SQLite DB Stats: http://localhost:${PORT}/api/db/stats`);
  console.log(`🍲 Spots API: http://localhost:${PORT}/api/spots`);
  console.log(`💳 Subscriptions API: http://localhost:${PORT}/api/subscriptions/plans`);
});

export default app;
