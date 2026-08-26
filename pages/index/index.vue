<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { apiGetSportStats, apiGetGoals, apiCreateGoal, apiDeleteGoal, apiCheckin } from '@/api/index';

const userStore = useUserStore();
const stats = ref({ total_times: 0, total_duration: 0, total_distance: 0, total_days: 0 });
const goals = ref<any[]>([]);
const checkins = ref<any[]>([]);
const streaks = ref<Record<string,number>>({});
const showAddGoal = ref(false);
const newGoalType = ref('sport');
const newGoalTarget = ref(30);

const goalLabels: Record<string, string> = { sport: '🏃 运动', water: '💧 饮水', diet: '🍎 饮食' };
const goalUnits: Record<string, string> = { sport: '分钟', water: '杯', diet: '次' };

onMounted(async () => {
  if (!userStore.isLoggedIn) { uni.navigateTo({ url: '/pages/login/login' }); return; }
  try { stats.value = await apiGetSportStats() as any; } catch {}
  loadGoals();
});

async function loadGoals() {
  try { const d: any = await apiGetGoals(); goals.value = d.goals; checkins.value = d.checkins; streaks.value = d.streaks; } catch {}
}
async function addGoal() { await apiCreateGoal(newGoalType.value, newGoalTarget.value); showAddGoal.value = false; loadGoals(); }
async function toggleCheckin(goalId: number) { await apiCheckin(goalId); loadGoals(); }
async function removeGoal(id: number) { await apiDeleteGoal(id); loadGoals(); }

const actions = [
  { icon: '🏃', text: '运动', url: '/pages/sport/sport', tab: true },
  { icon: '📷', text: '拍照记卡', url: '/pages/camera/camera', tab: true},
  { icon: '📱', text: '条形码记卡', url: '/pages/barcode/barcode', tab: false },
  { icon: '🤖', text: 'AI 分析', url: '/pages/analysis/analysis', tab: true },
  { icon: '📰', text: '健康资讯', url: '/pages/article/article', tab: true },
];
function goAction(item: typeof actions[0]) {
  if (item.tab) uni.switchTab({ url: item.url });
  else uni.navigateTo({ url: item.url });
}
</script>

<template>
  <view class="page-container">
    <view class="hero-card">
      <view class="hero-circle"></view>
      <view class="hero-circle-sm"></view>
      <view class="hero-content">
        <text class="hero-greeting">{{ userStore.user?.nickname || '用户' }}，下午好</text>
        <text class="hero-subtitle">每一次记录，都是对自己的温柔关照</text>
      </view>
    </view>

    <view class="data-row">
      <view class="data-item" v-for="d in [
        {n:stats.total_times,l:'运动次数'},
        {n:Math.floor(stats.total_duration/60),l:'运动分钟'},
        {n:(stats.total_distance/1000).toFixed(1),l:'运动公里'},
        {n:stats.total_days,l:'活跃天数'}
      ]" :key="d.l">
        <text class="data-num">{{ d.n }}</text>
        <text class="data-label">{{ d.l }}</text>
      </view>
    </view>

    <view class="quick-row">
      <view v-for="a in actions" :key="a.text" class="quick-item" @click="goAction(a)">
        <text class="quick-icon">{{ a.icon }}</text>
        <text class="quick-text">{{ a.text }}</text>
      </view>
    </view>

    <view class="card goal-section">
      <view class="goal-header">
        <text class="goal-title">🎯 每日打卡</text>
        <text class="add-btn" @click="showAddGoal=!showAddGoal">{{ showAddGoal ? '−' : '+' }}</text>
      </view>
      <view v-if="showAddGoal" style="margin-bottom:16px">
        <view class="type-row">
          <view v-for="t in ['sport','water','diet']" :key="t" class="type-chip" :class="{ active: newGoalType===t }" @click="newGoalType=t">{{ goalLabels[t] }}</view>
        </view>
        <view class="target-row">
          <text>每天</text>
          <input class="target-input" :value="String(newGoalTarget)" @input="(e:any)=>newGoalTarget=Number(e.detail?.value??e.target?.value)||0" type="number" />
          <text>{{ goalUnits[newGoalType] }}</text>
          <view class="confirm-btn" @click="addGoal">✓</view>
        </view>
      </view>
      <view v-if="goals.length>0">
        <view v-for="g in goals" :key="g.id" class="goal-row" @longpress="removeGoal(g.id)">
          <text class="goal-type">{{ goalLabels[g.type] }}</text>
          <text class="goal-target">/ 每天{{ g.target_value }}{{ goalUnits[g.type] }}</text>
          <text v-if="streaks[g.id]" class="goal-streak">🔥{{ streaks[g.id] }}</text>
          <view class="check-btn" :class="{ checked: checkins.some((c:any)=>c.goal_id===g.id) }" @click="toggleCheckin(g.id)">
            {{ checkins.some((c:any)=>c.goal_id===g.id) ? '✓' : '打卡' }}
          </view>
        </view>
      </view>
      <view v-else class="goal-empty">点击 + 设定每日目标</view>
    </view>

    <view class="quote-card">
      <text class="quote-mark">"</text>
      <text class="quote-text">每天运动 30 分钟，健康生活一辈子</text>
    </view>
  </view>
</template>

<style scoped>
.page-container { min-height: 100vh; padding: 16px; padding-bottom: 70px; box-sizing: border-box; background: #FAF5F0; }

.hero-card { background: linear-gradient(135deg, #C75B39 0%, #A0442C 100%); border-radius: 24px; padding: 40px 28px; margin-bottom: 20px; color: #fff; position: relative; overflow: hidden; }
.hero-circle { position: absolute; top: -30px; right: -20px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,.07); }
.hero-circle-sm { position: absolute; bottom: -15px; left: -15px; width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,.05); }
.hero-content { position: relative; z-index: 1; }
.hero-greeting { font-size: 28px; font-weight: 700; font-family: Georgia, serif; display: block; letter-spacing: .02em; }
.hero-subtitle { font-size: 15px; opacity: .8; margin-top: 8px; display: block; font-weight: 400; }

.data-row { display: grid; grid-template-columns: repeat(4,1fr); background: #FFFBF7; border-radius: 22px; padding: 24px 8px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(199,91,57,.06); border: 1px solid rgba(199,91,57,.04); text-align: center; }
.data-item { display: flex; flex-direction: column; }
.data-num { font-size: 26px; font-weight: 700; color: #C75B39; font-family: Georgia, serif; }
.data-label { font-size: 11px; color: #8B7355; margin-top: 4px; }

.quick-row { display: grid; grid-template-columns: repeat(5,1fr); gap: 8px; margin-bottom: 20px; }
.quick-item { background: #FFFBF7; border-radius: 16px; padding: 18px 4px; text-align: center; box-shadow: 0 1px 8px rgba(199,91,57,.05); border: 1px solid rgba(199,91,57,.03); transition: transform .2s; }
.quick-item:active { transform: scale(.96); }
.quick-icon { font-size: 26px; display: block; }
.quick-text { font-size: 11px; color: #8B7355; margin-top: 6px; display: block; }

.card { background: #FFFBF7; border-radius: 22px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(199,91,57,.06); border: 1px solid rgba(199,91,57,.04); }
.goal-title { font-size: 18px; font-weight: 700; font-family: Georgia,serif; color: #2C1810; }
.goal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.add-btn { width: 28px; height: 28px; border-radius: 50%; background: #C75B39; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 300; }
.type-row { display: flex; gap: 8px; margin-bottom: 12px; }
.type-chip { padding: 6px 16px; border-radius: 20px; font-size: 13px; background: rgba(199,91,57,.06); color: #8B7355; }
.type-chip.active { background: #C75B39; color: #fff; }
.target-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #8B7355; }
.target-input { width: 50px; text-align: center; border: 1.5px solid rgba(199,91,57,.2); border-radius: 6px; padding: 4px 8px; font-size: 14px; height: auto; min-height: 28px; background: #FFFBF7; }
.confirm-btn { background: #C75B39; color: #fff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-left: auto; }
.goal-row { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(199,91,57,.06); gap: 10px; }
.goal-type { font-size: 15px; color: #2C1810; }
.goal-target { font-size: 13px; color: #8B7355; flex: 1; }
.goal-streak { font-size: 12px; color: #E8A838; }
.check-btn { padding: 5px 14px; border-radius: 14px; border: 1.5px solid #C75B39; color: #C75B39; font-size: 13px; }
.check-btn.checked { background: #C75B39; color: #fff; }
.goal-empty { text-align: center; color: #8B7355; font-size: 14px; padding: 12px 0; }

.quote-card { text-align: center; padding: 28px 20px; }
.quote-mark { font-size: 48px; color: rgba(199,91,57,.15); font-family: Georgia,serif; display: block; line-height: 1; }
.quote-text { font-size: 15px; color: #8B7355; font-style: italic; margin-top: 8px; display: block; }
</style>
