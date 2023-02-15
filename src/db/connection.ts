import { Pool, PoolClient } from "pg"
import config from "../config"
import { logger } from "../utils/logger"

const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.name,
  password: config.database.password,
  port: config.database.port
})

let client: PoolClient

const init = async () => {
  client = await pool.connect()
  try {
    // Run a simple query to determine connectivity.
    // Running this query forces a round trip through the database.
    await client.query('SELECT true')
  } catch (err: any) {
    logger.error({ message: `connecting to database: ${err.stack}` })
  } finally {
    client.release()
  }
}

export { init, client }