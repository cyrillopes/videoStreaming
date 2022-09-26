const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
let port = process.env.PORT || 3000;
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const mongoUrl =
  "mongodb+srv://cyrillo:admin@cluster0.v3nzy.mongodb.net/?retryWrites=true&w=majority";
let db;

app.use(cors());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/movies", (req, res) => {
  db.collection("movies")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.get("/movie/:id", (req, res) => {
  let id = Number(req.params.id);
  db.collection("movies")
    .find({ id: id })
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.get("/video", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "bigbuck.mp4";
  const videoSize = fs.statSync("bigbuck.mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

mongoClient.connect(mongoUrl, (err, client) => {
  if (err) console.log("Error while connecting");
  db = client.db("moviesApi");
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
