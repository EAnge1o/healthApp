import pool from '../config/database';

export async function getGoals(userId: number) {
  const [rows] = await pool.execute(
    'SELECT * FROM daily_goals WHERE user_id=? ORDER BY created_at ASC', [userId]
  );
  return rows;
}

export async function createGoal(userId: number, type: string, target: number) {
  const [res] = await pool.execute(
    'INSERT INTO daily_goals (user_id, type, target_value) VALUES (?,?,?)', [userId, type, target]
  );
  return { id: (res as any).insertId };
}

export async function deleteGoal(id: number, userId: number) {
  await pool.execute('DELETE FROM daily_goals WHERE id=? AND user_id=?', [id, userId]);
}

export async function getTodayCheckins(userId: number) {
  const today = new Date().toISOString().slice(0, 10);
  const [rows] = await pool.execute(
    `SELECT c.goal_id, c.achieved, g.type, g.target_value
     FROM daily_checkins c JOIN daily_goals g ON c.goal_id=g.id
     WHERE c.user_id=? AND c.checkin_date=?`, [userId, today]
  );
  return rows;
}

export async function checkin(userId: number, goalId: number) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    await pool.execute(
      'INSERT INTO daily_checkins (user_id, goal_id, checkin_date) VALUES (?,?,?)',
      [userId, goalId, today]
    );
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') {
      // 取消打卡
      await pool.execute(
        'DELETE FROM daily_checkins WHERE goal_id=? AND checkin_date=?',
        [goalId, today]
      );
      return { checked: false };
    }
    throw e;
  }
  return { checked: true };
}

export async function getStreak(userId: number) {
  const [rows] = await pool.execute(
    `SELECT goal_id, COUNT(*) as streak
     FROM (
       SELECT goal_id, checkin_date,
         DATE_SUB(checkin_date, INTERVAL ROW_NUMBER() OVER (PARTITION BY goal_id ORDER BY checkin_date DESC) DAY) as grp
       FROM daily_checkins WHERE user_id=?
     ) t WHERE grp = CURDATE()
     GROUP BY goal_id`, [userId]
  );
  const streaks: Record<string, number> = {};
  (rows as any[]).forEach((r: any) => { streaks[String(r.goal_id)] = r.streak; });
  return streaks;
}
