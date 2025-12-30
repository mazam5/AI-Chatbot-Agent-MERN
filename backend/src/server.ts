import 'dotenv/config';

import app from './app';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || 3000;
async function main() {
  try {
    await prisma.$connect();
    console.log('✔ Database connection successful');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed');
    console.error(error);
    process.exit(1);
  }
}

main();
