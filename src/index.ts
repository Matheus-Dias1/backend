require("dotenv").config();
const express = require("express");
import mongoose from "mongoose";
import router from "./routes";

const app = express();
const port = 3001;

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.tjb515h.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(uri);

app.use(router);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
