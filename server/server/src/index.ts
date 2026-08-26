import express from 'express';
import cors from 'cors';
import path from 'path';
import config from './config';
import { initDatabase } from './models/init';
import authRoutes from './routes/auth.routes';
import sportRoutes from './routes/sport.routes';
import cardRoutes from './routes/card.routes';
import aiRoutes from './routes/ai.routes';
import articleRoutes from './routes/article.routes';
import metricRoutes from './routes/metric.routes';
import goalRoutes from './routes/goal.routes';

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 请求日志
app.use((req, _res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/sport', sportRoutes);
app.use('/api/card', cardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/article', articleRoutes);
app.use('/api/metric', metricRoutes);
app.use('/api/goal', goalRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ code: 200, message: 'ok', timestamp: new Date().toISOString() });
});

// 启动
async function start() {
  try {
    await initDatabase();
    app.listen(config.port, () => {
      console.log(`✅ 健康管理App 后端启动成功: http://localhost:${config.port}`);
      console.log(`📋 API 健康检查: http://localhost:${config.port}/api/health`);
    });
  } catch (err) {
    console.error('❌ 启动失败:', err);
    process.exit(1);
  }
}

start();
