import express from "express";
import products from "./resolvers/products";

/** Express router instance */
const router = express.Router();

router.use("/products", products);

export default router;
