const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

const app = express();
app.use(cors());

app.get("/music", async (req, res) => {
  try {
    const query = req.query.query || "believer";
    const result = await ytSearch(query);
    const video = result.videos.length > 0 ? result.videos[0] : null;

    if (!video) return res.status(404).send("No video found");

    const url = video.url;
    const info = await ytdl.getInfo(url);

    const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });

    res.set({
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked",
    });

    ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    }).pipe(res);
  } catch (err) {
    console.error("Music Fetch Error:", err);
    res.status(500).send("Music fetch error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🎵 Music Server running on port ${port}`));
