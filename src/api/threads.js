const Router = require('koa-router');
const { Pool } = require('pg');

const router = new Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

router.get('/api/threads', async (ctx) => {
  try {
    const { rows } = await pool.query('SELECT * FROM threads ORDER BY id DESC');
    ctx.body = rows;
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: 'Database error' };
  }
});

router.post('/api/threads', async (ctx) => {
  try {
    const { name, title, content, image } = ctx.request.body;
    const created_at = new Date().toISOString();
    await pool.query(
      'INSERT INTO threads (name, title, content, image, created_at) VALUES ($1, $2, $3, $4, $5)',
      [name, title, content, image, created_at]
    );
    ctx.status = 201;
    ctx.body = { ok: true };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: 'Database error' };
  }
});

module.exports = router;