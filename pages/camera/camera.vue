<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/user';
import { uploadPhotoCard, apiGetCardRecords, apiUpdateCard, apiDeleteCard } from '@/api/index';
import { getBaseUrl } from '@/api/request'

const userStore = useUserStore();
const imagePath = ref('');
const recognized = ref('');
const loading = ref(false);
const tabIndex = ref(0);
const records = ref<any[]>([]);
const editingId = ref<number | null>(null);
const editResult = ref('');

function takePhoto() {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera', 'album'],
    success: (res: any) => {
      imagePath.value = res.tempFilePaths[0];
      recognized.value = '';
    },
  });
}

async function submitPhoto() {
  if (!imagePath.value) {
    uni.showToast({ title: '请先拍照或选择图片', icon: 'none' });
    return;
  }
  loading.value = true;
  try {
    const data: any = await uploadPhotoCard(imagePath.value);
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
    const data: any = await apiGetCardRecords(1, 100);
    records.value = (data.list || []).filter((r: any) => r.type === 'photo');
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
      <view class="tab" :class="{ active: tabIndex === 0 }" @click="tabIndex = 0">拍照记卡</view>
      <view class="tab" :class="{ active: tabIndex === 1 }" @click="tabIndex = 1; loadRecords()">历史记录</view>
    </view>

    <!-- 拍照面板 -->
    <view v-if="tabIndex === 0">
      <view class="card">
        <text class="page-desc">
          拍摄食物或健康相关对象，系统将调用 AI 识别并自动生成饮食/健康记录。
        </text>
      </view>

      <view class="card preview-area">
        <image v-if="imagePath" :src="imagePath" mode="aspectFit" class="preview-img" />
        <view v-else class="placeholder">
          <text class="placeholder-icon">📸</text>
          <text class="placeholder-text">点击下方按钮拍照</text>
        </view>
      </view>

      <view v-if="recognized" class="card result-card">
        <text class="result-label">识别结果</text>
        <text class="result-content">{{ recognized }}</text>
      </view>

      <view class="action-btns">
        <view class="btn-photo" @click="takePhoto">📷 {{ imagePath ? '重新拍照' : '拍照' }}</view>
        <view v-if="imagePath" class="btn-primary" :class="{ 'btn-disabled': loading }" @click="submitPhoto">
          {{ loading ? '识别中...' : '提交识别' }}
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view v-if="tabIndex === 1">
      <view v-if="records.length === 0" class="empty">暂无拍照记录</view>
      <view v-for="r in records" :key="r.id" class="card history-item">
        <view v-if="editingId !== r.id">
          <view class="history-row">
            <image v-if="r.image_url" :src="`${getBaseUrl().replace('/api','')}${r.image_url}`" mode="aspectFill" class="history-img" />
            <view v-else class="history-no-img">📷</view>
            <view class="history-info">
              <text class="history-time">{{ r.created_at?.slice(0, 16) }}</text>
              <text class="history-result">{{ r.result }}</text>
            </view>
          </view>
          <view class="hist-acts"><text class="a-edit" @click="startEdit(r)">编辑</text><text class="a-del" @click="delCard(r.id)">删除</text></view>
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

.page-desc { font-size: 13px; color: #8B7355; line-height: 1.6; }

.preview-area {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-img { width: 100%; max-height: 250px; border-radius: 12px; }
.placeholder { text-align: center; }
.placeholder-icon { font-size: 50px; }
.placeholder-text { display: block; font-size: 14px; color: rgba(139,115,85,.6); margin-top: 8px; }

.result-card { margin-top: 12px; }
.result-label { font-size: 14px; color: #C75B39; font-weight: bold; display: block; margin-bottom: 6px; }
.result-content { font-size: 14px; color: #2C1810; line-height: 1.6; white-space: pre-wrap; }

.btn-primary {
  background: linear-gradient(135deg, #A0442C, #C75B39);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 13px 0;
  font-size: 15px;
  text-align: center;
  font-weight: 600;
}
.btn-disabled { opacity: 0.5; pointer-events: none; }

.action-btns { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
.btn-photo {
  background: #FFFFFF;
  border: 1px dashed #C75B39;
  color: #C75B39;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 16px;
  text-align: center;
}

/* 历史记录 */
.empty { text-align: center; padding: 40px 0; color: rgba(139,115,85,.6); font-size: 14px; }

.history-item { padding: 20px; }
.history-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.history-img {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  flex-shrink: 0;
  background: #FAF5F0;
}
.history-no-img {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  flex-shrink: 0;
  background: #FAF5F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.history-time {
  font-size: 12px;
  color: rgba(139,115,85,.6);
  margin-bottom: 4px;
}
.history-result {
  font-size: 13px;
  color: #2C1810;
  line-height: 1.5;
  white-space: pre-wrap;
}

.hist-acts { display: flex; gap: 10px; margin-top: 6px; }
.a-edit { font-size: 12px; color: #C75B39; }
.a-del { font-size: 12px; color: #FA5151; }
.a-save { font-size: 12px; color: #C75B39; font-weight: bold; }
.a-cancel { font-size: 12px; color: rgba(139,115,85,.6); }
.edit-btns { display: flex; gap: 12px; margin-top: 5px; }
.e-textarea { width: 100%; min-height: 50px; border: 1px solid #DCDCDC; border-radius: 12px; padding: 5px; font-size: 13px; box-sizing: border-box; }
</style>
