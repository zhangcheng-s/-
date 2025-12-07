<template>
  <div class="app-wrapper">
    <AppNavbar :username="currentUsername" @logout="handleLogout" />
    
    <main class="main-content">
      <div class="app-body">
        
        <RouterView v-slot="{ Component }">
          <keep-alive include="Management">
            <component :is="Component" />
          </keep-alive>
        </RouterView>
        </div>
    </main>
  </div>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentUsername = ref('访客')

onMounted(() => {
 

  const userStr = sessionStorage.getItem('loggedInUser')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      // 获取用户名并赋值
      currentUsername.value = user.username || '用户'
    } catch (e) {
      console.error('没有该用户，请注册', e)
      currentUsername.value = '用户'
    }

    
  }else {
    // 如果没有登录信息，可能需要跳转回登录页
    router.push('/login') 
  }
})


const handleLogout = () => {
  // 1. 清除当前登录状态 (必须)
  sessionStorage.removeItem('loggedInUser')
  
  // 2. 【关键】不要清除 localStorage 中的 savedUsername 和 savedPassword
  // 只有当你希望退出时同时也“忘记密码”才执行下面这几行，否则请注释掉或删除
  // localStorage.removeItem('rememberMe') 
  // localStorage.removeItem('savedUsername')
  // localStorage.removeItem('savedPassword')

  // 3. 跳转回登录页
  router.push('/login')
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background: #f0f2f5;
}

.app-body {
  width: 100%;
  height: 100%;
}
</style>