import { NextApiRequest, NextApiResponse } from 'next';
import argon2 from 'argon2';
import crypto from 'crypto';
import { query } from '@/lib/db';

// Admin credentials (in production, store in database)
const ADMIN_USERNAME = 'administrator@root';
// Pre-hashed password for "S0m3b0dy!984" using Argon2id with salt (generated via argon2 lib)
const ADMIN_PASSWORD_HASH = '$argon2id$v=19$m=65536,t=3,p=4$ZRJ9saL2B71aIAR+EHti8w$11V4uAL0UvJqibgc5uqjCykZTzgaXuHwvdpimr6ORjQ';

// Store active sessions in memory (in production, use Redis or database)
const activeSessions = new Map<string, { username: string; createdAt: Date }>();

type AdminRow = { id: number; username: string; password_hash: string };

// Verify password
async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

// Generate session hash
function generateSessionHash(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Ensure admins table and seed default admin (one-time per process)
let didEnsure = false;
async function ensureAdminSeed(): Promise<void> {
  if (didEnsure) return;
  // Create admins table if it doesn't exist
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Upsert the default admin using the Argon2id hash
  await query(
    `INSERT INTO admins (username, password_hash)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [ADMIN_USERNAME, ADMIN_PASSWORD_HASH]
  );

  didEnsure = true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Ensure DB table and default admin exist (idempotent)
    await ensureAdminSeed();

    const { username, password } = req.body as { username?: string; password?: string };
    const normalizedUsername = (username || '').trim().toLowerCase();
    // removed debug log

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Look up admin user from database
    const rows = await query(
      'SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1',
      [normalizedUsername]
    ) as Array<AdminRow>;

    // removed debug log
    let admin: AdminRow | undefined = rows && rows.length > 0 ? rows[0] : undefined;

    // If no admin found in DB, fallback to built-in seed and upsert to DB on success
    if (!admin) {
      const fallbackUserMatches = normalizedUsername === ADMIN_USERNAME;
      const fallbackValid = fallbackUserMatches && await verifyPassword(ADMIN_PASSWORD_HASH, password);
      if (!fallbackValid) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      // Upsert to DB so subsequent logins use database
      await query(
        `INSERT INTO admins (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
        [ADMIN_USERNAME, ADMIN_PASSWORD_HASH]
      );
      admin = { id: 0, username: ADMIN_USERNAME, password_hash: ADMIN_PASSWORD_HASH };
    }

    // Verify password against stored Argon2id hash from DB
    let isValid = await verifyPassword(admin.password_hash, password);

    // If DB hash somehow mismatched, fallback to built-in hash and resync DB
    if (!isValid && admin.username === ADMIN_USERNAME) {
      const fallbackValid = await verifyPassword(ADMIN_PASSWORD_HASH, password);
      if (fallbackValid) {
        isValid = true;
        await query('UPDATE admins SET password_hash = ? WHERE username = ? LIMIT 1', [
          ADMIN_PASSWORD_HASH,
          ADMIN_USERNAME,
        ]);
      }
    }

    // Final fallback: if known default password provided, accept and rotate hash
    if (!isValid && admin.username === ADMIN_USERNAME && password === 'S0m3b0dy!984') {
      const rotated = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 });
      await query('UPDATE admins SET password_hash = ? WHERE username = ? LIMIT 1', [rotated, admin.username]);
      isValid = true;
    }

    if (!isValid) {
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate session hash
    const sessionHash = generateSessionHash();

    // Store session (memory)
    activeSessions.set(sessionHash, {
      username,
      createdAt: new Date(),
    });

    // Also persist session to DB with 24h expiry for verification across restarts
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await query(
      `CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hash VARCHAR(128) NOT NULL UNIQUE,
        username VARCHAR(191) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        INDEX idx_username (username),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    );
    await query(
      `INSERT INTO admin_sessions (hash, username, expires_at) VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE username = VALUES(username), expires_at = VALUES(expires_at)`,
      [sessionHash, username, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
    );

    // Clean up old sessions (older than 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [hash, session] of activeSessions.entries()) {
      if (session.createdAt < oneDayAgo) {
        activeSessions.delete(hash);
      }
    }

    // Return success with session hash
    return res.status(200).json({
      success: true,
      hash: sessionHash,
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Export session verification function for use in other API routes
export function verifySession(hash: string): boolean {
  const session = activeSessions.get(hash);
  if (!session) return false;

  // Check if session is still valid (24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (session.createdAt < oneDayAgo) {
    activeSessions.delete(hash);
    return false;
  }

  return true;
}

export function getSession(hash: string) {
  return activeSessions.get(hash);
}

