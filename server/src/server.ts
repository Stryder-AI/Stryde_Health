import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

async function main() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Stryde Health API running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

main().catch(console.error);
