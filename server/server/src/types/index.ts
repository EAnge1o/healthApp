export interface User {
  id: number;
  username: string;
  password_hash: string;
  nickname: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

export interface SportRecord {
  id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  duration: number;
  distance: number;
  mode: string;
  created_at: string;
}

export interface GpsPoint {
  id: number;
  record_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface CardRecord {
  id: number;
  user_id: number;
  type: 'photo' | 'barcode';
  image_url: string;
  barcode: string;
  result: string;
  created_at: string;
}

export interface AiResult {
  id: number;
  user_id: number;
  diet_advice: string;
  sport_advice: string;
  comprehensive_advice: string;
  created_at: string;
}

export interface Article {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}
