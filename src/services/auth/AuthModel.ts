// import { QueryArrayResult } from "pg";
import db from "../../db"

export const createUser = async (email: string, passwordHash: string, refreshToken: string) => {

  const res = await db.client.query('INSERT INTO "users" (email,hash_password,refresh_token) VALUES($1,$2,$3) RETURNING id', [email, passwordHash, refreshToken]);

  return res.rows[0][0].id;
}

export const getByEmail = async (email: string) => {
  const res = await db.client.query('SELECT * FROM users WHERE email=$1', [email]);
  return res.rows[0];
}

export const getByRefreshToken = async (refreshToken: string) => {
  const res = await db.client.query('SELECT * FROM users WHERE refresh_token=$1', [refreshToken]);
  return res.rows[0];
}
