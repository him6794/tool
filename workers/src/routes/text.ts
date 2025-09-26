import { Hono } from 'hono';
import { Env, TextRecord } from '../types';
import { generateFileId } from '../utils/helpers';

export const textRoutes = new Hono<{ Bindings: Env }>();

// Create text paste
textRoutes.post('/', async (c) => {
  try {
    const { content, contentType = 'text/plain', expirationDays, password } = await c.req.json();

    if (!content || !content.trim()) {
      return c.json({ error: 'Content cannot be empty' }, 400);
    }

    if (content.length > 1024 * 1024) { // 1MB limit for text
      return c.json({ error: 'Content too large. Maximum size is 1MB' }, 413);
    }

    const textId = generateFileId();

    // Calculate expiration
    let expiresAt: string | undefined;
    if (expirationDays && parseInt(expirationDays) > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + parseInt(expirationDays));
      expiresAt = expiry.toISOString();
    }

    const textRecord: TextRecord = {
      id: textId,
      content,
      contentType,
      views: 0,
      createdAt: new Date().toISOString(),
      expiresAt,
      hasPassword: !!password
    };

    // Store in R2 as a text file
    const filename = `text/${textId}.txt`;
    await c.env.FILES_BUCKET.put(filename, content, {
      httpMetadata: {
        contentType: contentType || 'text/plain',
        contentLength: content.length.toString()
      },
      customMetadata: {
        type: 'text-paste',
        uploadTime: new Date().toISOString(),
        hasPassword: password ? 'true' : 'false'
      }
    });

    // Store metadata in KV
    await c.env.URL_MAPPINGS.put(`text:${textId}`, JSON.stringify(textRecord));
    
    // Store password hash if provided
    if (password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      await c.env.URL_MAPPINGS.put(`text:${textId}:password`, hashHex);
    }

    const baseUrl = new URL(c.req.url).origin;
    
    return c.json({
      id: textId,
      size: content.length,
      contentType,
      views: 0,
      viewUrl: `${baseUrl}/api/text/${textId}`,
      shareUrl: `${baseUrl}/t/${textId}`,
      createdAt: textRecord.createdAt,
      expiresAt,
      hasPassword: !!password
    });

  } catch (error) {
    console.error('Text creation error:', error);
    return c.json({ error: 'Failed to create text paste' }, 500);
  }
});

// Get text content
textRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const password = c.req.query('password');
  const raw = c.req.query('raw') === 'true';
  
  try {
    const textData = await c.env.URL_MAPPINGS.get(`text:${id}`);
    if (!textData) {
      return c.json({ error: 'Text not found' }, 404);
    }

    const textRecord: TextRecord = JSON.parse(textData);
    
    // Check expiration
    if (textRecord.expiresAt && new Date() > new Date(textRecord.expiresAt)) {
      // Clean up expired text
      await c.env.FILES_BUCKET.delete(`text/${id}.txt`);
      await c.env.URL_MAPPINGS.delete(`text:${id}`);
      if (textRecord.hasPassword) {
        await c.env.URL_MAPPINGS.delete(`text:${id}:password`);
      }
      return c.json({ error: 'Text has expired' }, 410);
    }

    // Check password if required
    if (textRecord.hasPassword) {
      if (!password) {
        return c.json({ error: 'Password required' }, 401);
      }

      const storedHash = await c.env.URL_MAPPINGS.get(`text:${id}:password`);
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex !== storedHash) {
        return c.json({ error: 'Incorrect password' }, 403);
      }
    }

    // Get text from R2
    const textFile = await c.env.FILES_BUCKET.get(`text/${id}.txt`);
    if (!textFile) {
      return c.json({ error: 'Text content not found in storage' }, 404);
    }

    const content = await textFile.text();

    // Increment view count
    textRecord.views++;
    await c.env.URL_MAPPINGS.put(`text:${id}`, JSON.stringify(textRecord));

    if (raw) {
      // Return raw text content
      return new Response(content, {
        headers: {
          'Content-Type': textRecord.contentType,
          'Cache-Control': 'private, no-cache'
        }
      });
    }

    const baseUrl = new URL(c.req.url).origin;
    
    return c.json({
      id: textRecord.id,
      content,
      contentType: textRecord.contentType,
      size: content.length,
      views: textRecord.views,
      createdAt: textRecord.createdAt,
      expiresAt: textRecord.expiresAt,
      viewUrl: `${baseUrl}/api/text/${id}`,
      rawUrl: `${baseUrl}/api/text/${id}?raw=true`,
      shareUrl: `${baseUrl}/t/${id}`
    });

  } catch (error) {
    console.error('Text fetch error:', error);
    return c.json({ error: 'Failed to fetch text' }, 500);
  }
});

// Get text info (without content)
textRoutes.get('/:id/info', async (c) => {
  const id = c.req.param('id');
  
  try {
    const textData = await c.env.URL_MAPPINGS.get(`text:${id}`);
    if (!textData) {
      return c.json({ error: 'Text not found' }, 404);
    }

    const textRecord: TextRecord = JSON.parse(textData);
    
    // Check expiration
    if (textRecord.expiresAt && new Date() > new Date(textRecord.expiresAt)) {
      return c.json({ error: 'Text has expired' }, 410);
    }

    const baseUrl = new URL(c.req.url).origin;
    
    return c.json({
      id: textRecord.id,
      size: textRecord.content.length,
      contentType: textRecord.contentType,
      views: textRecord.views,
      createdAt: textRecord.createdAt,
      expiresAt: textRecord.expiresAt,
      hasPassword: textRecord.hasPassword,
      viewUrl: `${baseUrl}/api/text/${id}`,
      rawUrl: `${baseUrl}/api/text/${id}?raw=true`,
      shareUrl: `${baseUrl}/t/${id}`
    });

  } catch (error) {
    console.error('Text info error:', error);
    return c.json({ error: 'Failed to get text info' }, 500);
  }
});

// Delete text
textRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const textData = await c.env.URL_MAPPINGS.get(`text:${id}`);
    if (!textData) {
      return c.json({ error: 'Text not found' }, 404);
    }

    const textRecord: TextRecord = JSON.parse(textData);
    
    // Delete from R2
    await c.env.FILES_BUCKET.delete(`text/${id}.txt`);
    
    // Delete metadata
    await c.env.URL_MAPPINGS.delete(`text:${id}`);
    if (textRecord.hasPassword) {
      await c.env.URL_MAPPINGS.delete(`text:${id}:password`);
    }

    return c.json({ message: 'Text deleted successfully' });

  } catch (error) {
    console.error('Text deletion error:', error);
    return c.json({ error: 'Failed to delete text' }, 500);
  }
});