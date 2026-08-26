import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync('token') || '');
  const user = ref<any>(uni.getStorageSync('user') || null);

  const isLoggedIn = computed(() => !!token.value);

  function setAuth(t: string, u: any) {
    token.value = t;
    user.value = u;
    uni.setStorageSync('token', t);
    uni.setStorageSync('user', u);
  }

  function logout() {
    token.value = '';
    user.value = null;
    uni.removeStorageSync('token');
    uni.removeStorageSync('user');
  }

  function updateUser(u: any) {
    user.value = { ...user.value, ...u };
    uni.setStorageSync('user', user.value);
  }

  return { token, user, isLoggedIn, setAuth, logout, updateUser };
});
