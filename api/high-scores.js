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
      const { difficulty } = req.query; // 쿼리 파라미터에서 difficulty를 가져옵니다.
      let query;
      let values = [];

      if (difficulty) {
        // 특정 난이도의 최고 기록 (가장 낮은 점수) 하나만 조회
        query = 'SELECT name, difficulty, score, image_data, created_at FROM high_scores WHERE difficulty = $1 ORDER BY score ASC LIMIT 1';
        values = [difficulty];
      } else {
        // 모든 난이도별 최고 기록 (기존 로직 유지)
        query = `
          SELECT DISTINCT ON (difficulty) id, name, difficulty, score, image_data, created_at
          FROM high_scores
          ORDER BY difficulty, score ASC;
        `;
      }
      
      const { rows } = await pool.query(query, values);

      // score 값을 항상 밀리초 단위로 통일하여 반환 (이제 DB에 모두 밀리초이므로 변환 로직 제거)
      // const processedRows = rows.map(row => {
      //   let processedScore = row.score;
      //   if (processedScore < 1000 && processedScore > 0) {
      //     processedScore = processedScore * 1000;
      //   }
      //   return { ...row, score: processedScore };
      // });

      return res.status(200).json(rows);
    } catch (err) {
      console.error('데이터베이스 조회 오류:', err);
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

        // 신기록 여부 판단 없이 바로 저장
        const insertQuery = 'INSERT INTO high_scores (name, difficulty, score, image_data) VALUES ($1, $2, $3, $4) RETURNING *';
        const insertValues = [name, difficulty, score, imageData];
        await pool.query(insertQuery, insertValues);
        
        return res.status(201).json({ message: 'High score saved successfully.' });
      });
    } catch (err) {
      console.error('데이터베이스 삽입 오류:', err);
      res.status(500).json({ error: 'Database error while saving high score' });
    }
  } else {
    res.status(405).end();
  }
};