import crypto from 'crypto'

// AES-256-GCM encryption for OAuth tokens at rest. The key is derived from
// TOKEN_ENC_KEY (any strong random string) so rotation means re-connecting
// integrations. Without the env var, connectors refuse to store tokens.

function getKey(): Buffer | null {
  const secret = process.env.TOKEN_ENC_KEY
  if (!secret || secret.length < 16) return null
  return crypto.createHash('sha256').update(secret).digest()
}

export function tokenEncryptionAvailable(): boolean {
  return getKey() !== null
}

export function encryptToken(plain: string): string {
  const key = getKey()
  if (!key) throw new Error('TOKEN_ENC_KEY is not configured')
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}.${tag.toString('base64')}.${ciphertext.toString('base64')}`
}

export function decryptToken(stored: string): string | null {
  const key = getKey()
  if (!key) return null
  try {
    const [iv, tag, ciphertext] = stored.split('.').map((p) => Buffer.from(p, 'base64'))
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}
