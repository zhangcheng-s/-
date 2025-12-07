<template>
  <!-- 一级路由 -->
  <RouterView />
</template>

<script>
export default {
  name: 'App',
  created() {
    this.$router.replace('/home');  // 在应用启动时直接跳转到登录页面
  }
};
</script>

<style>
@import "@/assets/styles/common.css";
</style>

