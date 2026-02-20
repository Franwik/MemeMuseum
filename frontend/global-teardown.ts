// global-teardown.ts
import { db } from './db';

export default async function teardown() {
  await db.user.deleteMany({
    where: { email: { contains: '+test' } } // es. filtra per email di test
  });
}