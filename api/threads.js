const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,//환경변수로 데이터베이스 URL을 설정
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM threads ORDER BY id DESC');
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        const data = JSON.parse(body);
        const { name, title, content, image } = data;
        const created_at = new Date().toISOString();
        await pool.query(
          'INSERT INTO threads (name, title, content, image, created_at) VALUES ($1, $2, $3, $4, $5)',
          [name, title, content, image, created_at]
        );
        res.status(201).json({ ok: true });
      });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).end();
  }
};