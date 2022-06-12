import express from "express";
import products from "./resolvers/products";
import orders from "./resolvers/orders";

/** Express router instance */
const router = express.Router();

router.use("/products", products);
router.use("/orders", orders);

export default router;
