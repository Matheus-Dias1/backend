import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const encryptPassword = async (password: string) =>
  new Promise<string>((resolve, reject) => {
    bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
      if (err) reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
  });

export const checkPassword = async (password: string, hash: string) =>
  new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(password, hash, function (error, isMatch) {
      if (error) reject(error);
      else resolve(isMatch);
    });
  });
