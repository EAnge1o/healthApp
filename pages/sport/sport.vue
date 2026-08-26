<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from '@/store/user';
import { apiSaveSport, apiStartSport, apiAddGpsPoint, apiEndSport, apiGetSportRecords } from '@/api/index';
// #ifdef H5
import 'leaflet/dist/leaflet.css';
// #endif

const userStore = useUserStore();

const mapRef = ref<any>(null);
// #ifdef H5
let leafletModule: any = null;
let mapInstance: any = null;
let markerInstance: any = null;
let pathLine: any = null;
// #endif
const pathPoints: [number, number][] = [];

const mapReady = ref(false);

const DEFAULT_CENTER: [number, number] = [39.9042, 116.3974];

const mapCenter = ref({ latitude: DEFAULT_CENTER[0], longitude: DEFAULT_CENTER[1] });
const mapMarkers = ref<any[]>([]);
const mapPolylines = ref<any[]>([]);

// #ifdef H5
async function ensureLeaflet(): Promise<any> {
  if (leafletModule) return leafletModule;
  try {
    const mod = await import('leaflet');
    leafletModule = mod.default || mod;
    return leafletModule;
  } catch (e) {
    console.warn('Leaflet 未安装，请运行 npm install leaflet');
    return null;
  }
}
// #endif

async function initMap(lat?: number, lng?: number) {
  destroyMap();

  const center: [number, number] = (lat !== undefined && lng !== undefined) ? [lat, lng] : DEFAULT_CENTER;
  mapCenter.value = { latitude: center[0], longitude: center[1] };

  // #ifdef H5
  const L = await ensureLeaflet();
  if (!L) {
    mapReady.value = false;
    return;
  }

  await new Promise(r => setTimeout(r, 100));
  const el = mapRef.value?.$el || mapRef.value;
  if (!el) { console.warn('地图容器未找到'); return; }

  mapInstance = L.map(el).setView(center, 18);

  L.tileLayer('https://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7', {
    subdomains: '1234',
    maxZoom: 18,
  }).addTo(mapInstance);

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  markerInstance = L.marker(center).addTo(mapInstance);
  pathLine = L.polyline([], { color: '#C75B39', weight: 4 }).addTo(mapInstance);

  setTimeout(() => mapInstance?.invalidateSize(), 300);

  mapReady.value = true;

  bindMapClick(L);
  // #endif

  // #ifndef H5
  mapMarkers.value = [{ id: 1, latitude: center[0], longitude: center[1], iconPath: '/static/logo.png', width: 30, height: 30 }];
  mapPolylines.value = [];
  mapReady.value = true;
  // #endif
}

function updatePosition(lat: number, lng: number) {
  pathPoints.push([lat, lng]);

  // #ifdef H5
  if (mapInstance && markerInstance) {
    markerInstance.setLatLng([lat, lng]);
    mapInstance.setView([lat, lng]);
    if (pathLine) pathLine.setLatLngs(pathPoints);
  }
  // #endif

  // #ifndef H5
  mapCenter.value = { latitude: lat, longitude: lng };
  mapMarkers.value = [{ id: 1, latitude: lat, longitude: lng, iconPath: '/static/logo.png', width: 30, height: 30 }];
  mapPolylines.value = [{
    points: pathPoints.map(p => ({ latitude: p[0], longitude: p[1] })),
    color: '#C75B39',
    width: 4,
  }];
  // #endif
}

function destroyMap() {
  // #ifdef H5
  if (mapInstance) { mapInstance.remove(); mapInstance = null; markerInstance = null; pathLine = null; }
  // #endif
  pathPoints.length = 0;
  mapReady.value = false;
  mapMarkers.value = [];
  mapPolylines.value = [];
}

// ---- 手动记录 ----
const mode = ref('跑步');
const duration = ref(30);
const distance = ref(5);
const loading = ref(false);
const modes = ['跑步', '步行', '骑行', '游泳', '健身', '瑜伽', '跳绳', '篮球', '足球', '其他'];

// ---- GPS 运动 ----
const isRunning = ref(false);
const recordId = ref(0);
const startTime = ref(0);
const elapsed = ref(0);
const gpsDistance = ref(0);
const timer: any = ref(null);
const lastLat = ref(0);
const lastLng = ref(0);
const gpsAvailable = ref(false);

// ---- 绘制路线（仅 H5 支持）----
const drawingMode = ref(false);
const drawPoints: [number, number][] = [];
// #ifdef H5
let drawPolyline: any = null;
let drawMarkers: any[] = [];
// #endif
const drawDistance = ref(0);
const drawDuration = ref(30);

function toggleDrawing() {
  // #ifndef H5
  uni.showToast({ title: '绘制路线功能仅支持 H5 平台', icon: 'none' });
  return;
  // #endif
  // #ifdef H5
  drawingMode.value = !drawingMode.value;
  if (!drawingMode.value) return;
  clearDrawing();
  uni.showToast({ title: '点击地图添加途经点', icon: 'none', duration: 2000 });
  // #endif
}

async function saveDrawing() {
  if (drawDistance.value <= 0) return;
  try {
    await apiSaveSport('跑步', drawDuration.value * 60, drawDistance.value);
    uni.showToast({ title: `已保存 ${(drawDistance.value / 1000).toFixed(2)} km`, icon: 'success' });
    clearDrawing();
    drawingMode.value = false;
  } catch (err: any) { uni.showToast({ title: err.message, icon: 'none' }); }
}

function clearDrawing() {
  drawPoints.length = 0;
  // #ifdef H5
  if (drawPolyline) { drawPolyline.remove(); drawPolyline = null; }
  drawMarkers.forEach((m: any) => m.remove());
  drawMarkers = [];
  // #endif
  drawDistance.value = 0;
}

// #ifdef H5
function onMapClick(L: any, e: any) {
  if (!drawingMode.value || !mapInstance) return;
  const pt: [number, number] = [e.latlng.lat, e.latlng.lng];
  drawPoints.push(pt);

  const m = L.circleMarker(pt, { radius: 6, color: '#C75B39', fillColor: '#C75B39', fillOpacity: 0.8 }).addTo(mapInstance);
  drawMarkers.push(m);

  if (drawPoints.length >= 2) {
    if (drawPolyline) drawPolyline.remove();
    drawPolyline = L.polyline(drawPoints, { color: '#C75B39', weight: 4, dashArray: '8 4' }).addTo(mapInstance);

    let total = 0;
    for (let i = 1; i < drawPoints.length; i++) {
      total += calcDistance(drawPoints[i-1][0], drawPoints[i-1][1], drawPoints[i][0], drawPoints[i][1]);
    }
    drawDistance.value = Math.round(total);
  }
}

function bindMapClick(L: any) {
  if (mapInstance) {
    mapInstance.off('click');
    mapInstance.on('click', (e: any) => onMapClick(L, e));
  }
}
// #endif

// ---- 公共 ----
const tabIndex = ref(0);
const records = ref<any[]>([]);

watch(tabIndex, (val) => {
  if (val === 1) {
    setTimeout(() => initMap(), 200);
  } else {
    drawingMode.value = false;
    clearDrawing();
  }
});

// ---- 格式化 ----
function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function formatShort(seconds: number) {
  if (!seconds) return '0分';
  const m = Math.floor(seconds / 60);
  return `${m}分钟`;
}
function distanceKm(meters: number) {
  if (!meters) return '0 km';
  return (meters / 1000).toFixed(2) + ' km';
}
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---- 手动记录 ----
function selectMode(m: string) { mode.value = m; }
async function submitSport() {
  if (!duration.value || duration.value <= 0) {
    uni.showToast({ title: '请输入运动时长', icon: 'none' }); return;
  }
  if (!userStore.isLoggedIn) { uni.navigateTo({ url: '/pages/login/login' }); return; }
  loading.value = true;
  try {
    await apiSaveSport(mode.value, duration.value * 60, (distance.value || 0) * 1000);
    uni.showToast({ title: '已保存', icon: 'success' });
    duration.value = 30; distance.value = 5;
  } catch (err: any) { uni.showToast({ title: err.message, icon: 'none' }); }
  finally { loading.value = false; }
}

// ---- GPS 运动（使用 uni.getLocation）----
function startSport() {
  if (!userStore.isLoggedIn) { uni.navigateTo({ url: '/pages/login/login' }); return; }
  drawingMode.value = false;
  clearDrawing();

  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      lastLat.value = res.latitude;
      lastLng.value = res.longitude;
      gpsAvailable.value = true;
      initMap(res.latitude, res.longitude);
      doStartWithGps();
    },
    fail: () => {
      gpsAvailable.value = false;
      initMap();
      doStartWithoutGps();
    },
  });

  async function doStartWithGps() {
    try {
      const data: any = await apiStartSport();
      recordId.value = data.recordId;
      isRunning.value = true;
      startTime.value = Date.now();
      gpsDistance.value = 0;
      elapsed.value = 0;
      timer.value = setInterval(() => {
        elapsed.value = Math.floor((Date.now() - startTime.value) / 1000);
        uni.getLocation({
          type: 'gcj02',
          success: (loc) => {
            const d = calcDistance(lastLat.value, lastLng.value, loc.latitude, loc.longitude);
            if (d < 100) gpsDistance.value += d;
            lastLat.value = loc.latitude;
            lastLng.value = loc.longitude;
            updatePosition(loc.latitude, loc.longitude);
            apiAddGpsPoint(recordId.value, loc.latitude, loc.longitude);
          },
        });
      }, 3000);
    } catch (err: any) { uni.showToast({ title: err.message, icon: 'none' }); }
  }

  async function doStartWithoutGps() {
    try {
      const data: any = await apiStartSport();
      recordId.value = data.recordId;
      isRunning.value = true;
      startTime.value = Date.now();
      gpsDistance.value = 0;
      elapsed.value = 0;
      timer.value = setInterval(() => {
        elapsed.value = Math.floor((Date.now() - startTime.value) / 1000);
      }, 1000);
    } catch (err: any) { uni.showToast({ title: err.message, icon: 'none' }); }
  }
}
async function endSport() {
  clearInterval(timer.value);
  isRunning.value = false;
  try {
    await apiEndSport(recordId.value, elapsed.value, Math.round(gpsDistance.value));
    uni.showToast({ title: '已保存', icon: 'success' });
    elapsed.value = 0; gpsDistance.value = 0;
    gpsAvailable.value = false;
  } catch (err: any) { uni.showToast({ title: err.message, icon: 'none' }); }
}

// ---- 历史 ----
async function loadRecords() {
  try { const data: any = await apiGetSportRecords(); records.value = data.list; } catch {}
}

onMounted(() => {});

onUnmounted(() => { clearInterval(timer.value); destroyMap(); });
</script>

<template>
  <view class="page-container">
    <view class="tabs">
      <view class="tab" :class="{ active: tabIndex === 0 }" @click="tabIndex = 0">手动记录</view>
      <view class="tab" :class="{ active: tabIndex === 1 }" @click="tabIndex = 1">GPS 运动</view>
      <view class="tab" :class="{ active: tabIndex === 2 }" @click="tabIndex = 2; loadRecords()">历史记录</view>
    </view>

    <!-- 手动记录 -->
    <view v-if="tabIndex === 0">
      <view class="card">
        <text class="section-title">运动模式</text>
        <view class="mode-grid">
          <view v-for="m in modes" :key="m" class="mode-item" :class="{ selected: mode === m }" @click="selectMode(m)">{{ m }}</view>
        </view>
      </view>
      <view class="card">
        <view class="input-group">
          <text class="input-label">运动时长（分钟）</text>
          <input class="input-num" :value="String(duration)" @input="(e: any) => duration = Number(e.detail?.value ?? e.target?.value) || 0" type="number" />
        </view>
        <view class="input-group" style="margin-top: 12px;">
          <text class="input-label">运动距离（公里）</text>
          <input class="input-num" :value="String(distance)" @input="(e: any) => distance = Number(e.detail?.value ?? e.target?.value) || 0" type="number" />
        </view>
        <view class="btn-primary" :class="{ 'btn-disabled': loading }" @click="submitSport" style="margin-top: 18px;">{{ loading ? '保存中...' : '保存运动记录' }}</view>
      </view>
    </view>

    <!-- GPS 运动 -->
    <view v-if="tabIndex === 1">
      <!-- #ifdef H5 -->
      <view ref="mapRef" class="map-box"></view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <map
        class="map-box"
        :latitude="mapCenter.latitude"
        :longitude="mapCenter.longitude"
        :markers="mapMarkers"
        :polyline="mapPolylines"
        :scale="16"
        show-location
      />
      <!-- #endif -->

      <!-- 绘制路线工具栏 -->
      <view v-if="!isRunning" class="card draw-tools">
        <view class="draw-row">
          <view class="draw-btn" :class="{ active: drawingMode }" @click="toggleDrawing">
            ✏️ {{ drawingMode ? '绘制中（点击地图加点）' : '绘制路线' }}
          </view>
          <view v-if="drawingMode" class="draw-clear" @click="clearDrawing">清空</view>
        </view>
        <view v-if="drawDistance > 0" class="draw-result">
          路线距离: <text class="draw-num">{{ (drawDistance / 1000).toFixed(2) }} km</text>
          <view class="draw-duration-row">
            <text class="draw-label">运动时长:</text>
            <input
              class="draw-duration-input"
              :value="String(drawDuration)"
              @input="(e: any) => drawDuration = Number(e.detail?.value ?? e.target?.value) || 0"
              type="number"
            />
            <text class="draw-label">分钟</text>
          </view>
          <view class="btn-save-draw" @click="saveDrawing">保存运动记录</view>
        </view>
      </view>

      <!-- 运动状态 -->
      <view v-if="isRunning" class="card running-info">
        <text class="time-display">{{ formatTime(elapsed) }}</text>
        <text class="dist-display">{{ (gpsDistance / 1000).toFixed(2) }} km</text>
        <text v-if="!gpsAvailable" class="gps-warn">⚠ GPS 未授权，仅记录时长</text>
        <text v-else class="gps-ok">📍 GPS 追踪中</text>
        <view class="stop-btn" @click="endSport">🏁 结束运动</view>
      </view>
      <view v-else class="card start-area" @click="startSport">
        <text class="start-icon">🏃‍♂️</text>
        <text class="start-text">点击开始运动</text>
        <text class="start-hint">GPS 实时追踪路线、时间和距离</text>
      </view>
    </view>

    <!-- 历史记录 -->
    <view v-if="tabIndex === 2">
      <view v-if="records.length === 0" class="empty">暂无运动记录</view>
      <view v-for="r in records" :key="r.id" class="card record-item">
        <view class="record-header">
          <text class="record-mode">{{ r.mode || '跑步' }}</text>
          <text class="record-date">{{ r.start_time?.slice(0, 16) }}</text>
        </view>
        <view class="record-body">
          <text class="record-stat">⏱ {{ formatShort(r.duration) }}</text>
          <text class="record-stat">📏 {{ distanceKm(r.distance) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page-container { min-height: 100vh; padding: 12px 12px 24px; box-sizing: border-box; }
.card { background: #FFFFFF; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.tabs { display: flex; background: #FFFFFF; border-radius: 12px; margin-bottom: 12px; overflow: hidden; }
.tab { flex: 1; text-align: center; padding: 12px 0; font-size: 14px; color: #8B7355; }
.tab.active { color: #C75B39; font-weight: bold; border-bottom: 2px solid #C75B39; }

.section-title { font-size: 14px; color: #8B7355; display: block; margin-bottom: 10px; }
.mode-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.mode-item { padding: 20px; border: 1px solid #EEEEEE; border-radius: 12px; font-size: 13px; color: #8B7355; background: #FAF5F0; }
.mode-item.selected { background: linear-gradient(135deg, #C75B39, #A0442C); color: #FFFFFF; border-color: #C75B39; }

.input-group { display: flex; justify-content: space-between; align-items: center; }
.input-label { font-size: 14px; color: #2C1810; }
.input-num { width: 80px; padding: 20px; border: 1px solid #EEEEEE; border-radius: 12px; font-size: 14px; text-align: center; background: #FAF5F0; height: auto; min-height: 24px; }

.btn-primary { background-color: #C75B39; color: #FFFFFF; border: none; border-radius: 12px; padding: 12px 0; font-size: 16px; text-align: center; }
.btn-disabled { opacity: 0.5; pointer-events: none; }

.map-box { width: 100%; height: 300px; border-radius: 12px; margin-bottom: 12px; z-index: 0; }

.start-area { min-height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.start-icon { font-size: 50px; }
.start-text { font-size: 18px; color: #2C1810; margin-top: 8px; font-weight: bold; }
.start-hint { font-size: 13px; color: rgba(139,115,85,.6); margin-top: 4px; }
.running-info { text-align: center; padding: 20px; }
.time-display { font-size: 30px; font-weight: bold; color: #C75B39; display: block; }
.dist-display { font-size: 18px; color: #2C1810; margin-top: 6px; display: block; }
.stop-btn { margin-top: 16px; background: #FA5151; color: #FFFFFF; border-radius: 12px; padding: 10px 0; font-size: 17px; width: 180px; margin: 16px auto 0; }

.draw-tools { padding: 20px; }
.draw-row { display: flex; align-items: center; gap: 8px; }
.draw-btn { flex: 1; text-align: center; padding: 8px 0; border: 1px solid #C75B39; border-radius: 12px; font-size: 14px; color: #C75B39; }
.draw-btn.active { background: linear-gradient(135deg, #C75B39, #A0442C); color: #FFFFFF; }
.draw-clear { font-size: 14px; color: #FA5151; padding: 20px; }
.draw-result { margin-top: 6px; font-size: 14px; color: #8B7355; text-align: center; }
.draw-duration-row { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 8px; }
.draw-label { font-size: 13px; color: #8B7355; }
.draw-duration-input { width: 60px; padding: 20px; border: 1px solid #DCDCDC; border-radius: 12px; font-size: 13px; text-align: center; height: auto; min-height: 24px; }
.draw-num { color: #C75B39; font-weight: bold; font-size: 16px; }
.btn-save-draw { margin-top: 8px; background: linear-gradient(135deg, #C75B39, #A0442C); color: #FFFFFF; border-radius: 12px; padding: 8px 0; font-size: 14px; text-align: center; }
.gps-warn { display: block; font-size: 12px; color: #FFC300; margin-top: 4px; }
.gps-ok { display: block; font-size: 12px; color: #C75B39; margin-top: 4px; }

.empty { text-align: center; padding: 40px 0; color: rgba(139,115,85,.6); font-size: 14px; }
.record-item { padding: 20px; }
.record-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.record-mode { font-size: 16px; font-weight: bold; color: #C75B39; }
.record-date { font-size: 12px; color: rgba(139,115,85,.6); }
.record-body { display: flex; gap: 16px; }
.record-stat { font-size: 13px; color: #8B7355; }
</style>
