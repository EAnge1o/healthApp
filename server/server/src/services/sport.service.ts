import pool from '../config/database';
import { SportRecord, GpsPoint } from '../types';

export async function saveSportDirect(userId: number, mode: string, duration: number, distance: number) {
  const [result] = await pool.execute(
    'INSERT INTO sport_records (user_id, start_time, end_time, duration, distance, mode) VALUES (?, NOW(), DATE_ADD(NOW(), INTERVAL ? SECOND), ?, ?, ?)',
    [userId, duration, duration, distance, mode || '跑步']
  );
  return { id: (result as any).insertId };
}

export async function startSport(userId: number) {
  const [result] = await pool.execute(
    'INSERT INTO sport_records (user_id, start_time) VALUES (?, NOW())',
    [userId]
  );
  return { recordId: (result as any).insertId };
}

export async function addGpsPoint(recordId: number, latitude: number, longitude: number) {
  await pool.execute(
    'INSERT INTO gps_points (record_id, latitude, longitude, timestamp) VALUES (?, ?, ?, NOW())',
    [recordId, latitude, longitude]
  );
}

export async function endSport(recordId: number, duration: number, distance: number) {
  await pool.execute(
    'UPDATE sport_records SET end_time = NOW(), duration = ?, distance = ? WHERE id = ?',
    [duration, distance, recordId]
  );
}

export async function getSportRecords(userId: number, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const [records] = await pool.execute(
    `SELECT id, user_id, start_time, end_time, duration, distance, mode, created_at
     FROM sport_records WHERE user_id = ?
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId.toString(), pageSize.toString(), offset.toString()]
  );
  const [countRows] = await pool.execute(
    'SELECT COUNT(*) as total FROM sport_records WHERE user_id = ?',
    [userId]
  );

  return {
    list: records as SportRecord[],
    total: (countRows as any[])[0].total,
    page,
    pageSize,
  };
}

export async function getSportDetail(recordId: number) {
  const [records] = await pool.execute('SELECT * FROM sport_records WHERE id = ?', [recordId]);
  const [points] = await pool.execute(
    'SELECT * FROM gps_points WHERE record_id = ? ORDER BY timestamp ASC',
    [recordId]
  );
  return {
    record: (records as any[])[0] || null,
    gpsPoints: points as GpsPoint[],
  };
}

export async function updateSportRecord(id: number, userId: number, mode: string, duration: number, distance: number) {
  await pool.execute(
    'UPDATE sport_records SET mode = ?, duration = ?, distance = ? WHERE id = ? AND user_id = ?',
    [mode, duration, distance, id, userId]
  );
}

export async function deleteSportRecord(id: number, userId: number) {
  const [res] = await pool.execute('DELETE FROM sport_records WHERE id = ? AND user_id = ?', [id, userId]);
  return (res as any).affectedRows > 0;
}

export async function getSportStats(userId: number) {
  const [rows] = await pool.execute(
    `SELECT
       COUNT(*) as total_times,
       COALESCE(SUM(duration), 0) as total_duration,
       COALESCE(SUM(distance), 0) as total_distance,
       COUNT(DISTINCT DATE(start_time)) as total_days
     FROM sport_records WHERE user_id = ?`,
    [userId]
  );
  return (rows as any[])[0];
}
