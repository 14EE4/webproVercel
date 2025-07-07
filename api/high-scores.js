import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async function handler(req, res) {
    // GET 요청: 난이도별 최고 기록을 불러옵니다.
    if (req.method === 'GET') {
        try {
            // 각 난이도(difficulty)별로 가장 낮은 점수(score)를 가진 레코드를 1개씩 조회합니다.
            const query = `
                SELECT DISTINCT ON (difficulty) id, difficulty, score, image_data, created_at
                FROM high_scores
                ORDER BY difficulty, score ASC;
            `;
            const { rows } = await pool.query(query);
            return res.status(200).json(rows);
        } catch (error) {
            console.error('데이터베이스 조회 오류:', error);
            return res.status(500).json({ message: '데이터베이스에서 최고 기록을 불러오는데 실패했습니다.', error: error.message });
        }
    }

    // POST 요청: 새로운 최고 기록을 저장합니다.
    if (req.method === 'POST') {
        const { difficulty, score, imageData } = req.body;

        if (!difficulty || score === undefined || !imageData) {
            return res.status(400).json({ message: '요청 본문에 difficulty, score, 또는 imageData가 없습니다.' });
        }

        try {
            const query = 'INSERT INTO high_scores (difficulty, score, image_data) VALUES ($1, $2, $3) RETURNING *';
            const values = [difficulty, score, imageData];
            const result = await pool.query(query, values);

            console.log('high_scores 테이블에 새로운 레코드가 삽입되었습니다:', result.rows[0]);
            return res.status(201).json({ message: '최고 기록이 성공적으로 저장되었습니다.', data: result.rows[0] });

        } catch (error) {
            console.error('데이터베이스 삽입 오류:', error);
            return res.status(500).json({ message: '데이터베이스에 최고 기록을 저장하는데 실패했습니다.', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `메소드 ${req.method}는 허용되지 않습니다.` });
}
