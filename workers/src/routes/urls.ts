import { Hono } from 'hono';
import { Env, UrlRecord } from '../types';
import { generateShortCode, isValidUrl } from '../utils/helpers';

export const urlRoutes = new Hono<{ Bindings: Env }>();

// Create shortened URL
urlRoutes.post('/', async (c) => {
  try {
    const { url, customCode, expirationDays } = await c.req.json();

    if (!url || !isValidUrl(url)) {
      return c.json({ error: 'Invalid URL provided' }, 400);
    }

    // Generate or validate short code
    let shortCode = customCode?.trim();
    if (shortCode) {
      // Check if custom code already exists
      const existing = await c.env.URL_MAPPINGS.get(`url:${shortCode}`);
      if (existing) {
        return c.json({ error: 'Custom code already exists' }, 409);
      }
    } else {
      shortCode = generateShortCode();
      // Ensure uniqueness
      while (await c.env.URL_MAPPINGS.get(`url:${shortCode}`)) {
        shortCode = generateShortCode();
      }
    }

    // Calculate expiration
    let expiresAt: string | undefined;
    if (expirationDays && parseInt(expirationDays) > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + parseInt(expirationDays));
      expiresAt = expiry.toISOString();
    }

    const urlRecord: UrlRecord = {
      id: `${Date.now()}-${shortCode}`,
      originalUrl: url,
      shortCode,
      clicks: 0,
      createdAt: new Date().toISOString(),
      expiresAt
    };

    // Store in KV
    await c.env.URL_MAPPINGS.put(`url:${shortCode}`, JSON.stringify(urlRecord));
    
    // Store for admin listing (with TTL if expiration set)
    const listKey = `list:${urlRecord.id}`;
    const ttl = expiresAt ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000) : undefined;
    await c.env.URL_MAPPINGS.put(listKey, JSON.stringify(urlRecord), ttl ? { expirationTtl: ttl } : undefined);

    const baseUrl = new URL(c.req.url).origin;
    
    return c.json({
      id: urlRecord.id,
      originalUrl: url,
      shortCode,
      shortUrl: `${baseUrl}/s/${shortCode}`,
      clicks: 0,
      createdAt: urlRecord.createdAt,
      expiresAt
    });

  } catch (error) {
    console.error('URL creation error:', error);
    return c.json({ error: 'Failed to create shortened URL' }, 500);
  }
});

// Get URL info
urlRoutes.get('/:code', async (c) => {
  const code = c.req.param('code');
  
  try {
    const urlData = await c.env.URL_MAPPINGS.get(`url:${code}`);
    if (!urlData) {
      return c.json({ error: 'URL not found' }, 404);
    }

    const urlRecord = JSON.parse(urlData);
    
    // Check expiration
    if (urlRecord.expiresAt && new Date() > new Date(urlRecord.expiresAt)) {
      await c.env.URL_MAPPINGS.delete(`url:${code}`);
      return c.json({ error: 'URL has expired' }, 410);
    }

    const baseUrl = new URL(c.req.url).origin;
    
    return c.json({
      id: urlRecord.id,
      originalUrl: urlRecord.originalUrl,
      shortCode: urlRecord.shortCode,
      shortUrl: `${baseUrl}/s/${urlRecord.shortCode}`,
      clicks: urlRecord.clicks,
      createdAt: urlRecord.createdAt,
      expiresAt: urlRecord.expiresAt
    });

  } catch (error) {
    console.error('URL fetch error:', error);
    return c.json({ error: 'Failed to fetch URL info' }, 500);
  }
});

// Delete URL
urlRoutes.delete('/:code', async (c) => {
  const code = c.req.param('code');
  
  try {
    const urlData = await c.env.URL_MAPPINGS.get(`url:${code}`);
    if (!urlData) {
      return c.json({ error: 'URL not found' }, 404);
    }

    const urlRecord = JSON.parse(urlData);
    
    // Delete both entries
    await c.env.URL_MAPPINGS.delete(`url:${code}`);
    await c.env.URL_MAPPINGS.delete(`list:${urlRecord.id}`);

    return c.json({ message: 'URL deleted successfully' });

  } catch (error) {
    console.error('URL deletion error:', error);
    return c.json({ error: 'Failed to delete URL' }, 500);
  }
});