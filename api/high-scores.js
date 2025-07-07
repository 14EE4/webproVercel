const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const query = `
        SELECT DISTINCT ON (difficulty) id, name, difficulty, score, image_data, created_at
        FROM high_scores
        ORDER BY difficulty, score ASC;
      `;
      const { rows } = await pool.query(query);
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: 'Database error while fetching high scores' });
    }
  }
  else if (req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        const { name, difficulty, score, imageData } = JSON.parse(body);

        if (!name || !difficulty || score === undefined || !imageData) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const bestScoreQuery = 'SELECT MIN(score) as best_score FROM high_scores WHERE difficulty = $1';
        const { rows } = await pool.query(bestScoreQuery, [difficulty]);
        const bestScore = rows[0].best_score;

        if (bestScore === null || score < bestScore) {
          const insertQuery = 'INSERT INTO high_scores (name, difficulty, score, image_data) VALUES ($1, $2, $3, $4) RETURNING *';
          const insertValues = [name, difficulty, score, imageData];
          await pool.query(insertQuery, insertValues);
          
          return res.status(201).json({ isNewHighScore: true, message: 'New high score saved!' });
        } else {
          return res.status(200).json({ isNewHighScore: false, message: 'Not a new high score.' });
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Database error while saving high score' });
    }
  } else {
    res.status(405).end();
  }
};