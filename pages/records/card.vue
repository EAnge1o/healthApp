<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiGetCardRecords, apiUpdateCard, apiDeleteCard } from '@/api/index';

const records = ref<any[]>([]);
const editingId = ref<number | null>(null);
const editResult = ref('');

onMounted(() => loadRecords());
async function loadRecords() { try { records.value = (await apiGetCardRecords(1, 100) as any).list; } catch {} }

function startEdit(r: any) { editingId.value=r.id; editResult.value=r.result||''; }
async function saveEdit(id: number) { await apiUpdateCard(id, editResult.value); editingId.value=null; uni.showToast({title:'已更新'}); loadRecords(); }
async function del(id: number) {
  const res: any = await new Promise(r => uni.showModal({ title:'确认删除', content:'删除后不可恢复', success: r }));
  if (!res.confirm) return;
  await apiDeleteCard(id); uni.showToast({title:'已删除'}); loadRecords();
}
</script>

<template>
  <view class="page-container">
    <view v-if="records.length===0" class="empty">暂无记卡记录</view>
    <view v-for="r in records" :key="r.id" class="card record-item">
      <view v-if="editingId!==r.id">
        <view class="rec-head">
          <text class="rec-tag">{{ r.type==='photo'?'📷 拍照':'📱 条形码' }}</text>
          <view class="rec-acts"><text class="a-edit" @click="startEdit(r)">编辑</text><text class="a-del" @click="del(r.id)">删除</text></view>
        </view>
        <text class="rec-sub">{{ r.created_at?.slice(0,16) }}</text>
        <text class="rec-body">{{ r.result }}</text>
      </view>
      <view v-else>
        <textarea class="eta" :value="editResult" @input="(e:any)=>editResult=e.detail?.value??e.target?.value" />
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
.rec-body { font-size: 13px; color: #8B7355; line-height: 1.5; display: block; margin-top: 4px; }
.ebtns { display: flex; gap: 12px; }
.eta { width: 100%; min-height: 50px; border: 1px solid #DCDCDC; border-radius: 12px; padding: 5px; font-size: 13px; box-sizing: border-box; }
</style>
