<script setup lang="ts">
import { ref, onMounted } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { apiGetMetrics, apiAddMetric, apiDeleteMetric } from '@/api/index';

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

const records = ref<any[]>([]);
const showAdd = ref(false);
const newDate = ref(new Date().toISOString().slice(0, 10));
const newValue = ref(170);

const chartOption = ref({});

function buildChart(data: any[]) {
  chartOption.value = {
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: data.map(d => d.recorded_at?.slice(5) || ''), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', min: v => v.min - 5, axisLabel: { fontSize: 10 } },
    tooltip: { trigger: 'axis' },
    series: [{
      type: 'line', data: data.map(d => Number(d.value)),
      smooth: true, lineStyle: { color: '#C75B39', width: 2 },
      itemStyle: { color: '#C75B39' },
      areaStyle: { color: 'rgba(104,217,184,0.15)' },
    }],
  };
}

async function load() {
  try { records.value = await apiGetMetrics('height') as any; buildChart(records.value); } catch {}
}
async function add() {
  if (!newDate.value || !newValue.value) return;
  await apiAddMetric('height', newValue.value, newDate.value);
  showAdd.value = false; uni.showToast({ title: '已添加' }); load();
}
async function del(id: number) {
  const res: any = await new Promise(r => uni.showModal({ title: '确认删除', success: r }));
  if (!res.confirm) return;
  await apiDeleteMetric(id); load();
}

onMounted(load);
</script>

<template>
  <view class="page-container">
    <view class="card">
      <VChart :option="chartOption" style="height:200px" autoresize />
    </view>
    <view class="card list">
      <view v-if="records.length===0" class="empty">暂无记录</view>
      <view v-for="r in records" :key="r.id" class="rec-row">
        <text class="rec-date">{{ r.recorded_at?.slice(0,10) }}</text>
        <text class="rec-val">{{ r.value }} cm</text>
        <text class="a-del" @click="del(r.id)">删除</text>
      </view>
    </view>

    <view v-if="showAdd" class="card add-card">
      <text class="sec-title">新增身高记录</text>
      <input class="add-input" :value="newDate" @input="(e:any)=>newDate=e.detail?.value??e.target?.value" placeholder="日期" />
      <input class="add-input" :value="String(newValue)" @input="(e:any)=>newValue=Number(e.detail?.value??e.target?.value)||0" type="number" placeholder="身高(cm)" style="margin-top:8px;" />
      <view class="add-btns">
        <view class="btn-save" @click="add">保存</view>
        <view class="btn-cancel" @click="showAdd=false">取消</view>
      </view>
    </view>

    <view v-if="!showAdd" class="btn-add" @click="showAdd=true">+ 新增记录</view>
  </view>
</template>

<style scoped>
.page-container { min-height:100vh; padding:12px; box-sizing:border-box; }
.card { background:#FFFFFF; border-radius: 12px; padding: 20px; margin-bottom:10px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
.empty { text-align:center; padding:20px 0; color:#9CA3AF; font-size:13px; }
.rec-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #FAF5F0; font-size:14px; }
.rec-date { color:#6B7280; }
.rec-val { color:#1A1A2E; font-weight:600; }
.a-del { color:#F7685B; font-size:12px; }

.sec-title { font-size:14px; color:#1A1A2E; font-weight:600; display:block; margin-bottom:10px; }
.add-input { width:100%; padding: 20px; border:1px solid #E5E7EB; border-radius: 12px; font-size:14px; background:#F9FAFB; box-sizing:border-box; height:auto; min-height:24px; line-height:1.5; }
.add-btns { display:flex; gap:12px; margin-top:12px; }
.btn-save { flex:1; background:linear-gradient(135deg,#A0442C,#C75B39); color:#FFFFFF; text-align:center; padding:10px 0; border-radius: 12px; font-size:14px; font-weight:600; }
.btn-cancel { flex:1; background:#F0F2F5; color:#6B7280; text-align:center; padding:10px 0; border-radius: 12px; font-size:14px; }
.btn-add { background:linear-gradient(135deg,#A0442C,#C75B39); color:#FFFFFF; text-align:center; padding:13px 0; border-radius: 12px; font-size:15px; font-weight:600; margin-top:10px; }
</style>
