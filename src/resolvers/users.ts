import express from "express";
import { User } from "../models/user";
import { encryptPassword } from "../utils/passwords";

const router = express.Router();

/** Create new user */
router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const { username, name, password } = req.body;

    if (!username || !name || !password) return res.sendStatus(400);

    let hash = "";
    try {
      hash = await encryptPassword(password);
    } catch (err) {
      console.error(`Error trying to generate password hash: ${err}`);
      res.sendStatus(500);
    }

    const newUser = new User({
      username: username.trim().toLowerCase(),
      name,
      password: hash,
    });

    newUser.save((err, user) => {
      if (err) {
        const error: any = err;
        if (error.name === "MongoServerError" && error.code === 11000)
          res.status(422).send({ error: "USER_ALREADY_EXISTS" });
        else res.sendStatus(500);
      } else res.status(201).send({ id: user.id });
    });
  } catch (err) {
    console.log("UNEXPECTED ERROR:", err);
    res.sendStatus(422);
  }
});

export default router;
