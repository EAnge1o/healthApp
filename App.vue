<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('App Launch');
});

onShow(() => {
  console.log('App Show');
});

onHide(() => {
  console.log('App Hide');
});
</script>

<style>
/* 全局公共样式 */
page {
  background-color: #FAF5F0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: #1D1D1F;
  -webkit-font-smoothing: antialiased;
}

/* 重置默认样式 */
view, text, image, scroll-view, input, button {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 安全区域适配 */
page {
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
}
</style>
