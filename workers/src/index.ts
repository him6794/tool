import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env } from './types';
import { urlRoutes } from './routes/urls';
import { fileRoutes } from './routes/files';
import { textRoutes } from './routes/text';
import { adminRoutes } from './routes/admin';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: (origin) => {
    // Allow all origins in development, specific in production
    return origin;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Developer Tools API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.route('/api/urls', urlRoutes);
app.route('/api/files', fileRoutes);
app.route('/api/text', textRoutes);
app.route('/api/admin', adminRoutes);

// Redirect handler for shortened URLs
app.get('/s/:code', async (c) => {
  const code = c.req.param('code');
  
  try {
    const urlData = await c.env.URL_MAPPINGS.get(`url:${code}`);
    if (!urlData) {
      return c.text('URL not found', 404);
    }

    const urlRecord = JSON.parse(urlData);
    
    // Check expiration
    if (urlRecord.expiresAt && new Date() > new Date(urlRecord.expiresAt)) {
      await c.env.URL_MAPPINGS.delete(`url:${code}`);
      return c.text('URL has expired', 410);
    }

    // Increment click count
    urlRecord.clicks++;
    await c.env.URL_MAPPINGS.put(`url:${code}`, JSON.stringify(urlRecord));
    
    // Track analytics
    const today = new Date().toISOString().split('T')[0];
    const analyticsKey = `clicks:${today}:${code}`;
    const currentCount = await c.env.ANALYTICS.get(analyticsKey) || '0';
    await c.env.ANALYTICS.put(analyticsKey, String(parseInt(currentCount) + 1), {
      expirationTtl: 86400 * 30 // 30 days
    });

    return c.redirect(urlRecord.originalUrl, 302);
  } catch (error) {
    console.error('Redirect error:', error);
    return c.text('Internal server error', 500);
  }
});

export default app;