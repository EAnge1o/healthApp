const DEFAULT_BASE_URL = 'http://localhost:3000/api';
const STORAGE_KEY = 'serverUrl';

export function getBaseUrl(): string {
  return uni.getStorageSync(STORAGE_KEY) || DEFAULT_BASE_URL;
}

export function setBaseUrl(url: string): void {
  uni.setStorageSync(STORAGE_KEY, url);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  auth?: boolean;
}

export function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, auth = true } = options;

  const header: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = uni.getStorageSync('token');
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: getBaseUrl() + url,
      method,
      data,
      header,
      success: (res: any) => {
        console.log(`[API] ${method} ${url} → ${res.statusCode}`, res.data);
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data.data);
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token');
          uni.removeStorageSync('user');
          uni.navigateTo({ url: '/pages/login/login' });
          reject(new Error(res.data?.message || '未登录'));
        } else {
          reject(new Error(res.data?.message || `请求失败 (${res.statusCode})`));
        }
      },
      fail: (err: any) => {
        console.error(`[API] ${method} ${url} → 网络错误`, err);
        reject(new Error(err.errMsg || '网络错误'));
      },
    });
  });
}
