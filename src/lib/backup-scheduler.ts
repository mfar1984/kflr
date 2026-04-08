import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let scheduledTask: NodeJS.Timeout | null = null;

export function startBackupScheduler(schedule: string, enabled: boolean) {
  // Stop existing task if any
  if (scheduledTask) {
    clearInterval(scheduledTask);
    scheduledTask = null;
  }

  if (!enabled) {
    console.log('Backup scheduler disabled');
    return;
  }

  // Convert schedule to milliseconds
  let intervalMs: number;
  switch (schedule) {
    case 'hourly':
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case 'daily':
      intervalMs = 24 * 60 * 60 * 1000; // 24 hours
      break;
    case 'weekly':
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      break;
    case 'monthly':
      intervalMs = 30 * 24 * 60 * 60 * 1000; // 30 days
      break;
    default:
      intervalMs = 24 * 60 * 60 * 1000; // Default to daily
  }

  // Schedule the backup task
  scheduledTask = setInterval(async () => {
    console.log(`Running scheduled backup (${schedule})...`);
    
    try {
      // Call the backup API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/backup/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        console.log('Scheduled backup completed successfully:', data.backupName);
        
        // Run cleanup after backup
        const cleanupResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/backup/cleanup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const cleanupData = await cleanupResponse.json();
        if (cleanupData.success) {
          console.log('Backup cleanup completed:', cleanupData.message);
        }
      } else {
        console.error('Scheduled backup failed:', data.message);
      }
    } catch (error) {
      console.error('Scheduled backup error:', error);
    }
  }, intervalMs);

  console.log(`Backup scheduler started: ${schedule} (every ${intervalMs}ms)`);
}

export function stopBackupScheduler() {
  if (scheduledTask) {
    clearInterval(scheduledTask);
    scheduledTask = null;
    console.log('Backup scheduler stopped');
  }
}
