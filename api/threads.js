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
            // created_at이 TEXT 타입이므로, ISO 8601 형식(YYYY-MM-DDTHH:MM:SS)으로 저장되어야
            // 문자열 정렬이 시간순 정렬과 동일하게 동작합니다.
            const query = 'SELECT * FROM threads ORDER BY created_at DESC';
            const { rows } = await pool.query(query);
            return res.status(200).json(rows);
        } catch (error) {
            console.error('데이터베이스 조회 오류:', error);
            return res.status(500).json({ message: '데이터베이스에서 스레드를 불러오는데 실패했습니다.', error: error.message });
        }
    }

    // POST 요청: 새로운 스레드를 생성합니다.
    if (req.method === 'POST') {
        const { name, title, content, image } = req.body;

        if (!name || !title || !content) {
            return res.status(400).json({ message: '요청 본문에 name, title, 또는 content가 없습니다.' });
        }

        // created_at 값을 서버에서 생성합니다. ISO 8601 형식으로 저장합니다.
        const createdAt = new Date().toISOString();

        try {
            // 테이블 스키마에 맞는 INSERT 쿼리
            const query = 'INSERT INTO threads (name, title, content, image, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *';
            // image는 선택사항일 수 있으므로, 없으면 null로 처리합니다.
            const values = [name, title, content, image || null, createdAt];
            const result = await pool.query(query, values);

            console.log('threads 테이블에 새로운 스레드가 삽입되었습니다:', result.rows[0]);
            return res.status(201).json({ message: '스레드가 성공적으로 생성되었습니다.', data: result.rows[0] });

        } catch (error) {
            console.error('데이터베이스 삽입 오류:', error);
            return res.status(500).json({ message: '데이터베이스에 스레드를 저장하는데 실패했습니다.', error: error.message });
        }
    }

    // 그 외 다른 HTTP 메소드는 허용하지 않습니다.
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `메소드 ${req.method}는 허용되지 않습니다.` });
}