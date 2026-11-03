import express from 'express';
import server from './server/index.mjs';

// The Express preset detects the root entrypoint from this direct Express import.
const app = express();
app.use(server);

export default app;
