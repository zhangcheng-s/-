<template>
  <header class="app-header">
    <div class="top-bar">
      <!-- 海洋波浪背景 -->
      <div class="ocean-waves">
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
      </div>
      
      <div class="brand">
        <img src="@/assets/images/logo7.png" alt="logo" class="logo" />
      </div>
      
      <!-- 深海风格用户信息 -->
      <div class="user-panel">
        <span class="user-label">用户</span>
        <span class="username">{{ username }}</span>
        <span class="divider">|</span>
        <span class="logout-btn" @click="emit('logout')">退出</span>
      </div>
    </div>

    <nav class="nav">
      <ul>
        <router-link to="/home" v-slot="{ isActive, href }">
          <li :class="{ active: isActive }">
            <a :href="href">首页</a>
          </li>
        </router-link>
        <router-link to="/management" v-slot="{ isActive, href }">
          <li :class="{ active: isActive }">
            <a :href="href">数据管理</a>
          </li>
        </router-link>
        <router-link to="/voyagesearch" v-slot="{ isActive, href }">
          <li :class="{ active: isActive }">
            <a :href="href">航次轨迹查询</a>
          </li>
        </router-link>
        <router-link to="/chemsearch" v-slot="{ isActive, href }">
          <li :class="{ active: isActive }">
            <a :href="href">化学数据查询</a>
          </li>
        </router-link>
        <router-link to="/biosearch" v-slot="{ isActive, href }">
          <li :class="{ active: isActive }">
            <a :href="href">生物数据查询</a>
          </li>
        </router-link>
        <router-link to="/analysis" v-slot="{ isActive, href }">
          <li :class="{ active: isActive }">
            <a :href="href">生物数据统计</a>
          </li>
        </router-link>
        <router-link to="/export" v-slot="{ isActive, href }">
          <li :class="{ active: isActive }">
            <a :href="href">专题数据导出</a>
          </li>
        </router-link>
        <router-link to="/about" v-slot="{ isActive, href }">
          <li :class="{ active: isActive }">
            <a :href="href">关于我们</a>
          </li>
        </router-link>
      </ul>
    </nav>
  </header>
</template>

<script setup>
const { username } = defineProps({
  username: {
    type: String,
    default: 'admin'
  }
})
const emit = defineEmits(['logout'])
</script>

<style scoped>
.app-header {
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.top-bar {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 60px;
  background: #ffffff;
  overflow: hidden;
}

/* ========== 海洋波浪动画 ========== */
.ocean-waves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background-repeat: repeat-x;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.wave1 {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 133, 202, 0.03) 25%, 
    rgba(0, 133, 202, 0.05) 50%, 
    rgba(0, 133, 202, 0.03) 75%, 
    transparent 100%);
  animation: wave-animation 15s linear infinite;
  opacity: 0.4;
}

.wave2 {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 100, 148, 0.04) 25%, 
    rgba(0, 100, 148, 0.06) 50%, 
    rgba(0, 100, 148, 0.04) 75%, 
    transparent 100%);
  animation: wave-animation 20s linear infinite reverse;
  opacity: 0.3;
}

.wave3 {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 64, 152, 0.02) 25%, 
    rgba(0, 64, 152, 0.04) 50%, 
    rgba(0, 64, 152, 0.02) 75%, 
    transparent 100%);
  animation: wave-animation 25s linear infinite;
  opacity: 0.5;
}

@keyframes wave-animation {
  0% {
    transform: translateX(0) translateZ(0) scaleY(1);
  }
  50% {
    transform: translateX(-25%) translateZ(0) scaleY(0.95);
  }
  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.logo {
  height: 64px;
}

.titles h1 {
  margin: 0;
  font-size: 26px;
  color: #004098;
  font-weight: 700;
  letter-spacing: 1px;
}

.titles p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #6B8CB8;
  letter-spacing: 0.5px;
}

/* ========== 深海风格用户面板 ========== */
.user-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #003d5c 0%, #006494 50%, #0085ca 100%);
  border-radius: 25px;
  font-size: 15px;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 61, 92, 0.3);
  position: relative;
  z-index: 1;
}

.user-label {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
}

.username {
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.divider {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.3);
}

.logout-btn {
  color: #ffffff;
  cursor: pointer;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* ========== 导航栏 ========== */
.nav {
  background: linear-gradient(90deg, #00284d 0%, #0085ca 100%);
  box-shadow: 0 4px 20px rgba(0, 40, 77, 0.18);
  padding-left: 140px;
}

.nav ul {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav li {
  padding: 0 38px;
  line-height: 52px;
  transition: all 0.3s ease;
  position: relative;
}

.nav a {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  text-decoration: none;
  font-weight: 500;
  letter-spacing: 0.4px;
}

.nav li:hover {
  background: rgba(255, 255, 255, 0.14);
}

.nav li:hover a {
  color: #fff;
}

.nav li.active {
  background: rgba(0, 0, 0, 0.12);
}

.nav li.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 -2px 10px rgba(79, 172, 254, 0.5);
}
</style>


