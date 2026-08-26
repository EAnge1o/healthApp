import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import config from '../config';
import { User } from '../types';

export async function register(username: string, password: string, nickname: string) {
  const [rows] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
  if ((rows as any[]).length > 0) {
    throw new Error('用户名已存在');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (username, password_hash, nickname) VALUES (?, ?, ?)',
    [username, passwordHash, nickname || username]
  );
  const userId = (result as any).insertId;
  const token = jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as any);

  return {
    token,
    user: { id: userId, username, nickname: nickname || username, avatar: '' },
  };
}

export async function login(username: string, password: string) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
  const users = rows as User[];
  if (users.length === 0) {
    throw new Error('用户名或密码错误');
  }

  const user = users[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('用户名或密码错误');
  }

  const token = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as any);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
    },
  };
}

export async function getProfile(userId: number) {
  const [rows] = await pool.execute(
    'SELECT id, username, nickname, avatar, created_at FROM users WHERE id = ?',
    [userId]
  );
  return (rows as any[])[0] || null;
}

export async function updateProfile(userId: number, nickname: string, avatar: string) {
  await pool.execute('UPDATE users SET nickname = ?, avatar = ? WHERE id = ?', [nickname, avatar, userId]);
  return getProfile(userId);
}
