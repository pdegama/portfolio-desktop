import { Router } from 'express';

const router = Router();

// Sample in-memory data for posts
const posts = [
  { id: 1, title: 'First Post', content: 'Hello World!' },
  { id: 2, title: 'Building a Terminal App', content: 'Using node-pty and xterm.js...' }
];

// GET /api/blog
router.get('/', (req, res) => {
  res.json({ success: true, data: posts });
});

// GET /api/blog/:id
router.get('/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    res.json({ success: true, data: post });
  } else {
    res.status(404).json({ success: false, error: 'Post not found' });
  }
});

export default router;
