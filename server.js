const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');

const app = express();
app.use(cors());

app.get('/music', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).send("No query provided");

  const searchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  // Use yt-dlp via command line to get the URL
  exec(`yt-dlp -f bestaudio -g "${searchURL}"`, (err, stdout, stderr) => {
    if (err || !stdout) {
      console.error("yt-dlp error:", stderr);
      return res.status(500).send("Music fetch error");
    }

    const streamURL = stdout.trim();
    try {
      const stream = ytdl(streamURL, { filter: 'audioonly' });

      res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive'
      });

      // Use ffmpeg to convert if needed (MP3)
      ffmpeg(stream)
        .format('mp3')
        .audioBitrate(128)
        .on('error', err => {
          console.error("FFmpeg error:", err.message);
          res.end();
        })
        .pipe(res, { end: true });

    } catch (e) {
      console.error("Playback error:", e);
      res.status(500).send("Playback failed");
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🎵 Music server running on port ${PORT}`));
