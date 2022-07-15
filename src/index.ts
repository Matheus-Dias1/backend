require("dotenv").config();
const express = require("express");
import mongoose from "mongoose";
import router from "./routes";
import cors from "cors";

const app = express();
const port = 3000;

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.tjb515h.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(uri);

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Listening on port ${port}`);
});
