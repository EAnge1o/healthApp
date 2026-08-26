import pool from '../config/database';

export async function getMetrics(userId: number, type: 'height' | 'weight') {
  const [rows] = await pool.execute(
    'SELECT id, value, recorded_at FROM health_metrics WHERE user_id=? AND type=? ORDER BY recorded_at ASC',
    [userId, type]
  );
  return rows;
}

export async function addMetric(userId: number, type: 'height' | 'weight', value: number, date: string) {
  const [res] = await pool.execute(
    'INSERT INTO health_metrics (user_id, type, value, recorded_at) VALUES (?,?,?,?)',
    [userId, type, value, date]
  );
  return { id: (res as any).insertId };
}

export async function getLatest(userId: number) {
  const [h] = await pool.execute(
    'SELECT value FROM health_metrics WHERE user_id=? AND type="height" ORDER BY recorded_at DESC LIMIT 1',
    [userId]
  );
  const [w] = await pool.execute(
    'SELECT value FROM health_metrics WHERE user_id=? AND type="weight" ORDER BY recorded_at DESC LIMIT 1',
    [userId]
  );
  return {
    height: (h as any[])[0]?.value || null,
    weight: (w as any[])[0]?.value || null,
  };
}

export async function deleteMetric(id: number, userId: number) {
  await pool.execute('DELETE FROM health_metrics WHERE id=? AND user_id=?', [id, userId]);
}
