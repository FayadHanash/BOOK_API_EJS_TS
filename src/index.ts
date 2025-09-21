import { fileURLToPath } from "url";

import { Config } from "./config/config.js";
//import {dirname} from "path";
import Application from "./server.js";
import { App as AppInstance } from "./server.js";
import { logger } from "./utils/logger.js";

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);

const App: Application = AppInstance ?? Application.getInstance();

async function run() {
  try {
    await App.start(Config.port);
    logger.info("Application started");
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

async function shutdown(sig: string): Promise<void> {
  logger.info(`${sig} received. Shutting down gracefully...`);
  try {
    await App.stop();
    logger.info("Shutdown complete");
    process.exit(0);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("Error during shutdown", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
process.on("unhandledRejection", (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error("unhandledRejection", error);
  void shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  logger.error("uncaughtException", error);
  void shutdown("uncaughtException");
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void run();
}

export { run };
