import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import * as pty from 'node-pty';
import cors from 'cors';
import * as os from 'os';
import * as http from 'http';
import blogRoutes from './routes/blog';
import filesRoutes from './routes/files';

const app = express();
app.use(cors());
app.use(express.json());

// Main API Router
const apiRouter = express.Router();
apiRouter.use('/blog', blogRoutes);
apiRouter.use('/files', filesRoutes);
// You can add more routes here, e.g. apiRouter.use('/projects', projectsRoutes);

app.use('/api', apiRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected to terminal');

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || process.cwd(),
    env: process.env as Record<string, string>,
  });

  // Pipe pty output to websocket
  ptyProcess.onData((data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  // Pipe websocket input to pty
  ws.on('message', (msg) => {
    try {
      // Check if it's a resize JSON command
      const data = JSON.parse(msg.toString());
      if (data.type === 'resize' && data.cols && data.rows) {
        ptyProcess.resize(data.cols, data.rows);
        return;
      }
    } catch {
      // Otherwise, it's normal input
      ptyProcess.write(msg.toString());
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from terminal');
    ptyProcess.kill();
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Terminal backend listening on http://localhost:${PORT}`);
});
