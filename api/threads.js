/**
 * 이 모듈은 쓰레드 목록을 가져오거나 새로운 쓰레드를 생성하는 API 엔드포인트입니다.
 * GET 요청 시 데이터베이스에서 쓰레드 목록을 가져오고,
 * POST 요청 시 새로운 쓰레드를 생성합니다.
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,//환경변수로 데이터베이스 URL을 설정
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  //req: HTTP 요청 객체
  //res: HTTP 응답 객체
  if (req.method === 'GET') {//GET 요청 처리
    /**
     * 데이터베이스에서 쓰레드 목록을 가져와서 클라이언트에 반환합니다.
     * 데이터베이스 연결은 환경변수로 설정된 DATABASE_URL을 사용합니다.
     */
    try {
      const { rows } = await pool.query('SELECT * FROM threads ORDER BY id DESC');
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'POST') {//POST 요청 처리
    /**
     * 클라이언트로부터 받은 쓰레드 데이터를 데이터베이스에 저장합니다.
     * 요청 본문에서 name, title, content, image를 추출하고,
     * 현재 시간을 created_at으로 설정하여 데이터베이스에 삽입합니다.
     */
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