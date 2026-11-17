import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { exportPublicKey, signDownloadLease, verifyDownloadLease } from '../src/index.js';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
const claims = { sub: 'user-1', deviceId: 'device-hash', nonce: 'one-time-random', downloadId: 'download-42', iat: 1000, exp: 1060 };

test('signs and verifies a download-specific Ed25519 lease', () => {
  const token = signDownloadLease(claims, privatePem);
  assert.equal(verifyDownloadLease(token, publicPem, { nonce: claims.nonce, deviceId: claims.deviceId, downloadId: claims.downloadId }, 1030).ok, true);
});

test('rejects a lease bound to a different nonce or device', () => {
  const token = signDownloadLease(claims, privatePem);
  assert.equal(verifyDownloadLease(token, publicPem, { nonce: 'replayed' }, 1030).reason, 'nonce-mismatch');
  assert.equal(verifyDownloadLease(token, publicPem, { deviceId: 'other-device' }, 1030).reason, 'device-mismatch');
});

test('rejects expired or modified leases', () => {
  const token = signDownloadLease(claims, privatePem);
  assert.equal(verifyDownloadLease(token, publicPem, {}, 1060).reason, 'expired');
  const [payload, signature] = token.split('.');
  const altered = `${Buffer.from(JSON.stringify({ ...claims, sub: 'attacker' })).toString('base64url')}.${signature}`;
  assert.equal(verifyDownloadLease(altered, publicPem, {}, 1030).reason, 'invalid-signature');
});

test('requires complete claims, bounds the lease lifetime, and accepts Ed25519 keys', () => {
  assert.throws(() => signDownloadLease({ ...claims, nonce: '' }, privatePem), /nonce/);
  const longLease = signDownloadLease({ ...claims, exp: claims.iat + 301 }, privatePem);
  assert.equal(verifyDownloadLease(longLease, publicPem, {}, 1030).reason, 'invalid-claims');
  assert.equal(exportPublicKey(privatePem), publicPem);
});
