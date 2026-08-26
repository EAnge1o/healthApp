<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiGetAiHistory, apiDeleteAi } from '@/api/index';

const records = ref<any[]>([]);

onMounted(() => loadRecords());
async function loadRecords() { try { records.value = await apiGetAiHistory(1, 50) as any; } catch {} }

async function del(id: number) {
  const res: any = await new Promise(r => uni.showModal({ title:'确认删除', content:'删除后不可恢复', success: r }));
  if (!res.confirm) return;
  await apiDeleteAi(id); uni.showToast({title:'已删除'}); loadRecords();
}
</script>

<template>
  <view class="page-container">
    <view v-if="records.length===0" class="empty">暂无 AI 分析记录</view>
    <view v-for="r in records" :key="r.id" class="card record-item">
      <view class="rec-head">
        <text class="rec-tag">🤖 {{ r.created_at?.slice(0,16) }}</text>
        <text class="a-del" @click="del(r.id)">删除</text>
      </view>
      <view class="section"><text class="s-title">🍎 饮食建议</text><text class="s-body">{{ r.diet_advice }}</text></view>
      <view class="section"><text class="s-title">🏃 运动建议</text><text class="s-body">{{ r.sport_advice }}</text></view>
    </view>
  </view>
</template>

<style scoped>
.page-container { min-height: 100vh; padding: 12px; box-sizing: border-box; }
.card { background: #FFFFFF; border-radius: 12px; padding: 20px; margin-bottom: 8px; }
.empty { text-align: center; padding: 40px 0; color: rgba(139,115,85,.6); font-size: 14px; }
.rec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.rec-tag { font-size: 14px; font-weight: bold; color: #C75B39; }
.a-del { font-size: 12px; color: #FA5151; }
.section { margin-top: 8px; }
.s-title { font-size: 13px; color: #C75B39; font-weight: bold; display: block; margin-bottom: 3px; }
.s-body { font-size: 13px; color: #2C1810; line-height: 1.6; }
</style>
