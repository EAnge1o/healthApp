import axios from 'axios';
import config from '../config';

let cachedToken = '';
let tokenExpiresAt = 0;

/**
 * 获取百度 AI access_token，自动缓存复用。
 * token 有效期 30 天，提前 1 小时刷新。
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await axios.post(
    'https://aip.baidubce.com/oauth/2.0/token',
    null,
    {
      params: {
        grant_type: 'client_credentials',
        client_id: config.baidu.apiKey,
        client_secret: config.baidu.secretKey,
      },
    }
  );

  cachedToken = response.data.access_token;
  // 提前 1 小时过期，确保不因边际时间调用失败
  tokenExpiresAt = now + (response.data.expires_in - 3600) * 1000;
  console.log('✅ 百度 access_token 已获取');
  return cachedToken;
}
