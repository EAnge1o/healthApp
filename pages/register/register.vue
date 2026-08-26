<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/user';
import { apiRegister } from '@/api/index';

const userStore = useUserStore();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const nickname = ref('');
const loading = ref(false);

async function handleRegister() {
  if (!username.value || !password.value) { uni.showToast({ title: '请输入用户名和密码', icon: 'none' }); return; }
  if (password.value.length < 6) { uni.showToast({ title: '密码至少6位', icon: 'none' }); return; }
  if (password.value !== confirmPassword.value) { uni.showToast({ title: '两次密码不一致', icon: 'none' }); return; }
  loading.value = true;
  try {
    const data: any = await apiRegister(username.value, password.value, nickname.value);
    userStore.setAuth(data.token, data.user);
    uni.showToast({ title: '注册成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 500);
  } catch (err: any) { uni.showToast({ title: err.message, icon: 'none' }); }
  finally { loading.value = false; }
}
</script>

<template>
  <view class="page-container">
    <view class="hero-area">
      <text class="hero-icon">🌱</text>
      <text class="hero-title">创建账号</text>
    </view>

    <view class="form-card">
      <input class="input-line" :value="username" @input="(e:any)=>username=e.detail?.value??e.target?.value" placeholder="用户名" />
      <input class="input-line" :value="nickname" @input="(e:any)=>nickname=e.detail?.value??e.target?.value" placeholder="昵称（选填）" />
      <input class="input-line" :value="password" @input="(e:any)=>password=e.detail?.value??e.target?.value" type="password" placeholder="密码（至少6位）" />
      <input class="input-line" :value="confirmPassword" @input="(e:any)=>confirmPassword=e.detail?.value??e.target?.value" type="password" placeholder="确认密码" />

      <view class="btn-login" :class="{ disabled: loading }" @click="handleRegister">
        {{ loading ? '注册中...' : '注 册' }}
      </view>
    </view>

    <view class="footer-link">
      <text>已有账号？</text>
      <text class="link" @click="uni.navigateTo({ url: '/pages/login/login' })">去登录</text>
    </view>
  </view>
</template>

<style scoped>
.page-container { min-height: 100vh; padding: 24px; box-sizing: border-box; background: #FAF5F0; }
.hero-area { display: flex; flex-direction: column; align-items: center; margin: 50px 0 32px; }
.hero-icon { font-size: 48px; }
.hero-title { font-size: 24px; font-weight: 700; font-family: Georgia, serif; color: #2C1810; margin-top: 12px; letter-spacing: .04em; }

.form-card { background: #FFFBF7; border-radius: 22px; padding: 36px 24px; box-shadow: 0 2px 12px rgba(199,91,57,.06); border: 1px solid rgba(199,91,57,.04); }
.input-line { width: 100%; padding: 14px 0; border: none; border-bottom: 1.5px solid rgba(139,115,85,.2); font-size: 16px; background: transparent; color: #2C1810; margin-bottom: 8px; transition: border-color .2s; height: auto; min-height: 24px; line-height: 1.5; }
.input-line:focus { border-bottom-color: #C75B39; outline: none; }
.input-line::placeholder { color: rgba(139,115,85,.5); }

.btn-login { background: linear-gradient(135deg, #C75B39, #A0442C); color: #fff; border-radius: 14px; padding: 16px 0; font-size: 17px; font-weight: 600; text-align: center; margin-top: 32px; transition: all .2s; letter-spacing: .06em; }
.btn-login:active { transform: scale(.97); }
.btn-login.disabled { opacity: .5; pointer-events: none; }

.footer-link { text-align: center; margin-top: 36px; font-size: 14px; color: #8B7355; }
.link { color: #C75B39; margin-left: 6px; font-weight: 600; }
</style>
