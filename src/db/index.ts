import { Pool, PoolClient } from "pg"
import Knex from "knex"
import config from "../config"
import { logger } from "../utils/logger"

const dbConfig = {
  client: "pg",
  connection: {
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "migrations",
    extension: "ts",
  },
}

export default Knex(dbConfig)