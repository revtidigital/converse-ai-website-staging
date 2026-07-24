import { loadConfig } from "./config/env.js";
import { buildServer } from "./server.js";

const config = loadConfig();
const server = buildServer(config);

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(config.port, "0.0.0.0");
