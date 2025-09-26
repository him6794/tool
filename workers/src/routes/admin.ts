import { Hono } from 'hono';
import { Env, AdminStats, UrlRecord, FileRecord, TextRecord } from '../types';

export const adminRoutes = new Hono<{ Bindings: Env }>();

// Middleware for admin authentication
adminRoutes.use('*', async (c, next) => {
  const authorization = c.req.header('Authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization required' }, 401);
  }

  const password = authorization.slice(7); // Remove "Bearer "
  
  if (password !== c.env.ADMIN_PASSWORD) {
    return c.json({ error: 'Invalid credentials' }, 403);
  }

  await next();
});

// Get admin dashboard stats
adminRoutes.get('/stats', async (c) => {
  try {
    // This is a simplified version - in a real implementation, 
    // you might want to maintain counters for better performance
    const list = await c.env.URL_MAPPINGS.list();
    
    let totalUrls = 0;
    let totalClicks = 0;
    let totalFiles = 0;
    let totalDownloads = 0;
    let storageUsed = 0;
    
    for (const key of list.keys) {
      if (key.name.startsWith('url:')) {
        const data = await c.env.URL_MAPPINGS.get(key.name);
        if (data) {
          const record: UrlRecord = JSON.parse(data);
          totalUrls++;
          totalClicks += record.clicks;
        }
      } else if (key.name.startsWith('file:') && !key.name.includes(':password')) {
        const data = await c.env.URL_MAPPINGS.get(key.name);
        if (data) {
          const record: FileRecord = JSON.parse(data);
          totalFiles++;
          totalDownloads += record.downloads;
          storageUsed += record.size;
        }
      }
    }

    const stats: AdminStats = {
      totalUrls,
      totalClicks,
      totalFiles,
      totalDownloads,
      storageUsed
    };

    return c.json(stats);

  } catch (error) {
    console.error('Stats error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// List all URLs
adminRoutes.get('/urls', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  
  try {
    const list = await c.env.URL_MAPPINGS.list({ prefix: 'url:' });
    const urls: any[] = [];
    
    for (const key of list.keys.slice((page - 1) * limit, page * limit)) {
      const data = await c.env.URL_MAPPINGS.get(key.name);
      if (data) {
        const record: UrlRecord = JSON.parse(data);
        const baseUrl = new URL(c.req.url).origin;
        urls.push({
          ...record,
          shortUrl: `${baseUrl}/s/${record.shortCode}`
        });
      }
    }

    return c.json({
      urls,
      pagination: {
        page,
        limit,
        total: list.keys.length,
        totalPages: Math.ceil(list.keys.length / limit)
      }
    });

  } catch (error) {
    console.error('URLs list error:', error);
    return c.json({ error: 'Failed to fetch URLs' }, 500);
  }
});

// List all files
adminRoutes.get('/files', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  
  try {
    const list = await c.env.URL_MAPPINGS.list({ prefix: 'file:' });
    const files: any[] = [];
    
    for (const key of list.keys.filter(k => !k.name.includes(':password')).slice((page - 1) * limit, page * limit)) {
      const data = await c.env.URL_MAPPINGS.get(key.name);
      if (data) {
        const record: FileRecord = JSON.parse(data);
        const baseUrl = new URL(c.req.url).origin;
        files.push({
          ...record,
          downloadUrl: `${baseUrl}/api/files/${record.id}`,
          shareUrl: `${baseUrl}/f/${record.id}`
        });
      }
    }

    return c.json({
      files,
      pagination: {
        page,
        limit,
        total: list.keys.filter(k => !k.name.includes(':password')).length,
        totalPages: Math.ceil(list.keys.filter(k => !k.name.includes(':password')).length / limit)
      }
    });

  } catch (error) {
    console.error('Files list error:', error);
    return c.json({ error: 'Failed to fetch files' }, 500);
  }
});

// List all text pastes
adminRoutes.get('/texts', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  
  try {
    const list = await c.env.URL_MAPPINGS.list({ prefix: 'text:' });
    const texts: any[] = [];
    
    for (const key of list.keys.filter(k => !k.name.includes(':password')).slice((page - 1) * limit, page * limit)) {
      const data = await c.env.URL_MAPPINGS.get(key.name);
      if (data) {
        const record: TextRecord = JSON.parse(data);
        const baseUrl = new URL(c.req.url).origin;
        texts.push({
          id: record.id,
          contentType: record.contentType,
          size: record.content.length,
          views: record.views,
          createdAt: record.createdAt,
          expiresAt: record.expiresAt,
          hasPassword: record.hasPassword,
          viewUrl: `${baseUrl}/api/text/${record.id}`,
          shareUrl: `${baseUrl}/t/${record.id}`
        });
      }
    }

    return c.json({
      texts,
      pagination: {
        page,
        limit,
        total: list.keys.filter(k => !k.name.includes(':password')).length,
        totalPages: Math.ceil(list.keys.filter(k => !k.name.includes(':password')).length / limit)
      }
    });

  } catch (error) {
    console.error('Texts list error:', error);
    return c.json({ error: 'Failed to fetch texts' }, 500);
  }
});

// Delete URL (admin)
adminRoutes.delete('/urls/:code', async (c) => {
  const code = c.req.param('code');
  
  try {
    const urlData = await c.env.URL_MAPPINGS.get(`url:${code}`);
    if (!urlData) {
      return c.json({ error: 'URL not found' }, 404);
    }

    const urlRecord: UrlRecord = JSON.parse(urlData);
    
    await c.env.URL_MAPPINGS.delete(`url:${code}`);
    await c.env.URL_MAPPINGS.delete(`list:${urlRecord.id}`);

    return c.json({ message: 'URL deleted successfully' });

  } catch (error) {
    console.error('Admin URL deletion error:', error);
    return c.json({ error: 'Failed to delete URL' }, 500);
  }
});

// Delete file (admin)
adminRoutes.delete('/files/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const fileData = await c.env.URL_MAPPINGS.get(`file:${id}`);
    if (!fileData) {
      return c.json({ error: 'File not found' }, 404);
    }

    const fileRecord: FileRecord = JSON.parse(fileData);
    
    await c.env.FILES_BUCKET.delete(`files/${fileRecord.filename}`);
    await c.env.URL_MAPPINGS.delete(`file:${id}`);
    if (fileRecord.hasPassword) {
      await c.env.URL_MAPPINGS.delete(`file:${id}:password`);
    }

    return c.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Admin file deletion error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// Delete text (admin)
adminRoutes.delete('/texts/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const textData = await c.env.URL_MAPPINGS.get(`text:${id}`);
    if (!textData) {
      return c.json({ error: 'Text not found' }, 404);
    }

    const textRecord: TextRecord = JSON.parse(textData);
    
    await c.env.FILES_BUCKET.delete(`text/${id}.txt`);
    await c.env.URL_MAPPINGS.delete(`text:${id}`);
    if (textRecord.hasPassword) {
      await c.env.URL_MAPPINGS.delete(`text:${id}:password`);
    }

    return c.json({ message: 'Text deleted successfully' });

  } catch (error) {
    console.error('Admin text deletion error:', error);
    return c.json({ error: 'Failed to delete text' }, 500);
  }
});

// Cleanup expired items
adminRoutes.post('/cleanup', async (c) => {
  try {
    const list = await c.env.URL_MAPPINGS.list();
    let cleaned = 0;
    const now = new Date();
    
    for (const key of list.keys) {
      const data = await c.env.URL_MAPPINGS.get(key.name);
      if (data) {
        const record = JSON.parse(data);
        
        if (record.expiresAt && new Date(record.expiresAt) < now) {
          // Clean up expired item
          if (key.name.startsWith('url:')) {
            await c.env.URL_MAPPINGS.delete(key.name);
            await c.env.URL_MAPPINGS.delete(`list:${record.id}`);
          } else if (key.name.startsWith('file:') && !key.name.includes(':password')) {
            await c.env.FILES_BUCKET.delete(`files/${record.filename}`);
            await c.env.URL_MAPPINGS.delete(key.name);
            if (record.hasPassword) {
              await c.env.URL_MAPPINGS.delete(`${key.name}:password`);
            }
          } else if (key.name.startsWith('text:') && !key.name.includes(':password')) {
            await c.env.FILES_BUCKET.delete(`text/${record.id}.txt`);
            await c.env.URL_MAPPINGS.delete(key.name);
            if (record.hasPassword) {
              await c.env.URL_MAPPINGS.delete(`${key.name}:password`);
            }
          }
          cleaned++;
        }
      }
    }

    return c.json({ 
      message: `Cleanup completed. Removed ${cleaned} expired items.`,
      cleaned
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return c.json({ error: 'Failed to cleanup expired items' }, 500);
  }
});