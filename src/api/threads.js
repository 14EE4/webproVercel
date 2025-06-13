import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 쓰레드 목록 조회
    const result = await sql`SELECT * FROM threads ORDER BY id DESC`;
    res.status(200).json(result.rows);
  } else if (req.method === 'POST') {
    // 쓰레드 추가
    const { name, title, content, image } = req.body;
    const created_at = new Date().toLocaleString('ko-KR', { hour12: false });
    await sql`
      INSERT INTO threads (name, title, content, image, created_at)
      VALUES (${name || 'Anonymous'}, ${title || ''}, ${content}, ${image || null}, ${created_at})
    `;
    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}