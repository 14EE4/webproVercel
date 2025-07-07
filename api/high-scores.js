const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
        rejectUnauthorized: false
  },
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

        // 1. 현재 난이도의 최고 기록(가장 낮은 점수)을 조회합니다.
        const bestScoreQuery = 'SELECT MIN(score) as best_score FROM high_scores WHERE difficulty = $1';
        const { rows } = await pool.query(bestScoreQuery, [difficulty]);
        const bestScore = rows[0].best_score; // REAL 타입으로 반환될 것으로 예상

        console.log(`[DEBUG] Difficulty: ${difficulty}`);
        console.log(`[DEBUG] New Score: ${score} (Type: ${typeof score})`);
        console.log(`[DEBUG] Best Score from DB: ${bestScore} (Type: ${typeof bestScore})`);
        console.log(`[DEBUG] Comparison (score < bestScore): ${score < bestScore}`);
        console.log(`[DEBUG] Comparison (bestScore === null): ${bestScore === null}`);

        // 2. 새로운 점수가 더 좋거나, 기존 기록이 없을 경우에만 신기록으로 처리합니다.
        if (bestScore === null || score < bestScore) {
          // 3. high_scores 테이블에 새로운 기록을 저장합니다.
          const insertQuery = 'INSERT INTO high_scores (name, difficulty, score, image_data) VALUES ($1, $2, $3, $4) RETURNING *';
          const insertValues = [name, difficulty, score, imageData];
          await pool.query(insertQuery, insertValues);
          
          // 4. 프론트엔드에 신기록임을 알립니다.
          return res.status(201).json({ isNewHighScore: true, message: 'New high score saved!' });
        } else {
          // 신기록이 아닐 경우, 아무것도 저장하지 않고 응답합니다.
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
