<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiGetArticles, apiCreateArticle, apiDeleteArticle } from '@/api/index';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const articles = ref<any[]>([]);
const showEditor = ref(false);
const title = ref('');
const content = ref('');
const submitting = ref(false);

onMounted(() => loadArticles());

function onTitleInput(e: any) {
  title.value = e.detail?.value ?? e.target?.value ?? '';
}
function onContentInput(e: any) {
  content.value = e.detail?.value ?? e.target?.value ?? '';
}

async function loadArticles() {
  try {
    const data: any = await apiGetArticles();
    articles.value = data.list;
  } catch {}
}

async function submitArticle() {
  if (!title.value || !content.value) {
    uni.showToast({ title: '标题和内容不能为空', icon: 'none' });
    return;
  }
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' });
    return;
  }
  submitting.value = true;
  try {
    await apiCreateArticle(title.value, content.value);
    uni.showToast({ title: '发布成功', icon: 'success' });
    title.value = '';
    content.value = '';
    showEditor.value = false;
    loadArticles();
  } catch (err: any) {
    uni.showToast({ title: err.message, icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id: number) {
  uni.showModal({
    title: '提示',
    content: '确定要删除这篇文章吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await apiDeleteArticle(id);
          uni.showToast({ title: '已删除', icon: 'success' });
          loadArticles();
        } catch (err: any) {
          uni.showToast({ title: err.message, icon: 'none' });
        }
      }
    },
  });
}
</script>

<template>
  <view class="page-container">
    <view v-if="userStore.isLoggedIn" class="card new-btn" @click="showEditor = !showEditor">
      <text>✏️ {{ showEditor ? '收起编辑' : '发布健康资讯' }}</text>
    </view>

    <!-- 编辑器 -->
    <view v-if="showEditor" class="card editor">
      <input class="input-field" :value="title" @input="onTitleInput" placeholder="文章标题" />
      <textarea
        class="textarea-field"
        :value="content"
        @input="onContentInput"
        placeholder="在这里写文章内容..."
        style="margin-top: 8px;"
      />
      <view class="btn-primary" :class="{ 'btn-disabled': submitting }" @click="submitArticle" style="margin-top: 12px;">
        {{ submitting ? '发布中...' : '发布' }}
      </view>
    </view>

    <!-- 文章列表 -->
    <view v-if="articles.length === 0" class="empty">
      <text>暂无健康资讯</text>
    </view>
    <view v-for="a in articles" :key="a.id" class="card article-item">
      <view class="article-header">
        <text class="article-title">{{ a.title }}</text>
        <text v-if="userStore.user?.id === a.user_id || userStore.user?.nickname === a.author"
              class="delete-btn" @click="handleDelete(a.id)">删除</text>
      </view>
      <text class="article-meta">{{ a.author }} · {{ a.created_at?.slice(0, 10) }}</text>
      <text class="article-content">{{ a.content?.slice(0, 200) }}{{ a.content?.length > 200 ? '...' : '' }}</text>
    </view>
  </view>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 12px;
  box-sizing: border-box;
}
.new-btn {
  text-align: center;
  color: #C75B39;
  font-size: 15px;
  padding: 14px;
}

.card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.editor { margin-bottom: 12px; }

.input-field {
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
}

.textarea-field {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #EEEEEE;
  border-radius: 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-primary {
  background-color: #C75B39;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 16px;
  text-align: center;
}
.btn-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.article-item { padding: 20px; }
.article-header { display: flex; justify-content: space-between; align-items: center; }
.article-title { font-size: 16px; color: #2C1810; font-weight: bold; flex: 1; }
.delete-btn { font-size: 12px; color: #FA5151; padding: 20px; }
.article-meta { font-size: 12px; color: rgba(139,115,85,.6); display: block; margin-top: 4px; }
.article-content { font-size: 14px; color: #8B7355; line-height: 1.6; display: block; margin-top: 6px; }

.empty { text-align: center; padding: 40px 0; color: rgba(139,115,85,.6); font-size: 14px; }
</style>
