const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname, 'dist');

app.use(express.static(STATIC_DIR, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (filePath.includes(`${path.sep}_astro${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
  },
}));

app.get('/healthz', (_req, res) => res.type('text/plain').send('ok'));

app.use((_req, res) => {
  res.status(404).sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`vibe-coders-guides listening on :${PORT}`);
});
