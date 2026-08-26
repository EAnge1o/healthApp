import pool from '../config/database';

export async function createArticle(userId: number, title: string, content: string) {
  const [res] = await pool.execute(
    'INSERT INTO articles (user_id, title, content) VALUES (?, ?, ?)',
    [userId, title, content]
  );
  return { id: (res as any).insertId, title, content };
}

export async function getArticles(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.execute(
    `SELECT a.id, a.title, a.content, a.created_at, u.nickname as author
     FROM articles a JOIN users u ON a.user_id = u.id
     ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [pageSize.toString(), offset.toString()]
  );
  const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM articles');
  return {
    list: rows,
    total: (countRows as any[])[0].total,
    page,
    pageSize,
  };
}

export async function getArticleDetail(articleId: number) {
  const [rows] = await pool.execute(
    `SELECT a.*, u.nickname as author FROM articles a
     JOIN users u ON a.user_id = u.id WHERE a.id = ?`,
    [articleId]
  );
  return (rows as any[])[0] || null;
}

export async function deleteArticle(articleId: number, userId: number) {
  const [res] = await pool.execute('DELETE FROM articles WHERE id = ? AND user_id = ?', [articleId, userId]);
  return (res as any).affectedRows > 0;
}
