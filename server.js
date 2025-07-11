const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
app.use(cors());

app.get('/music', async (req, res) => {
  const q = req.query.query;
  if (!q) return res.status(400).send('No query provided');

  try {
    // Search YouTube for first video matching the query
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${q}`);
    const audio = ytdl.downloadFromInfo(info, { filter: 'audioonly', quality: 'highestaudio' });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive'
    });
    audio.pipe(res);
  } catch (err) {
    console.error('Music fetch error:', err);
    res.status(500).send('Music fetch error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Music server is running on port ${port}`));
