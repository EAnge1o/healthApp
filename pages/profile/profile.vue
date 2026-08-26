<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/store/user';
import { apiGetProfile, apiUpdateProfile, apiGetLatestMetrics, apiAddMetric } from '@/api/index';
import { getBaseUrl, setBaseUrl } from '@/api/request';

const userStore = useUserStore();
const nickname = ref('');
const editing = ref(false);
const avatarUrl = ref('');
const height = ref<number | null>(172);
const weight = ref<number | null>(65);
const editingMetric = ref('');

const bmi = computed(() => {
  if (height.value && weight.value && height.value > 0) {
    return (weight.value / ((height.value / 100) ** 2)).toFixed(1);
  }
  return '--';
});

onMounted(async () => {
  if (!userStore.isLoggedIn) { uni.navigateTo({ url: '/pages/login/login' }); return; }
  try { const d: any = await apiGetProfile(); nickname.value = d.nickname; avatarUrl.value = d.avatar || ''; } catch {}
  try { const m: any = await apiGetLatestMetrics(); if (m.height) height.value = m.height; if (m.weight) weight.value = m.weight; } catch {}
});

async function saveNickname() {
  try { await apiUpdateProfile(nickname.value, avatarUrl.value); userStore.updateUser({ nickname: nickname.value }); editing.value = false; uni.showToast({ title: '已更新' }); }
  catch (err: any) { uni.showToast({ title: err.message, icon: 'none' }); }
}

function changeAvatar() {
  uni.chooseImage({
    count: 1, sourceType: ['album', 'camera'],
    success: (res: any) => {
      uni.uploadFile({
        url: getBaseUrl() + '/auth/avatar', filePath: res.tempFilePaths[0], name: 'avatar',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        success: (upRes: any) => {
          try {
            const d = JSON.parse(upRes.data);
            if (d.code === 200) { avatarUrl.value = d.data.url; userStore.updateUser({ avatar: d.data.url }); uni.showToast({ title: '已更新' }); }
          } catch { uni.showToast({ title: '失败', icon: 'none' }); }
        },
        fail: () => uni.showToast({ title: '失败', icon: 'none' }),
      });
    },
  });
}

async function saveMetric(type: string, val: number) {
  if (!val || val <= 0) return;
  await apiAddMetric(type, val, new Date().toISOString().slice(0, 10));
  if (type === 'height') height.value = val;
  else weight.value = val;
  editingMetric.value = '';
  uni.showToast({ title: '已更新' });
}

const menus = [
  { icon: '🏃', text: '运动记录', url: '/pages/records/sport' },
  { icon: '🍎', text: '饮食记卡', url: '/pages/records/card' },
  { icon: '🤖', text: 'AI 分析记录', url: '/pages/records/ai' },
  { icon: '📏', text: '身高变化记录', url: '/pages/records/height' },
  { icon: '⚖️', text: '体重变化记录', url: '/pages/records/weight' },
];

const editingServer = ref(false);
const serverUrl = ref(getBaseUrl());

function saveServer() {
  const url = serverUrl.value.trim().replace(/\/+$/, '');
  if (!url) { serverUrl.value = getBaseUrl(); return; }
  setBaseUrl(url);
  serverUrl.value = url;
  editingServer.value = false;
  uni.showToast({ title: '服务器地址已更新', icon: 'success' });
}

function handleLogout() {
  uni.showModal({
    title: '提示', content: '确定退出？',
    success: (r: any) => { if (r.confirm) { userStore.logout(); uni.navigateTo({ url: '/pages/login/login' }); } },
  });
}
</script>

<template>
  <view class="page-container">
    <!-- 用户卡片 -->
    <view class="user-card" @click="changeAvatar">
      <image v-if="avatarUrl" :src="avatarUrl" mode="aspectFill" class="avatar-img" />
      <text v-else class="avatar-text">🧑</text>
      <view class="user-info">
        <text class="user-name">{{ userStore.user?.nickname || '用户' }}</text>
        <text class="user-tip">点击更换头像</text>
      </view>
    </view>

    <!-- 身高体重 BMI -->
    <view class="metric-row">
      <view class="metric-card" @click="editingMetric='height'">
        <text class="metric-label">身高</text>
        <text v-if="editingMetric!=='height'" class="metric-val">{{ height }}<text class="metric-unit">cm</text></text>
        <input v-else class="metric-input" :value="String(height||'')" @input="(e:any)=>height=Number(e.detail?.value??e.target?.value)||0" type="number" @blur="saveMetric('height',height!)" />
      </view>
      <view class="metric-card" @click="editingMetric='weight'">
        <text class="metric-label">体重</text>
        <text v-if="editingMetric!=='weight'" class="metric-val">{{ weight }}<text class="metric-unit">kg</text></text>
        <input v-else class="metric-input" :value="String(weight||'')" @input="(e:any)=>weight=Number(e.detail?.value??e.target?.value)||0" type="number" @blur="saveMetric('weight',weight!)" />
      </view>
      <view class="metric-card bmi-card">
        <text class="metric-label">BMI</text>
        <text class="metric-val bmi-val">{{ bmi }}</text>
      </view>
    </view>

    <!-- 昵称编辑 -->
    <view class="cell-group">
      <view class="cell">
        <text class="cell-title">用户名</text>
        <text class="cell-note">{{ userStore.user?.username }}</text>
      </view>
      <view class="cell">
        <text class="cell-title">昵称</text>
        <view class="cell-right">
          <template v-if="!editing">
            <text class="cell-note">{{ nickname }}</text>
            <text class="edit-link" @click="editing=true">修改</text>
          </template>
          <template v-else>
            <input class="nickname-input" :value="nickname" @input="(e:any)=>nickname=e.detail?.value??e.target?.value" />
            <text class="edit-link" @click="saveNickname">保存</text>
          </template>
        </view>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="cell-group">
      <view v-for="m in menus" :key="m.text" class="cell cell-arrow" @click="uni.navigateTo({ url: m.url })">
        <text class="cell-title">{{ m.icon }} {{ m.text }}</text>
        <text class="cell-arrow-icon">›</text>
      </view>
    </view>

    <!-- 服务器地址 -->
    <view class="cell-group">
      <view class="cell">
        <text class="cell-title">⚙ 服务器地址</text>
        <view class="cell-right">
          <template v-if="!editingServer">
            <text class="server-url-text">{{ serverUrl }}</text>
            <text class="edit-link" @click="editingServer = true">修改</text>
          </template>
          <template v-else>
            <input class="server-input" :value="serverUrl" @input="(e:any) => serverUrl = e.detail?.value ?? e.target?.value" placeholder="http://localhost:3000/api" />
            <text class="edit-link" @click="saveServer">保存</text>
          </template>
        </view>
      </view>
    </view>

    <view class="logout-wrap">
      <view class="logout-btn" @click="handleLogout">退出登录</view>
    </view>
  </view>
</template>

<style scoped>
.page-container { min-height: 100vh; padding: 16px; padding-bottom: 70px; box-sizing: border-box; background: #FAF5F0; }

.user-card { display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 20px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.03); }
.avatar-img { width: 64px; height: 64px; border-radius: 50%; }
.avatar-text { font-size: 48px; }
.user-info { flex: 1; }
.user-name { font-size: 20px; font-weight: 700; color: #1D1D1F; display: block; }
.user-tip { font-size: 12px; color: #9E9EA7; margin-top: 2px; display: block; }

.metric-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.metric-card { background: #fff; border-radius: 16px; padding: 18px 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.03); }

@media(width<768px){
	.metric-row { display: grid; grid-template-columns: 1fr; gap:10px; margin-bottom: 10px;}
	.metric-card { background: #fff; border-radius: 16px; padding: 18px 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.03); }
}

.bmi-card { background: rgba(199,91,57,.06); }
.metric-label { font-size: 12px; color: #9E9EA7; display: block; }
.metric-val { font-size: 28px; font-weight: 700; color: #1D1D1F; display: block; margin-top: 4px; }
.metric-unit { font-size: 13px; font-weight: 400; color: #9E9EA7; }
.bmi-val { color: #C75B39; }
.metric-input { width: 100%; text-align: center; font-size: 24px; font-weight: 700; border: 2px solid #C75B39; border-radius: 8px; padding: 4px 0; background: #fff; height: auto; min-height: 36px; }

.edit-link { color: #C75B39; font-size: 14px; font-weight: 500; margin-left: 8px; }

/* 替代 TDesign 的 cell 组件 */
.cell-group { background: #fff; border-radius: 16px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.03); }
.cell { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; min-height: 44px; border-bottom: 1px solid #f5f5f5; }
.cell:last-child { border-bottom: none; }
.cell-title { font-size: 15px; color: #1D1D1F; font-weight: 500; white-space: nowrap; }
.cell-note { font-size: 14px; color: #9E9EA7; }
.cell-right { display: flex; align-items: center; gap: 4px; }
.cell-arrow-icon { font-size: 20px; color: #c8c7cc; font-weight: 300; }
.nickname-input { border: 1px solid #E5E5EA; border-radius: 4px; padding: 2px 8px; font-size: 14px; width: 120px; height: auto; min-height: 24px; }

.server-url-text { font-size: 12px; color: #9E9EA7; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.server-input { border: 1px solid #E5E5EA; border-radius: 4px; padding: 2px 8px; font-size: 13px; width: 200px; height: auto; min-height: 24px; }

.logout-wrap { padding: 24px 0; }
.logout-btn { width: 100%; padding: 12px 0; border-radius: 12px; border: 1px solid #FA5151; color: #FA5151; font-size: 16px; text-align: center; background: #fff; }
</style>
