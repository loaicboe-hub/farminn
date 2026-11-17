import { runMigrations } from '../src/db/migrate.mjs';
import { db } from '../src/db/index.mjs';

async function test() {
  console.log('Testing migrations...');
  await runMigrations();

  const farms = await db.query('SELECT COUNT(*) as count FROM farms');
  console.log('Farms count in DB:', farms.rows[0].count);

  const sampleFarm = await db.query('SELECT title_en, title_ar, price, area_feddan FROM farms LIMIT 1');
  console.log('Sample Farm in DB:', sampleFarm.rows[0]);

  const users = await db.query('SELECT id, full_name, email, account_type FROM users');
  console.log('Users in DB:', users.rows);

  const locs = await db.query('SELECT name_en, name_ar FROM taxonomy_locations');
  console.log('Locations count in DB:', locs.rows.length);

  const suppliers = await db.query('SELECT company_name_en, category_slug FROM suppliers');
  console.log('Suppliers in DB:', suppliers.rows);

  const hr = await db.query('SELECT full_name_en, title_en FROM human_resources');
  console.log('HR in DB:', hr.rows);

  console.log('Database test PASSED successfully!');
}

test().catch(err => {
  console.error('Database test FAILED:', err);
  process.exit(1);
});

