import { Router } from 'express';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const router = Router();

const aasvgBin = path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'aasvg');

// POST /api/goat — convert GoAT ASCII diagram to SVG
router.post('/', (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing "code" in request body' });
  }

  const tmpDir = os.tmpdir();
  const id = Date.now() + '-' + Math.random().toString(36).slice(2);
  const tmpIn = path.join(tmpDir, `goat-in-${id}.txt`);
  const tmpOut = path.join(tmpDir, `goat-out-${id}.svg`);

  const cleanup = () => {
    fs.unlink(tmpIn, () => { });
    fs.unlink(tmpOut, () => { });
  };

  fs.writeFileSync(tmpIn, code);

  exec(
    `"${aasvgBin}" < "${tmpIn}" > "${tmpOut}"`,
    { timeout: 10000 },
    (err) => {
      if (err) {
        cleanup();
        return res.status(500).json({ success: false, error: 'Failed to render diagram' });
      }

      try {
        let svg = fs.readFileSync(tmpOut, 'utf-8');
        svg = svg.replace(
          ":root { color-scheme: light dark; --aasvg-b: light-dark(black, white); --aasvg-w: light-dark(white, black); }",
          ":root { color-scheme: light dark; --aasvg-b: var(--foreground); --aasvg-w: var(--background); }",
        )
        svg = svg.replace(
          "* {",
          ".aasvg * {"
        )

        console.log(svg);


        // cleanup();
        res.type('image/svg+xml').send(svg);
      } catch {
        // cleanup();
        res.status(500).json({ success: false, error: 'Failed to read output' });
      }
    },
  );
});

export default router;
