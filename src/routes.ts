import express from "express";
import products from "./resolvers/products";
import orders from "./resolvers/orders";
import batches from "./resolvers/batches";
import session from "./resolvers/session";
import users from "./resolvers/users";

/** Express router instance */
const router = express.Router();

router.use("/products", products);
router.use("/orders", orders);
router.use("/batches", batches);
router.use("/session", session);
router.use("/users", users);

export default router;
