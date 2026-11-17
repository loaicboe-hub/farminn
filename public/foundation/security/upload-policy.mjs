/**
 * Master Foundation — Portable Upload Validation Helper (Zero Dependencies)
 * Enforces extension, MIME, size, and strict binary signature validation
 * across image, brandIcon, and document categories matching config/security-policy.json.
 */

import crypto from 'node:crypto';

const BLOCKED_EXTENSIONS = new Set([
  'php', 'phtml', 'php3', 'php4', 'php5', 'phar',
  'js', 'mjs', 'cjs', 'ts', 'html', 'htm', 'xhtml', 'svg',
  'exe', 'dll', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'py', 'rb', 'pl', 'cgi', 'asp', 'aspx', 'jsp',
  'docm', 'xlsm', 'zip', 'jar', 'apk'
]);

const CATEGORY_RULES = {
  image: {
    maxBytes: 5 * 1024 * 1024,
    extensions: new Set(['jpg', 'jpeg', 'png', 'webp', 'avif']),
    mimeTypes: new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
  },
  brandIcon: {
    maxBytes: 1 * 1024 * 1024,
    extensions: new Set(['png', 'ico', 'webp']),
    mimeTypes: new Set(['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/webp'])
  },
  document: {
    maxBytes: 10 * 1024 * 1024,
    extensions: new Set(['pdf', 'docx', 'xlsx']),
    mimeTypes: new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ])
  }
};

function containsAsciiCaseInsensitive(buffer, lowercaseNeedle) {
  const needleLen = lowercaseNeedle.length;
  if (buffer.length < needleLen) return false;
  const limit = buffer.length - needleLen;
  for (let i = 0; i <= limit; i += 1) {
    let matched = true;
    for (let j = 0; j < needleLen; j += 1) {
      let byte = buffer[i + j];
      if (byte >= 65 && byte <= 90) byte += 32;
      if (byte !== lowercaseNeedle.charCodeAt(j)) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

function isAvifIsobmff(buffer) {
  if (buffer.length < 16) return false;
  if (buffer.subarray(4, 8).toString('ascii') !== 'ftyp') return false;
  const boxSize = buffer.readUInt32BE(0);
  if (boxSize < 16) return false;
  const ftypSize = Math.min(boxSize, buffer.length, 128);
  const majorBrand = buffer.subarray(8, 12).toString('ascii');
  if (majorBrand === 'avif' || majorBrand === 'avis') return true;
  for (let offset = 16; offset + 4 <= ftypSize; offset += 4) {
    const compatBrand = buffer.subarray(offset, offset + 4).toString('ascii');
    if (compatBrand === 'avif' || compatBrand === 'avis') return true;
  }
  return false;
}

function isCleanOoxmlZip(buffer, expectedPrefix) {
  if (buffer.length < 30) return false;
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
    return false;
  }
  const hasContentTypes = buffer.includes(Buffer.from('[Content_Types].xml', 'ascii'));
  const hasExpectedFolder = buffer.includes(Buffer.from(expectedPrefix, 'ascii'));
  const hasVbaMacros = containsAsciiCaseInsensitive(buffer, 'vbaproject.bin');
  return hasContentTypes && hasExpectedFolder && !hasVbaMacros;
}

function matchesMagicBytes(buffer, ext) {
  if (!buffer || buffer.length < 12) return false;
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'png':
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    case 'ico':
      return buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00;
    case 'webp':
      return (
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    case 'avif':
      return isAvifIsobmff(buffer);
    case 'pdf':
      return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
    case 'docx':
      return isCleanOoxmlZip(buffer, 'word/');
    case 'xlsx':
      return isCleanOoxmlZip(buffer, 'xl/');
    default:
      return false;
  }
}

/**
 * Validate an uploaded file buffer on the backend.
 * @param {object} params
 * @param {string} params.originalName
 * @param {string} params.mimeType
 * @param {Uint8Array|Buffer} params.buffer
 * @param {'image'|'brandIcon'|'document'} [params.category='image']
 */
export function validateUpload({ originalName, mimeType, buffer, category = 'image' }) {
  const rules = CATEGORY_RULES[category];
  if (!rules) {
    return { valid: false, reason: 'Unsupported upload category.' };
  }

  const safeName = String(originalName || '').trim();
  const extMatch = safeName.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = extMatch ? extMatch[1] : '';

  if (!ext || BLOCKED_EXTENSIONS.has(ext) || !rules.extensions.has(ext)) {
    return { valid: false, reason: 'File extension is not permitted.' };
  }

  if (!rules.mimeTypes.has(String(mimeType || '').toLowerCase())) {
    return { valid: false, reason: 'Declared MIME type is not permitted.' };
  }

  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  if (bytes.length === 0 || bytes.length > rules.maxBytes) {
    return { valid: false, reason: 'File size is empty or exceeds the maximum allowed limit.' };
  }

  if (!matchesMagicBytes(bytes, ext)) {
    return { valid: false, reason: 'File binary signature does not match declared file type.' };
  }

  const sha256Checksum = crypto.createHash('sha256').update(bytes).digest('hex');
  const storedFilename = `${crypto.randomUUID()}.${ext}`;

  return {
    valid: true,
    extension: ext,
    sizeBytes: bytes.length,
    sha256Checksum,
    storedFilename
  };
}
