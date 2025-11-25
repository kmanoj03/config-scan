import { config } from 'dotenv';
import { resolve } from 'path';
import { runCli } from './routes/cliRoutes';

// Load .env from server directory (one level up from dist/)
config({ path: resolve(__dirname, '..', '.env') });

runCli();

//Check for failing github actions.