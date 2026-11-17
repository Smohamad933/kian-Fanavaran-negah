import { sign, verify, createPrivateKey, createPublicKey } from 'node:crypto';

const encoder = new TextEncoder();
const toBase64Url = (bytes) => Buffer.from(bytes).toString('base64url');
const fromBase64Url = (value) => Buffer.from(value, 'base64url');

/**
 * Sign a short-lived, download-specific authorization grant with an Ed25519 key.
 * The private key belongs on the license server only; never bundle it with the app.
 */
export function signDownloadLease(claims, privateKeyPem) {
  const required = ['sub', 'deviceId', 'nonce', 'downloadId', 'iat', 'exp'];
  for (const field of required) {
    if (claims[field] === undefined || claims[field] === null || claims[field] === '') {
      throw new TypeError(`Missing required lease claim: ${field}`);
    }
  }
  if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp) || claims.exp <= claims.iat) {
    throw new TypeError('Lease timestamps must be integer seconds and exp must follow iat');
  }
  const payload = toBase64Url(encoder.encode(JSON.stringify(claims)));
  const key = createPrivateKey(privateKeyPem);
  if (key.asymmetricKeyType !== 'ed25519') throw new TypeError('Expected an Ed25519 private key');
  const signature = sign(null, Buffer.from(payload), key);
  return `${payload}.${toBase64Url(signature)}`;
}

/** Verify signature, expiry, and the request-specific nonce/device binding. */
export function verifyDownloadLease(token, publicKeyPem, expected = {}, now = Math.floor(Date.now() / 1000)) {
  if (typeof token !== 'string') return { ok: false, reason: 'malformed' };
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: 'malformed' };

  try {
    const publicKey = createPublicKey(publicKeyPem);
    if (publicKey.asymmetricKeyType !== 'ed25519') return { ok: false, reason: 'invalid-key' };
    if (!verify(null, Buffer.from(parts[0]), publicKey, fromBase64Url(parts[1]))) {
      return { ok: false, reason: 'invalid-signature' };
    }
    const claims = JSON.parse(fromBase64Url(parts[0]).toString('utf8'));
    const required = ['sub', 'deviceId', 'nonce', 'downloadId', 'iat', 'exp'];
    if (required.some((field) => claims[field] === undefined || claims[field] === null || claims[field] === '')) {
      return { ok: false, reason: 'invalid-claims' };
    }
    if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp) || claims.exp <= claims.iat || claims.exp - claims.iat > 300) {
      return { ok: false, reason: 'invalid-claims' };
    }
    if (claims.iat > now + 30) return { ok: false, reason: 'not-yet-valid' };
    if (claims.exp <= now) return { ok: false, reason: 'expired' };
    if (expected.nonce !== undefined && claims.nonce !== expected.nonce) return { ok: false, reason: 'nonce-mismatch' };
    if (expected.deviceId !== undefined && claims.deviceId !== expected.deviceId) return { ok: false, reason: 'device-mismatch' };
    if (expected.downloadId !== undefined && claims.downloadId !== expected.downloadId) return { ok: false, reason: 'download-mismatch' };
    return { ok: true, claims };
  } catch {
    return { ok: false, reason: 'malformed' };
  }
}

/** Public key in PEM form for embedding in the desktop client. */
export function exportPublicKey(privateKeyPem) {
  return createPublicKey(createPrivateKey(privateKeyPem)).export({ type: 'spki', format: 'pem' });
}
