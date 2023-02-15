import app from "./api/app"
import config from "./config"
import bootServer from "./bin/www/server"

// Ensure we handle all uncaught exceptions/rejections
process.on('uncaughtException', (e) => {
  console.error({
    message: `uncaughtException`,
    extra: e,
  });
  process.exit(1);
});

process.on('unhandledRejection', (e) => {
  console.error({
    message: `unhandledRejection`,
    extra: e,
  });
  process.exit(1);
});

/**Start our server*/
bootServer(app, config)