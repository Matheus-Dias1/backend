import jwt from "jsonwebtoken";
import express from "express";
import { User } from "../models/user";
import { checkPassword } from "../utils/passwords";

const router = express.Router();

/** Create new session */
router.post("/", async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username.trim().toLowerCase() });

  if (!user) return res.status(404).send({ error: "USER_DOESNT_EXIST" });
  if (!user.admin)
    return res.status(403).send({ error: "INSUFFICIENT_PERMISSIONS" });
  try {
    const match = await checkPassword(password, user.password);
    if (!match) return res.status(401).send({ error: "WRONG_PASSWORD" });
    const token = jwt.sign(
      {
        name: user.name,
        username: user.username,
        admin: user.admin,
      },
      process.env.TOKEN_SECRET as string,
      { expiresIn: "86400s" }
    );
    res.send({ token });
  } catch (err) {
    res.sendStatus(500);
  }
});

export default router;
