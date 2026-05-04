const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
  },
}));

app.get('/healthz', (_req, res) => res.type('text/plain').send('ok'));

app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`vibe-coders-guides listening on :${PORT}`);
});
