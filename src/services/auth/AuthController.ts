import config from "../../config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Debug from "debug"
import randtoken from "rand-token"
import { HTTP400Error, HTTP401Error } from "../../errors/httpErrors";
import { createUser, getByEmail, getByRefreshToken } from "./AuthModel";

const debug = Debug("auth")
const JWT_SECRET = config.server.jwt as string

export const registerUser = async (email: string, password: string) => {
  debug("Start...")
  if (!email || !password) {
    console.log("no email or password")
    throw new HTTP400Error();
  }

  let hashPassword = bcrypt.hashSync(password, 8);
  let refreshToken = randtoken.uid(256);

  try {
    debug("creating user...")
    let id = await createUser(email, hashPassword, refreshToken)

    const accessToken = jwt.sign({ sub: id }, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: 300,
    });
    return { accessToken, refreshToken };
  } catch (e: any) {
    console.log(e.message)
    throw new HTTP400Error()
  }
};

export const authenticate = async (email: string, password: string) => {
  debug("Starting...");
  if (!email || !password) {
    throw new HTTP400Error();
  }
  
  let user = await getByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.hash_password)) {
    throw new HTTP401Error();
  }

  const accessToken = jwt.sign({ sub: user.id }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: 300,
  });

  return { accessToken, refreshToken: user.refresh_token }
};

export const generateAccessToken = async (refreshToken: string) => {
  let user = await getByRefreshToken(refreshToken);

  if (!user) {
    throw new HTTP401Error();
  }

  const accessToken = jwt.sign({ sub: user.id }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: 300,
  })

  return accessToken;
}