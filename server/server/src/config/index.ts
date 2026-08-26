import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default {
  port: Number(process.env.PORT) || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'health-app-default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  baidu: {
    apiKey: process.env.BAIDU_API_KEY || '',
    secretKey: process.env.BAIDU_SECRET_KEY || '',
    dishApiUrl: process.env.BAIDU_DISH_API_URL || '',
    barcodeApiUrl: process.env.BAIDU_BARCODE_API_URL || '',
  },
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY || '',
    apiUrl: process.env.DOUBAO_API_URL || '',
    model: process.env.DOUBAO_MODEL || 'doubao-1-5-lite-32k-250115',
  },
};
