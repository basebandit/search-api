import nodeConfig from "config";

interface ServerConfig {
  // /** Whether responses should be cached or not */
  // cache: boolean;

  /** The port that the express server should bind to */
  port: string;

  /** The  environment in which the server will running on*/
  env: string

  /** The log level to indicate the severity level */
  logLevel: string

  /** The amount of milliseconds to count down before shutting down express server*/
  shutDownTimeout: number
}

interface DatabaseConfig {
  /** The database name for our application */
  name: string
  /** The database server host address */
  host: string
  /** The database custom username.( Avoid using the default admin user) */
  user: string
  /** The database user's password for authz against the database server */
  password: string
  /** The database server listening port */
  port: number

}

export type Config = {
  /** Api server specific config */
  server: ServerConfig
  database: DatabaseConfig
}

const config: Config = {
  server: {
    port: nodeConfig.get<string>('server.port'),
    env: nodeConfig.get<string>('server.env'),
    logLevel: nodeConfig.get<string>('server.loglevel'),
    shutDownTimeout: nodeConfig.get<number>('server.shutdown')
  },
  database: {
    host: nodeConfig.get<string>('database.host'),
    port: nodeConfig.get<number>('database.port'),
    name: nodeConfig.get<string>('database.name'),
    user: nodeConfig.get<string>('database.user'),
    password: nodeConfig.get<string>('database.password')
  }
}

export default config;