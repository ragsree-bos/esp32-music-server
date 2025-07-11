const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-wrap');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
app.use(cors());

app.get('/music', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).send("Missing song name.");

  const file = '/tmp/music.wav';
  const output = '/tmp/audio.mp3';

  // Clean any previous file
  if (fs.existsSync(file)) fs.unlinkSync(file);
  if (fs.existsSync(output)) fs.unlinkSync(output);

  const search = `ytsearch1:${query}`;
  const ytdlpWrap = new ytdlp();
  try {
    await ytdlpWrap.exec([
      search,
      "-f", "bestaudio",
      "-o", output
    ]);

    exec(`ffmpeg -y -i ${output} -ar 22050 -ac 1 ${file}`, (err) => {
      if (err) return res.status(500).send("FFmpeg failed.");
      res.set({ 'Content-Type': 'audio/wav' });
      const stream = fs.createReadStream(file);
      stream.pipe(res);
    });
  } catch (e) {
    res.status(500).send("Failed to fetch song.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Music server on ${PORT}`));
