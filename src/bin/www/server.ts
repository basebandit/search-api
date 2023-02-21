
import Debug from "debug";
import http from "http";
import express from "express"
import db from "../../db"
import { Config } from "../../config";
import moment from "moment";
import stoppable from "stoppable";
import { HTTP500Error } from "../../errors/httpErrors";

const debug = Debug("server");

class ApiServer {
  rootApp: any;
  httpServer: any;
  cleanupTasks: any[];
  debug: debug.Debugger
  port: string;
  host: string;
  url: string;
  shutdownTimeout: number;
  env: any;

  constructor(config: Config) {
    this.rootApp = null;
    this.httpServer = express.application;

    // Tasks that should be run before the server exits.
    this.cleanupTasks = [];

    this.host = "localhost"
    this.port = config.server.port;
    this.shutdownTimeout = config.server.shutDownTimeout
    this.url = `http://${this.host}:${this.port}/v1/api`;

    this.debug = debug
  }

  start(app: express.Application): Promise<ApiServer> {
    this.debug("Starting...");
    this.rootApp = app;

    return new Promise((resolve, reject) => {
      this.httpServer = this.rootApp.listen(this.port, this.host);
      this.httpServer.on("error", (error: any) => {
        console.log(typeof error)
        let serverError: Error;
        if (error.code === "EADDRINUSE") {
          serverError = new HTTP500Error(`(EADDRINUSE): port ${this.port} is already in use by another process.`)
        } else {
          serverError = new HTTP500Error(`There was an error starting the server: ${error.message}`)
        }
        this.debug("Server started (error)");
        return reject(serverError);
      });

      this.httpServer.on("listening", () => {
        this.debug("...Started");
        if (this.env === 'production') {
          console.info(`api server is now available on ${this.url}`);
        } else {
          console.info(`Listening on: ${this.host}:${this.port}`);
          console.info(`Url configured as: ${this.url}`);
        }
        console.info('Hit Ctrl+C to shut down');
        this.debug("Server ready (success)");
        return resolve(this);
      });

      stoppable(this.httpServer, this.shutdownTimeout);

      // ensure that the server exits correctly on Ctrl+C and SIGTERM
      process.removeAllListeners("SIGINT").on("SIGINT", this.shutdown.bind(this)).removeAllListeners("SIGTERM").on("SIGTERM", this.shutdown.bind(this));
    });
  }


  async shutdown(code: number = 0) {
    console.warn('Server is shutting down...');
    try {
      await this.stop()
      setTimeout(() => {
        process.exit(code);
      }, 100);
    } catch (error: unknown) {
      console.error(error)
      setTimeout(() => {
        process.exit(1);
      }, 100);
    }

  }

  async stop() {
    try {
      // if we never fully started there is nothing to stop
      if (this.httpServer && this.httpServer.listening) {
        // we stop the server first so that no new long running requests or processes can be started.
        await this.stopServer();
      }
    } finally {
      // wrap up
      this.httpServer = null;
      console.warn('Server has shut down')
      let uptime = moment.duration(process.uptime(), "seconds").humanize();
      //Always output uptime
      console.warn(`Server was up and running for ${uptime}`);
    }
  }


  private stopServer() {
    return new Promise((resolve, reject) => {
      this.httpServer.stop((error: any, status: any) => {
        if (error) {
          return reject(error);
        }
        return resolve(status);
      })
    })
  }
}

/** Logic to bootstrap our server */
async function bootServer(app: express.Application, config: Config): Promise<ApiServer> {
  debug("Begin: start server");

  const startTime = Date.now();
  const appServer = new ApiServer(config)
  try {
    debug("Begin: connect database");
    // Run a simple query to determine connectivity.
    // Running this query forces a round trip through the database.
    await db.raw('SELECT true');
    console.info(`Database connected in ${(Date.now() - startTime) / 1000}s`);
    debug("Database ready (success)");
    debug("End: connect database");

    await appServer.start(app)
    console.log(`Server started in ${(Date.now() - startTime) / 1000}s`);
    debug("End: start server")
    return appServer;
  } catch (error: any) {
    console.error(error)
    if (appServer) {
      appServer.shutdown(2);
    } else {
      setTimeout(() => {
        process.exit(2)
      }, 100);
    }
    throw (error);
  }
}

export default bootServer