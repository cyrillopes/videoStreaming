require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
let port = process.env.PORT || 3000;
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const mongoUrl =
  "mongodb+srv://cyrillo:admin@cluster0.v3nzy.mongodb.net/?retryWrites=true&w=majority";
let db;
const path = require("path");
const VIDEO_DIR = path.join(__dirname, "videos");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("hello");
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

app.get("/streamMovie/:id", (req, res) => {
  const CHUNK_SIZE = 10 ** 6;
  const range = req.headers.range;
  console.log(range);
  if (!range) {
    res.status(400).send("Requires Range Header");
  }
  let id = Number(req.params.id);
  const movies = db.collection("movies").find({ id: id });
  // .toArray((err, result) => {
  //   if (err) throw err;
  //   res.sendFile(path.join(__dirname, "/index.html"));
  // });
  const videoPath = path.join(VIDEO_DIR, movies.path);
  const videoSize = fs.statSync(videoPath).size;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": `bytes`,
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
  //////////////////////////
});

mongoClient.connect(mongoUrl, (err, client) => {
  if (err) console.log("Error while connecting");
  db = client.db("moviesApi");
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
