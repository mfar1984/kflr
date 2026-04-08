import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';

const execAsync = promisify(exec);

interface BackupSettings {
  backup_include_database: boolean;
  backup_include_files: boolean;
  backup_location: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch backup settings from database
    const rows = await query(
      'SELECT setting_key, setting_value FROM site_settings WHERE setting_type = ?',
      ['backup']
    ) as any[];

    const settings: any = {};
    rows.forEach((row) => {
      let value: any = row.setting_value;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      settings[row.setting_key] = value;
    });

    const backupSettings: BackupSettings = {
      backup_include_database: settings.backup_include_database || false,
      backup_include_files: settings.backup_include_files || false,
      backup_location: settings.backup_location || 'local',
    };

    // Create backup directory if not exists
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(backupDir, backupName);

    // Create backup subdirectory
    fs.mkdirSync(backupPath, { recursive: true });

    const results: string[] = [];

    // Backup Database
    if (backupSettings.backup_include_database) {
      try {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbUser = process.env.DB_USER || 'root';
        const dbPassword = process.env.DB_PASSWORD || '';
        const dbName = process.env.DB_NAME || 'kflr';

        const dumpFile = path.join(backupPath, 'database.sql');
        
        // Use mysqldump command
        const dumpCommand = `mysqldump -h ${dbHost} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} > "${dumpFile}"`;
        
        await execAsync(dumpCommand);
        results.push('Database backed up successfully');
      } catch (error) {
        console.error('Database backup error:', error);
        results.push('Database backup failed: ' + (error as Error).message);
      }
    }

    // Backup Files
    if (backupSettings.backup_include_files) {
      try {
        const publicDir = path.join(process.cwd(), 'public');
        const uploadsBackup = path.join(backupPath, 'uploads');
        
        // Copy public/uploads directory if exists
        if (fs.existsSync(path.join(publicDir, 'uploads'))) {
          fs.cpSync(path.join(publicDir, 'uploads'), uploadsBackup, { recursive: true });
          results.push('Files backed up successfully');
        } else {
          results.push('No uploads directory found');
        }
      } catch (error) {
        console.error('Files backup error:', error);
        results.push('Files backup failed: ' + (error as Error).message);
      }
    }

    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      database: backupSettings.backup_include_database,
      files: backupSettings.backup_include_files,
      location: backupSettings.backup_location,
      size: getDirectorySize(backupPath),
    };

    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Log backup to database
    await query(
      `INSERT INTO site_settings_audit (setting_key, old_value, new_value, changed_by) 
       VALUES (?, ?, ?, ?)`,
      ['backup_created', '', backupName, 'admin']
    );

    return res.status(200).json({
      success: true,
      message: 'Backup created successfully',
      backupName,
      results,
      path: backupPath,
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create backup: ' + (error as Error).message,
    });
  }
}

function getDirectorySize(dirPath: string): string {
  let totalSize = 0;

  function calculateSize(currentPath: string) {
    const stats = fs.statSync(currentPath);
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach((file) => {
        calculateSize(path.join(currentPath, file));
      });
    }
  }

  try {
    calculateSize(dirPath);
    // Convert to MB
    return (totalSize / (1024 * 1024)).toFixed(2) + ' MB';
  } catch (error) {
    return '0 MB';
  }
}
