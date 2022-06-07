import express = require("express");
import { Product } from "../models/product";

const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {});

export default router;
