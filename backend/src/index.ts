import { createApp } from "./app";
import { config } from "./config";

// Entry point: build the app and start listening. This is the only file that
// binds a port, so importing the app elsewhere (e.g. in tests) has no side
// effects.
const app = createApp();
app.listen(config.port, () => {
  console.log(`API → http://localhost:${config.port}`);
});
