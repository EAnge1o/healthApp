<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/user';
import { apiGenerateAnalysis, apiGetAiHistory } from '@/api/index';

const userStore = useUserStore();
const analyzing = ref(false);
const history = ref<any[]>([]);
const tabIndex = ref(0);

const currentResult = ref<{
  dietAdvice: string;
  sportAdvice: string;
} | null>(null);

async function doAnalyze() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' });
    return;
  }
  analyzing.value = true;
  try {
    const data: any = await apiGenerateAnalysis();
    currentResult.value = data;
  } catch (err: any) {
    uni.showToast({ title: err.message, icon: 'none' });
  } finally {
    analyzing.value = false;
  }
}

async function loadHistory() {
  try {
    const data: any = await apiGetAiHistory();
    history.value = data;
  } catch {}
}
</script>

<template>
  <view class="page-container">
    <view class="tabs">
      <view class="tab" :class="{ active: tabIndex === 0 }" @click="tabIndex = 0">AI 分析</view>
      <view class="tab" :class="{ active: tabIndex === 1 }" @click="tabIndex = 1; loadHistory()">历史记录</view>
    </view>

    <view v-if="tabIndex === 0">
      <!-- 触发分析 -->
      <view class="card analyze-trigger" v-if="!currentResult && !analyzing">
        <text class="trigger-icon">🤖</text>
        <text class="trigger-title">AI 健康分析</text>
        <text class="trigger-desc">系统将汇总您的饮食和运动数据，由 AI 生成个性化健康管理建议</text>
        <text class="trigger-warn">⚠️ 分析结果仅作为健康管理参考，不作为医疗诊断结论</text>
        <view class="btn-primary" @click="doAnalyze" style="margin-top: 16px; width: 100%;">
          开始分析
        </view>
      </view>

      <!-- 分析中 -->
      <view class="card" v-if="analyzing" style="text-align: center; padding: 30px;">
        <text style="font-size: 30px; display: block;">⏳</text>
        <text style="font-size: 15px; color: #2C1810; display: block; margin-top: 12px;">AI 正在分析您的数据...</text>
      </view>

      <!-- 分析结果 -->
      <view v-if="currentResult">
        <view class="card advice-card">
          <text class="advice-title">🍎 饮食建议</text>
          <text class="advice-content">{{ currentResult.dietAdvice }}</text>
        </view>
        <view class="card advice-card">
          <text class="advice-title">🏃 运动建议</text>
          <text class="advice-content">{{ currentResult.sportAdvice }}</text>
        </view>
        <view class="btn-primary" @click="currentResult = null" style="margin-top: 12px; background: #8B7355;">
          重新分析
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view v-if="tabIndex === 1">
      <view v-if="history.length === 0" class="empty">暂无分析记录</view>
      <view v-for="h in history" :key="h.id" class="card history-item">
        <text class="history-time">{{ h.created_at?.slice(0, 10) }}</text>
        <text class="history-summary">{{ h.diet_advice?.slice(0, 80) }}...</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.tabs {
  display: flex;
  background: #FFFFFF;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 15px;
  color: #8B7355;
}
.tab.active { color: #C75B39; font-weight: bold; border-bottom: 2px solid #C75B39; }

.analyze-trigger {
  text-align: center;
  padding: 20px;
}
.trigger-icon { font-size: 50px; display: block; }
.trigger-title { font-size: 18px; color: #2C1810; font-weight: bold; display: block; margin-top: 8px; }
.trigger-desc { font-size: 13px; color: #8B7355; display: block; margin-top: 6px; line-height: 1.6; }
.trigger-warn { font-size: 12px; color: #FFC300; display: block; margin-top: 8px; }

.advice-card { margin-bottom: 8px; }
.advice-title { font-size: 15px; color: #C75B39; font-weight: bold; display: block; margin-bottom: 6px; }
.advice-content { font-size: 14px; color: #2C1810; line-height: 1.6; }

.history-item { padding: 20px; }
.history-time { font-size: 12px; color: rgba(139,115,85,.6); display: block; margin-bottom: 4px; }
.history-summary { font-size: 14px; color: #2C1810; }

.empty { text-align: center; padding: 40px 0; color: rgba(139,115,85,.6); font-size: 14px; }
</style>
