const showRouter = require("./routes/shows");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
let port = process.env.PORT || 3000;
const mongoUrl =
  "mongodb+srv://cyrillo:admin@cluster0.v3nzy.mongodb.net/?retryWrites=true&w=majority";

//initializing router and all request in showRouter will be called using /
app.use("/", showRouter);

function startServer() {
  app.listen(port, () => console.log("Listening on port" + port));
}
mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(startServer)
  .catch((e) => console.error(e));
