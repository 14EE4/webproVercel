const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // threads.js와 동일한 환경 변수 사용
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  // GET 요청: 난이도별 최고 기록을 불러옵니다.
  if (req.method === 'GET') {
    try {
      const query = `
        SELECT DISTINCT ON (difficulty) id, difficulty, score, image_data, created_at
        FROM high_scores
        ORDER BY difficulty, score ASC;
      `;
      const { rows } = await pool.query(query);
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: 'Database error while fetching high scores' });
    }
  }
  // POST 요청: 새로운 최고 기록을 저장합니다.
  else if (req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        const data = JSON.parse(body);
        const { difficulty, score, imageData } = data;

        if (!difficulty || score === undefined || !imageData) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const query = 'INSERT INTO high_scores (difficulty, score, image_data) VALUES ($1, $2, $3) RETURNING *';
        const values = [difficulty, score, imageData];
        await pool.query(query, values);
        
        res.status(201).json({ ok: true });
      });
    } catch (err) {
      res.status(500).json({ error: 'Database error while saving high score' });
    }
  } else {
    res.status(405).end();
  }
};