<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiGetSportRecords, apiUpdateSport, apiDeleteSport } from '@/api/index';

const records = ref<any[]>([]);
const editingId = ref<number | null>(null);
const editMode = ref('跑步');
const editDuration = ref(0);
const editDistance = ref(0);

onMounted(() => loadRecords());
async function loadRecords() { try { records.value = (await apiGetSportRecords(1, 100) as any).list; } catch {} }

function startEdit(r: any) { editingId.value = r.id; editMode.value = r.mode||'跑步'; editDuration.value = Math.floor((r.duration||0)/60); editDistance.value = Math.round((r.distance||0)/100)/10; }
async function saveEdit(id: number) { await apiUpdateSport(id, editMode.value, editDuration.value*60, editDistance.value*1000); editingId.value=null; uni.showToast({title:'已更新'}); loadRecords(); }
async function del(id: number) {
  const res: any = await new Promise(r => uni.showModal({ title:'确认删除', content:'删除后不可恢复', success: r }));
  if (!res.confirm) return;
  await apiDeleteSport(id); uni.showToast({title:'已删除'}); loadRecords();
}
</script>

<template>
  <view class="page-container">
    <view v-if="records.length===0" class="empty">暂无运动记录</view>
    <view v-for="r in records" :key="r.id" class="card record-item">
      <view v-if="editingId!==r.id">
        <view class="rec-head">
          <text class="rec-tag">{{ r.mode||'跑步' }}</text>
          <view class="rec-acts"><text class="a-edit" @click="startEdit(r)">编辑</text><text class="a-del" @click="del(r.id)">删除</text></view>
        </view>
        <text class="rec-sub">{{ r.start_time?.slice(0,16) }} · {{ Math.floor(r.duration/60) }}分 · {{ (r.distance/1000).toFixed(2) }}km</text>
      </view>
      <view v-else>
        <view class="erow">
          <input class="ein small" :value="editMode" @input="(e:any)=>editMode=e.detail?.value??e.target?.value" />
          <input class="ein small" :value="String(editDuration)" @input="(e:any)=>editDuration=Number(e.detail?.value??e.target?.value)||0" type="number" />分
          <input class="ein small" :value="String(editDistance)" @input="(e:any)=>editDistance=Number(e.detail?.value??e.target?.value)||0" type="number" />km
        </view>
        <view class="ebtns"><text class="a-save" @click="saveEdit(r.id)">保存</text><text class="a-cancel" @click="editingId=null">取消</text></view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page-container { min-height: 100vh; padding: 12px; box-sizing: border-box; }
.card { background: #FFFFFF; border-radius: 12px; padding: 20px; margin-bottom: 8px; }
.empty { text-align: center; padding: 40px 0; color: rgba(139,115,85,.6); font-size: 14px; }
.rec-head { display: flex; justify-content: space-between; align-items: center; }
.rec-tag { font-size: 15px; font-weight: bold; color: #C75B39; }
.rec-acts { display: flex; gap: 10px; }
.a-edit { font-size: 12px; color: #C75B39; }
.a-del { font-size: 12px; color: #FA5151; }
.a-save { font-size: 12px; color: #C75B39; font-weight: bold; }
.a-cancel { font-size: 12px; color: rgba(139,115,85,.6); }
.rec-sub { font-size: 12px; color: rgba(139,115,85,.6); display: block; margin-top: 3px; }
.erow { display: flex; align-items: center; gap: 4px; font-size: 13px; margin-bottom: 5px; }
.ebtns { display: flex; gap: 12px; }
.ein { border: 1px solid #DCDCDC; border-radius: 12px; padding: 20px; font-size: 12px; height: auto; min-height: 24px; }
.ein.small { width: 45px; text-align: center; }
</style>
