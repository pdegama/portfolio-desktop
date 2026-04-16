import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const router = Router();

// GET /api/files?path=/some/path
router.get('/', (req, res) => {
  const requestedPath = req.query.path as string || '';
  const homeDir = os.homedir();
  const fullPath = path.join(homeDir, requestedPath);

  // Basic security: ensure the path is within home directory
  if (!fullPath.startsWith(homeDir)) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  try {
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    const result = items.map(item => {
      const itemPath = path.join(fullPath, item.name);
      const stats = fs.statSync(itemPath);
      return {
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        size: item.isFile() ? stats.size : null,
        modified: stats.mtime,
      };
    });
    res.json({ success: true, data: result, cwd: requestedPath });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to read directory' });
  }
});

export default router;