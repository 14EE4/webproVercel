import { Pool } from 'pg';

// Vercel 환경 변수에서 데이터베이스 연결 정보를 가져와 Pool을 초기화합니다.
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false // Neon DB 연결에 필요합니다.
    }
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { text, imageData } = req.body;

        // 기본적인 데이터 유효성 검사
        if (!text || !imageData) {
            return res.status(400).json({ message: '요청 본문에 text 또는 imageData가 없습니다.' });
        }

        try {
            // SQL Injection을 방지하기 위해 파라미터화된 쿼리를 사용합니다.
            // 테이블명: threads, 컬럼명: content, image_data 로 가정합니다.
            const query = 'INSERT INTO threads (content, image_data) VALUES ($1, $2) RETURNING *';
            const values = [text, imageData];

            const result = await pool.query(query, values);

            console.log('threads 테이블에 새로운 레코드가 삽입되었습니다:', result.rows[0]);

            res.status(200).json({ message: '레코드가 성공적으로 생성되었습니다.', data: result.rows[0] });

        } catch (error) {
            console.error('데이터베이스 삽입 오류:', error);
            res.status(500).json({ message: '데이터베이스에 레코드를 삽입하는데 실패했습니다.', error: error.message });
        }

    } else {
        // POST가 아닌 다른 메소드 처리
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `메소드 ${req.method}는 허용되지 않습니다.` });
    }
}