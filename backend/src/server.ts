import 'dotenv/config';

import app from './app.js';
import { prisma } from './config/prisma-config.js';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Startup failed');
    console.error(error);
  }
}

main();
