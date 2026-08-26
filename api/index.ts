import { getBaseUrl, request } from './request';

// ---- 认证 ----
export function apiRegister(username: string, password: string, nickname: string) {
  return request('/auth/register', { method: 'POST', data: { username, password, nickname }, auth: false });
}

export function apiLogin(username: string, password: string) {
  return request('/auth/login', { method: 'POST', data: { username, password }, auth: false });
}

export function apiGetProfile() {
  return request('/auth/profile');
}

export function apiUpdateProfile(nickname: string, avatar: string) {
  return request('/auth/profile', { method: 'PUT', data: { nickname, avatar } });
}

// ---- 运动 ----
export function apiSaveSport(mode: string, duration: number, distance: number) {
  return request('/sport/save', { method: 'POST', data: { mode, duration, distance } });
}

export function apiStartSport() {
  return request('/sport/start', { method: 'POST' });
}

export function apiAddGpsPoint(recordId: number, latitude: number, longitude: number) {
  return request('/sport/gps', { method: 'POST', data: { recordId, latitude, longitude } });
}

export function apiEndSport(recordId: number, duration: number, distance: number) {
  return request('/sport/end', { method: 'POST', data: { recordId, duration, distance } });
}

export function apiGetSportRecords(page = 1, pageSize = 20) {
  return request(`/sport/records?page=${page}&pageSize=${pageSize}`);
}

export function apiGetSportDetail(recordId: number) {
  return request(`/sport/${recordId}`);
}

export function apiGetSportStats() {
  return request('/sport/stats');
}
export function apiUpdateSport(id: number, mode: string, duration: number, distance: number) {
  return request(`/sport/${id}`, { method: 'PUT', data: { mode, duration, distance } });
}
export function apiDeleteSport(id: number) {
  return request(`/sport/${id}`, { method: 'DELETE' });
}

// ---- 记卡 ----
export function apiGetCardRecords(page = 1, pageSize = 20) {
  return request(`/card/records?page=${page}&pageSize=${pageSize}`);
}
export function apiUpdateCard(id: number, result: string) {
  return request(`/card/${id}`, { method: 'PUT', data: { result } });
}
export function apiDeleteCard(id: number) {
  return request(`/card/${id}`, { method: 'DELETE' });
}

// 注意：拍照记卡需要使用 uni.uploadFile，不在 request 封装内
export function apiBarcodeCard(barcode: string, imageUrl = '') {
  return request('/card/barcode', { method: 'POST', data: { barcode, imageUrl } });
}

// ---- AI分析 ----
export function apiGenerateAnalysis() {
  return request('/ai/analyze', { method: 'POST' });
}

export function apiGetAiHistory(page = 1, pageSize = 10) {
  return request(`/ai/history?page=${page}&pageSize=${pageSize}`);
}
export function apiDeleteAi(id: number) {
  return request(`/ai/${id}`, { method: 'DELETE' });
}

// ---- 健康指标 ----
export function apiGetLatestMetrics() { return request('/metric/latest'); }
export function apiGetMetrics(type: string) { return request(`/metric/${type}`); }
export function apiAddMetric(type: string, value: number, date: string) {
  return request('/metric', { method: 'POST', data: { type, value, date } });
}
export function apiDeleteMetric(id: number) { return request(`/metric/${id}`, { method: 'DELETE' }); }

// ---- 每日打卡 ----
export function apiGetGoals() { return request('/goal'); }
export function apiCreateGoal(type: string, target: number) { return request('/goal', { method: 'POST', data: { type, target } }); }
export function apiDeleteGoal(id: number) { return request(`/goal/${id}`, { method: 'DELETE' }); }
export function apiCheckin(goalId: number) { return request(`/goal/${goalId}/checkin`, { method: 'POST' }); }

// ---- 文章 ----
export function apiCreateArticle(title: string, content: string) {
  return request('/article', { method: 'POST', data: { title, content } });
}

export function apiGetArticles(page = 1, pageSize = 20) {
  return request(`/article?page=${page}&pageSize=${pageSize}`);
}

export function apiGetArticleDetail(id: number) {
  return request(`/article/${id}`);
}

export function apiDeleteArticle(id: number) {
  return request(`/article/${id}`, { method: 'DELETE' });
}

// ---- 拍照记卡专用 ----
export function uploadPhotoCard(imagePath: string): Promise<any> {
  const token = uni.getStorageSync('token');
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${getBaseUrl()}/card/photo`,
      filePath: imagePath,
      name: 'image',
      header: { Authorization: `Bearer ${token}` },
      success: (res: any) => {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) resolve(data.data);
          else reject(new Error(data.message));
        } catch {
          reject(new Error('解析响应失败'));
        }
      },
      fail: (err: any) => reject(new Error(err.errMsg)),
    });
  });
}
