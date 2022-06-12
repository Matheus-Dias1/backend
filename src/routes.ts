import express from "express";
import products from "./resolvers/products";
import orders from "./resolvers/orders";
import batches from "./resolvers/batches";

/** Express router instance */
const router = express.Router();

router.use("/products", products);
router.use("/orders", orders);
router.use("/batches", batches);

export default router;
