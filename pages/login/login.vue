<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/user';
import { apiLogin } from '@/api/index';
import { getBaseUrl, setBaseUrl } from '@/api/request';

const userStore = useUserStore();
const username = ref('');
const password = ref('');
const loading = ref(false);

const showServer = ref(false);
const serverUrl = ref(getBaseUrl());

function saveServer() {
  const url = serverUrl.value.trim().replace(/\/+$/, '');
  if (!url) {
    serverUrl.value = getBaseUrl();
    return;
  }
  setBaseUrl(url);
  serverUrl.value = url;
  uni.showToast({ title: '服务器地址已保存', icon: 'success', duration: 1500 });
}

async function handleLogin() {
  if (!username.value || !password.value) { uni.showToast({ title: '请输入用户名和密码', icon: 'none' }); return; }
  loading.value = true;
  try {
    const data: any = await apiLogin(username.value, password.value);
    userStore.setAuth(data.token, data.user);
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 500);
  } catch (err: any) { uni.showToast({ title: err.message, icon: 'none' }); }
  finally { loading.value = false; }
}
</script>

<template>
  <view class="page-container">
    <view class="hero-area">
      <text class="hero-icon">🌿</text>
      <text class="hero-title">健康管理</text>
      <text class="hero-desc">记录每一刻，关爱每一天</text>
    </view>

    <view class="form-card">
      <input class="input-line" :value="username" @input="(e:any)=>username=e.detail?.value??e.target?.value" placeholder="用户名" />
      <input class="input-line" :value="password" @input="(e:any)=>password=e.detail?.value??e.target?.value" type="password" placeholder="密码" />

      <view class="btn-login" :class="{ disabled: loading }" @click="handleLogin">
        {{ loading ? '登录中...' : '登 录' }}
      </view>

      <!-- 服务器地址 -->
      <view class="server-toggle" @click="showServer = !showServer">
        <text>⚙ 服务器设置</text>
        <text class="toggle-arrow">{{ showServer ? '▲' : '▼' }}</text>
      </view>
      <view v-if="showServer" class="server-section">
        <input
          class="server-input"
          :value="serverUrl"
          @input="(e:any) => serverUrl = e.detail?.value ?? e.target?.value"
          placeholder="http://localhost:3000/api"
        />
        <view class="server-save" @click="saveServer">保存</view>
      </view>
    </view>

    <view class="footer-link">
      <text>还没有账号？</text>
      <text class="link" @click="uni.navigateTo({ url: '/pages/register/register' })">立即注册</text>
    </view>
  </view>
</template>

<style scoped>
.page-container { min-height: 100vh; padding: 24px; box-sizing: border-box; background: #FAF5F0; display: flex; flex-direction: column; }
.hero-area { display: flex; flex-direction: column; align-items: center; margin: 60px 0 40px; }
.hero-icon { font-size: 56px; }
.hero-title { font-size: 28px; font-weight: 700; font-family: Georgia, serif; color: #2C1810; margin-top: 16px; letter-spacing: .04em; }
.hero-desc { font-size: 14px; color: #8B7355; margin-top: 8px; }

.form-card { background: #FFFBF7; border-radius: 22px; padding: 36px 24px; box-shadow: 0 2px 12px rgba(199,91,57,.06); border: 1px solid rgba(199,91,57,.04); }
.input-line { width: 100%; padding: 14px 0; border: none; border-bottom: 1.5px solid rgba(139,115,85,.2); font-size: 16px; background: transparent; color: #2C1810; margin-bottom: 8px; transition: border-color .2s; height: auto; min-height: 24px; line-height: 1.5; }
.input-line:focus { border-bottom-color: #C75B39; outline: none; }
.input-line::placeholder { color: rgba(139,115,85,.5); }

.btn-login { background: linear-gradient(135deg, #C75B39, #A0442C); color: #fff; border-radius: 14px; padding: 16px 0; font-size: 17px; font-weight: 600; text-align: center; margin-top: 32px; transition: all .2s; letter-spacing: .06em; }
.btn-login:active { transform: scale(.97); }
.btn-login.disabled { opacity: .5; pointer-events: none; }

.server-toggle { display: flex; justify-content: center; align-items: center; gap: 4px; margin-top: 20px; padding: 8px 0; font-size: 13px; color: rgba(139,115,85,.6); }
.server-toggle:active { opacity: .7; }
.toggle-arrow { font-size: 10px; }

.server-section { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
.server-input { flex: 1; padding: 8px 12px; border: 1px solid rgba(199,91,57,.15); border-radius: 8px; font-size: 13px; color: #2C1810; background: rgba(199,91,57,.03); height: auto; min-height: 24px; }
.server-input::placeholder { color: rgba(139,115,85,.4); font-size: 12px; }
.server-save { padding: 6px 14px; background: linear-gradient(135deg, #C75B39, #A0442C); color: #fff; border-radius: 8px; font-size: 12px; font-weight: 500; white-space: nowrap; }
.server-save:active { transform: scale(.95); }

.footer-link { text-align: center; margin-top: 36px; font-size: 14px; color: #8B7355; }
.link { color: #C75B39; margin-left: 6px; font-weight: 600; }
</style>
