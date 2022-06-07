import express = require("express");
import { Product } from "../models/product";

const router = express.Router();

// list products
router.get("/", async (req: express.Request, res: express.Response) => {
  console.log(await Product.find({}));
  res.send("Hello Worlddxd!");
});

export default router;
