import { app } from "./app";

// The app itself lives in app.ts (so tests can import it without starting a
// server). This file's only job is to start listening on a real port.
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
