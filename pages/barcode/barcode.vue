<script setup lang="ts">
import { ref } from 'vue';
import { apiBarcodeCard, apiGetCardRecords, apiUpdateCard, apiDeleteCard } from '@/api/index';

const barcode = ref('');
const recognized = ref('');
const loading = ref(false);
const tabIndex = ref(0);
const records = ref<any[]>([]);
const editingId = ref<number | null>(null);
const editResult = ref('');

async function submitBarcode() {
  if (!barcode.value) {
    uni.showToast({ title: '请输入条形码编号', icon: 'none' });
    return;
  }
  loading.value = true;
  try {
    const data: any = await apiBarcodeCard(barcode.value);
    recognized.value = data.recognized;
    uni.showToast({ title: '记卡成功', icon: 'success' });
  } catch (err: any) {
    uni.showToast({ title: err.message, icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function loadRecords() {
  try {
    const data: any = await apiGetCardRecords();
    records.value = data.list;
  } catch {}
}

function startEdit(r: any) { editingId.value = r.id; editResult.value = r.result || ''; }
async function saveEdit(id: number) { await apiUpdateCard(id, editResult.value); editingId.value = null; uni.showToast({title:'已更新'}); loadRecords(); }
async function delCard(id: number) {
  const res: any = await new Promise(r => uni.showModal({ title:'确认删除', content:'删除后不可恢复', success: r }));
  if (!res.confirm) return;
  await apiDeleteCard(id); uni.showToast({title:'已删除'}); loadRecords();
}
</script>

<template>
  <view class="page-container">
    <view class="tabs">
      <view class="tab" :class="{ active: tabIndex === 0 }" @click="tabIndex = 0">条形码记卡</view>
      <view class="tab" :class="{ active: tabIndex === 1 }" @click="tabIndex = 1; loadRecords()">记卡记录</view>
    </view>

    <view v-if="tabIndex === 0">
      <view class="card">
        <text class="hint-text">输入商品条形码编号，系统将从全球食品数据库中查询商品信息。</text>
        <view class="input-row">
          <input
            class="barcode-input"
            :value="barcode"
            @input="(e: any) => barcode = e.detail?.value ?? e.target?.value ?? ''"
            type="text"
            inputmode="numeric"
            placeholder="请输入条形码编号"
          />
        </view>
        <view
          class="btn-primary"
          :class="{ 'btn-disabled': loading || !barcode }"
          @click="submitBarcode"
        >
          {{ loading ? '查询中...' : '查询商品信息' }}
        </view>
      </view>

      <!-- 查询结果 -->
      <view v-if="recognized" class="card result-card">
        <text class="result-label">查询结果</text>
        <text class="result-content">{{ recognized }}</text>
      </view>
    </view>

    <!-- 记卡记录 -->
    <view v-if="tabIndex === 1">
      <view v-if="records.length === 0" class="empty">暂无记卡记录</view>
      <view v-for="r in records" :key="r.id" class="card record-item">
        <view v-if="editingId !== r.id">
          <view class="record-type">
            <text>{{ r.type === 'photo' ? '📷 拍照' : '📱 条形码' }}</text>
            <text class="record-time">{{ r.created_at?.slice(0, 10) }}</text>
          </view>
          <text class="record-result">{{ r.result }}</text>
          <view class="rec-acts"><text class="a-edit" @click="startEdit(r)">编辑</text><text class="a-del" @click="delCard(r.id)">删除</text></view>
        </view>
        <view v-else>
          <textarea class="e-textarea" :value="editResult" @input="(e:any)=>editResult=e.detail?.value??e.target?.value" />
          <view class="edit-btns"><text class="a-save" @click="saveEdit(r.id)">保存</text><text class="a-cancel" @click="editingId=null">取消</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 12px;
  box-sizing: border-box;
}
.card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
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

.hint-text {
  font-size: 13px;
  color: rgba(139,115,85,.6);
  display: block;
  margin-bottom: 12px;
  line-height: 1.6;
}

.input-row { margin-bottom: 12px; }
.barcode-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #EEEEEE;
  border-radius: 12px;
  font-size: 14px;
  background: #FFFFFF;
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  line-height: 1.5;
  text-align: center;
  letter-spacing: 2px;
}

.btn-primary {
  background: linear-gradient(135deg, #A0442C, #C75B39);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 16px;
  text-align: center;
}
.btn-disabled { opacity: 0.5; pointer-events: none; }

.result-card { margin-top: 12px; }
.result-label { font-size: 14px; color: #C75B39; font-weight: bold; display: block; margin-bottom: 6px; }
.result-content { font-size: 14px; color: #2C1810; line-height: 1.6; white-space: pre-wrap; }

.record-item { padding: 20px; }
.record-type { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
.record-time { color: rgba(139,115,85,.6); }
.record-result { font-size: 13px; color: #8B7355; }

.empty { text-align: center; padding: 40px 0; color: rgba(139,115,85,.6); font-size: 14px; }

.rec-acts { display: flex; gap: 10px; margin-top: 5px; }
.a-edit { font-size: 12px; color: #C75B39; }
.a-del { font-size: 12px; color: #FA5151; }
.a-save { font-size: 12px; color: #C75B39; font-weight: bold; }
.a-cancel { font-size: 12px; color: rgba(139,115,85,.6); }
.edit-btns { display: flex; gap: 12px; margin-top: 5px; }
.e-textarea { width: 100%; min-height: 50px; border: 1px solid #DCDCDC; border-radius: 12px; padding: 5px; font-size: 13px; box-sizing: border-box; }
</style>
