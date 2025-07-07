import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async function handler(req, res) {
    // GET 요청: 모든 스레드를 최신순으로 불러옵니다.
    if (req.method === 'GET') {
        try {
            // 'created_at' 컬럼을 기준으로 내림차순 정렬하여 최신 글이 먼저 오도록 합니다.
            const query = 'SELECT * FROM threads ORDER BY created_at DESC';
            const { rows } = await pool.query(query);
            return res.status(200).json(rows);
        } catch (error) {
            console.error('데이터베이스 조회 오류:', error);
            return res.status(500).json({ message: '데이터베이스에서 데이터를 불러오는데 실패했습니다.', error: error.message });
        }
    }

    // POST 요청: 새로운 스레드(신기록)를 생성합니다.
    if (req.method === 'POST') {
        const { text, imageData } = req.body;

        if (!text || !imageData) {
            return res.status(400).json({ message: '요청 본문에 text 또는 imageData가 없습니다.' });
        }

        try {
            const query = 'INSERT INTO threads (content, image_data) VALUES ($1, $2) RETURNING *';
            const values = [text, imageData];
            const result = await pool.query(query, values);

            console.log('threads 테이블에 새로운 레코드가 삽입되었습니다:', result.rows[0]);
            return res.status(201).json({ message: '레코드가 성공적으로 생성되었습니다.', data: result.rows[0] });

        } catch (error) {
            console.error('데이터베이스 삽입 오류:', error);
            return res.status(500).json({ message: '데이터베이스에 레코드를 삽입하는데 실패했습니다.', error: error.message });
        }
    }

    // 그 외 다른 HTTP 메소드는 허용하지 않습니다.
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `메소드 ${req.method}는 허용되지 않습니다.` });
}
