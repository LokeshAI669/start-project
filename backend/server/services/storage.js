const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'project-zips';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    console.log(`[STORAGE] Supabase Storage client initialized for bucket '${BUCKET_NAME}'`);
  } catch (err) {
    console.error('[STORAGE] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('[STORAGE] Supabase credentials not detected. Operating in protected server storage mode.');
}

const LOCAL_STORAGE_DIR = path.join(__dirname, '..', '..', 'private_storage');
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

/**
 * Upload a ZIP file to private storage
 * @param {Object} options
 * @param {number|string} options.projectId
 * @param {Buffer} options.buffer
 * @param {string} options.filename
 * @param {string} [options.mimeType='application/zip']
 * @returns {Promise<{ storageKey: string, size: number, filename: string, isSupabase: boolean }>}
 */
async function uploadProjectZip({ projectId, buffer, filename, mimeType = 'application/zip' }) {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageKey = `projects/${projectId}/${Date.now()}-${sanitized}`;

  if (supabase) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storageKey, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('[STORAGE] Supabase upload failed:', error);
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return {
      storageKey: data.path || storageKey,
      size: buffer.length,
      filename: sanitized,
      isSupabase: true,
    };
  }

  // Fallback to protected local storage
  const projectDir = path.join(LOCAL_STORAGE_DIR, String(projectId));
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  const localFilePath = path.join(projectDir, `${Date.now()}-${sanitized}`);
  fs.writeFileSync(localFilePath, buffer);

  return {
    storageKey: path.relative(LOCAL_STORAGE_DIR, localFilePath).replace(/\\/g, '/'),
    size: buffer.length,
    filename: sanitized,
    isSupabase: false,
  };
}

/**
 * Delete a ZIP file from storage
 * @param {string} storageKey
 * @returns {Promise<boolean>}
 */
async function deleteProjectZip(storageKey) {
  if (!storageKey) return false;

  if (supabase) {
    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([storageKey]);
      if (error) console.warn('[STORAGE] Supabase remove warning:', error.message);
      return !error;
    } catch (e) {
      console.error('[STORAGE] Supabase delete exception:', e.message);
      return false;
    }
  }

  // Fallback local file deletion
  try {
    const localPath = path.join(LOCAL_STORAGE_DIR, storageKey);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
  } catch (e) {
    console.error('[STORAGE] Local delete exception:', e.message);
  }
  return false;
}

/**
 * Generate a short-lived (5-minute) signed URL for private download
 * @param {string} storageKey
 * @param {number} [expiresInSeconds=300]
 * @returns {Promise<{ signedUrl: string, localFilePath?: string }>}
 */
async function getSignedDownloadUrl(storageKey, expiresInSeconds = 300) {
  if (!storageKey) {
    throw new Error('No storage key provided for download');
  }

  if (supabase) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storageKey, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`);
    }

    return { signedUrl: data.signedUrl };
  }

  // Fallback: check local storage
  const localPath = path.join(LOCAL_STORAGE_DIR, storageKey);
  if (!fs.existsSync(localPath)) {
    // Check if it's stored in uploads or downloads
    const fallbackPath = path.join(__dirname, '..', '..', 'uploads', path.basename(storageKey));
    if (fs.existsSync(fallbackPath)) {
      return { localFilePath: fallbackPath };
    }
    throw new Error('Project archive file not found on server storage');
  }

  return { localFilePath: localPath };
}

module.exports = {
  uploadProjectZip,
  deleteProjectZip,
  getSignedDownloadUrl,
  isSupabaseConfigured: () => !!supabase,
};
