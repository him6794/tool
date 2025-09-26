import { Hono } from 'hono';
import { Env, FileRecord } from '../types';
import { generateFileId, sanitizeFilename, getContentType } from '../utils/helpers';

export const fileRoutes = new Hono<{ Bindings: Env }>();

// Upload file
fileRoutes.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const expirationDays = formData.get('expirationDays') as string;
    const password = formData.get('password') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const maxSize = parseInt(c.env.MAX_FILE_SIZE);
    if (file.size > maxSize) {
      return c.json({ error: `File too large. Maximum size is ${Math.floor(maxSize / 1024 / 1024)}MB` }, 413);
    }

    const fileId = generateFileId();
    const filename = `${fileId}-${sanitizeFilename(file.name)}`;
    const contentType = file.type || getContentType(file.name);

    // Calculate expiration
    let expiresAt: string | undefined;
    if (expirationDays && parseInt(expirationDays) > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + parseInt(expirationDays));
      expiresAt = expiry.toISOString();
    }

    const fileRecord: FileRecord = {
      id: fileId,
      filename,
      originalName: file.name,
      contentType,
      size: file.size,
      downloads: 0,
      createdAt: new Date().toISOString(),
      expiresAt,
      hasPassword: !!password
    };

    // Upload file to R2
    const buffer = await file.arrayBuffer();
    await c.env.FILES_BUCKET.put(`files/${filename}`, buffer, {
      httpMetadata: {
        contentType,
        contentLength: file.size.toString()
      },
      customMetadata: {
        originalName: file.name,
        uploadTime: new Date().toISOString(),
        hasPassword: password ? 'true' : 'false'
      }
    });

    // Store metadata in KV
    await c.env.URL_MAPPINGS.put(`file:${fileId}`, JSON.stringify(fileRecord));
    
    // Store password hash if provided
    if (password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      await c.env.URL_MAPPINGS.put(`file:${fileId}:password`, hashHex);
    }

    const baseUrl = new URL(c.req.url).origin;
    
    return c.json({
      id: fileId,
      filename: file.name,
      size: file.size,
      downloadUrl: `${baseUrl}/api/files/${fileId}`,
      shareUrl: `${baseUrl}/f/${fileId}`,
      downloads: 0,
      createdAt: fileRecord.createdAt,
      expiresAt,
      hasPassword: !!password
    });

  } catch (error) {
    console.error('File upload error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Download file
fileRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const password = c.req.query('password');
  
  try {
    const fileData = await c.env.URL_MAPPINGS.get(`file:${id}`);
    if (!fileData) {
      return c.json({ error: 'File not found' }, 404);
    }

    const fileRecord: FileRecord = JSON.parse(fileData);
    
    // Check expiration
    if (fileRecord.expiresAt && new Date() > new Date(fileRecord.expiresAt)) {
      // Clean up expired file
      await c.env.FILES_BUCKET.delete(`files/${fileRecord.filename}`);
      await c.env.URL_MAPPINGS.delete(`file:${id}`);
      if (fileRecord.hasPassword) {
        await c.env.URL_MAPPINGS.delete(`file:${id}:password`);
      }
      return c.json({ error: 'File has expired' }, 410);
    }

    // Check password if required
    if (fileRecord.hasPassword) {
      if (!password) {
        return c.json({ error: 'Password required' }, 401);
      }

      const storedHash = await c.env.URL_MAPPINGS.get(`file:${id}:password`);
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex !== storedHash) {
        return c.json({ error: 'Incorrect password' }, 403);
      }
    }

    // Get file from R2
    const file = await c.env.FILES_BUCKET.get(`files/${fileRecord.filename}`);
    if (!file) {
      return c.json({ error: 'File not found in storage' }, 404);
    }

    // Increment download count
    fileRecord.downloads++;
    await c.env.URL_MAPPINGS.put(`file:${id}`, JSON.stringify(fileRecord));

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', fileRecord.contentType);
    headers.set('Content-Length', fileRecord.size.toString());
    headers.set('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
    headers.set('Cache-Control', 'private, no-cache');

    return new Response(file.body, { headers });

  } catch (error) {
    console.error('File download error:', error);
    return c.json({ error: 'Failed to download file' }, 500);
  }
});

// Get file info
fileRoutes.get('/:id/info', async (c) => {
  const id = c.req.param('id');
  
  try {
    const fileData = await c.env.URL_MAPPINGS.get(`file:${id}`);
    if (!fileData) {
      return c.json({ error: 'File not found' }, 404);
    }

    const fileRecord: FileRecord = JSON.parse(fileData);
    
    // Check expiration
    if (fileRecord.expiresAt && new Date() > new Date(fileRecord.expiresAt)) {
      return c.json({ error: 'File has expired' }, 410);
    }

    const baseUrl = new URL(c.req.url).origin;
    
    return c.json({
      id: fileRecord.id,
      filename: fileRecord.originalName,
      size: fileRecord.size,
      contentType: fileRecord.contentType,
      downloads: fileRecord.downloads,
      createdAt: fileRecord.createdAt,
      expiresAt: fileRecord.expiresAt,
      hasPassword: fileRecord.hasPassword,
      downloadUrl: `${baseUrl}/api/files/${id}`,
      shareUrl: `${baseUrl}/f/${id}`
    });

  } catch (error) {
    console.error('File info error:', error);
    return c.json({ error: 'Failed to get file info' }, 500);
  }
});

// Delete file
fileRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const fileData = await c.env.URL_MAPPINGS.get(`file:${id}`);
    if (!fileData) {
      return c.json({ error: 'File not found' }, 404);
    }

    const fileRecord: FileRecord = JSON.parse(fileData);
    
    // Delete from R2
    await c.env.FILES_BUCKET.delete(`files/${fileRecord.filename}`);
    
    // Delete metadata
    await c.env.URL_MAPPINGS.delete(`file:${id}`);
    if (fileRecord.hasPassword) {
      await c.env.URL_MAPPINGS.delete(`file:${id}:password`);
    }

    return c.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('File deletion error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});