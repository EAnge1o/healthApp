# 健康管理 App（HealthApp）

一款基于 **uni-app** 的跨端个人健康管理应用，覆盖 **H5 / 微信小程序 / Android App** 三端，
后端采用 **Node.js + Express + TypeScript + MySQL**，并集成 **百度 AI（菜品 / 条形码识别）** 与
**豆包大模型（AI 健康分析）**。

## ✨ 功能特性

- **用户系统**：注册 / 登录（JWT 鉴权）、个人资料编辑、头像上传
- **运动记录**：运动模式计时、GPS 轨迹记录（Leaflet 地图展示）、时长 / 距离 / 卡路里统计
- **饮食记卡**：拍照识别菜品、扫码识别条形码（百度 AI），自动估算热量，支持手动修正
- **AI 健康分析**：基于运动与饮食记录，由豆包大模型生成个性化健康建议，历史分析可管理
- **健康数据**：身高、体重、BMI 变化趋势（ECharts 可视化）
- **目标管理**：自定义健康目标、每日打卡、完成状态跟踪
- **健康资讯**：健康科普文章浏览，登录后可发布 / 删除
- **UI 主题**：暖调陶土色（terracotta `#C75B39`）视觉体系

## 🛠 技术栈

| 端 | 技术 |
| --- | --- |
| 前端 | uni-app（Vue 3 + TypeScript + Pinia）、TDesign Mobile、ECharts、Leaflet |
| 后端 | Node.js + Express + TypeScript、mysql2、JWT、bcryptjs、Multer |
| 数据库 | MySQL（utf8mb4） |
| AI 能力 | 百度 AI 开放平台（菜品识别 / 条形码）、豆包 Doubao 大模型 |

## 📁 目录结构

```
healthApp
├── api/                  # 前端接口封装（基于 uni.request）
├── pages/                # 页面：首页、登录注册、运动、记卡、AI 分析、健康数据、资讯等
├── store/                # Pinia 状态管理
├── static/               # 静态资源
├── database/             # 数据库初始化脚本（schema + 演示数据）
└── server/
    └── server/           # 后端服务
        ├── src/
        │   ├── controllers/   # 业务控制器
        │   ├── routes/        # REST 路由
        │   ├── middleware/    # JWT 鉴权中间件
        │   ├── config/        # 配置加载
        │   └── models/        # 数据库初始化
        ├── .env.example       # 环境变量模板
        └── package.json
```

## 🚀 快速开始

### 1. 初始化数据库（MySQL）

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/health_app_data.sql
```

### 2. 启动后端

```bash
cd server/server
npm install
cp .env.example .env   # 填写数据库账号、百度 AI / 豆包密钥
npm run dev            # 开发模式，默认 http://localhost:3000
```

验证服务：访问 `http://localhost:3000/api/health` 应返回 `{ code: 200, message: 'ok' }`。

### 3. 运行前端

**方式一：HBuilderX**
用 HBuilderX 打开项目根目录，运行到浏览器（H5）或微信开发者工具（小程序）。

**方式二：命令行（H5）**

```bash
npm install
npm run dev:h5
```

> 前端默认请求 `http://localhost:3000/api`，可在 App 内「设置服务器地址」处修改。

### 4. 演示数据

`database/health_app_data.sql` 内置了演示账号 `admin`（密码为 bcrypt 加密存储），
以及运动、记卡、健康数据等示例记录；也可直接注册新账号体验完整流程。

## 🔐 环境变量

后端通过 `.env` 读取配置（模板见 `server/server/.env.example`，真实 `.env` 已被
`.gitignore` 排除，不会提交到仓库）：

| 变量 | 说明 |
| --- | --- |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL 连接配置 |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | JWT 签名密钥与有效期 |
| `PORT` | 后端服务端口（默认 3000） |
| `BAIDU_API_KEY` / `BAIDU_SECRET_KEY` | 百度 AI 开放平台密钥 |
| `BAIDU_DISH_API_URL` / `BAIDU_BARCODE_API_URL` | 菜品识别 / 条形码识别接口 |
| `DOUBAO_API_KEY` / `DOUBAO_API_URL` / `DOUBAO_MODEL` | 豆包大模型配置 |

## 📡 API 概览

所有接口前缀为 `/api`，除注册登录外均需携带 `Authorization: Bearer <token>`。

| 模块 | 接口 |
| --- | --- |
| 认证 | `POST /auth/register`、`POST /auth/login`、`GET/PUT /auth/profile`、`POST /auth/avatar` |
| 运动 | `POST /sport/start`、`POST /sport/save`、`POST /sport/gps`、`POST /sport/end`、`GET /sport/records`、`GET /sport/stats` |
| 记卡 | `POST /card/photo`、`POST /card/barcode`、`GET /card/records` |
| AI 分析 | `POST /ai/analyze`、`GET /ai/history` |
| 健康数据 | `GET /metric/latest`、`GET /metric/:type`、`POST /metric` |
| 目标 | `GET/POST /goal`、`POST /goal/:id/checkin` |
| 资讯 | `GET /article`、`GET /article/:id`、`POST/DELETE /article` |

## 📄 相关文档

- `软著书_健康管理移动应用V1.0.md`：软件著作权申请文档
- `20. 沈泽贤+吴桐+魏青松.pdf`：项目结课论文

## 📃 许可证

本项目为课程设计作品，仅供学习交流使用。
