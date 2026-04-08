// Login Attempt Tracking
// Prevents brute force attacks by tracking and limiting failed login attempts

interface LoginAttemptRecord {
  count: number;
  lockedUntil?: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const RESET_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Check if login is allowed for a username
 * @param username - Username attempting to login
 * @returns Object with allowed status and lockout info
 */
export function checkLoginAttempts(username: string): { 
  allowed: boolean; 
  lockedUntil?: number;
  remainingAttempts?: number;
} {
  const normalizedUsername = username.toLowerCase().trim();
  const record = loginAttempts.get(normalizedUsername);
  const now = Date.now();
  
  // No record - allow login
  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }
  
  // Check if account is locked
  if (record.lockedUntil && now < record.lockedUntil) {
    return { 
      allowed: false, 
      lockedUntil: record.lockedUntil,
      remainingAttempts: 0,
    };
  }
  
  // Reset if last attempt was more than 1 hour ago
  if (now - record.lastAttempt > RESET_WINDOW) {
    loginAttempts.delete(normalizedUsername);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }
  
  // Allow login but track remaining attempts
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - record.count);
  return { allowed: true, remainingAttempts };
}

/**
 * Record a failed login attempt
 * @param username - Username that failed login
 * @returns Object with lockout status
 */
export function recordFailedLogin(username: string): {
  locked: boolean;
  lockedUntil?: number;
  remainingAttempts: number;
} {
  const normalizedUsername = username.toLowerCase().trim();
  const now = Date.now();
  const record = loginAttempts.get(normalizedUsername) || { 
    count: 0, 
    lastAttempt: now 
  };
  
  record.count++;
  record.lastAttempt = now;
  
  // Lock account after max attempts
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
    loginAttempts.set(normalizedUsername, record);
    
    console.warn(`Account locked: ${normalizedUsername} - Too many failed login attempts`);
    
    return {
      locked: true,
      lockedUntil: record.lockedUntil,
      remainingAttempts: 0,
    };
  }
  
  loginAttempts.set(normalizedUsername, record);
  
  const remainingAttempts = MAX_ATTEMPTS - record.count;
  console.warn(`Failed login attempt for: ${normalizedUsername} - ${remainingAttempts} attempts remaining`);
  
  return {
    locked: false,
    remainingAttempts,
  };
}

/**
 * Reset login attempts for a username (after successful login)
 * @param username - Username to reset
 */
export function resetLoginAttempts(username: string): void {
  const normalizedUsername = username.toLowerCase().trim();
  loginAttempts.delete(normalizedUsername);
}

/**
 * Clean up old login attempt records
 * Runs periodically to prevent memory leaks
 */
export function cleanupLoginAttempts(): void {
  const now = Date.now();
  for (const [username, record] of loginAttempts.entries()) {
    // Remove records older than reset window and not locked
    if (now - record.lastAttempt > RESET_WINDOW && (!record.lockedUntil || now > record.lockedUntil)) {
      loginAttempts.delete(username);
    }
  }
}

// Clean up every hour
setInterval(cleanupLoginAttempts, 60 * 60 * 1000);

// Export for testing
export { loginAttempts, MAX_ATTEMPTS, LOCKOUT_DURATION };
