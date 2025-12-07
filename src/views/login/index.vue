<template>
  <div class="login-container">
    <!-- 视频背景 -->
    <video 
      ref="videoRef"
      autoplay 
      loop 
      muted 
      playsinline
      preload="auto"
      class="video-background"
    >
      <source src="@/assets/video/background.mp4" type="video/mp4">
      您的浏览器不支持视频标签。
    </video>
    
    <!-- 背景遮罩 - 加深颜色 -->
    <div class="overlay"></div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 系统标题 -->
      <div class="system-title">
        <h1>深海矿区宏生物综合数据服务平台</h1>
        <p>Integrated data service platform for macrobiotics</p>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
        <h2 class="login-title">登 录</h2>

        <form @submit.prevent="handleLogin" class="login-form" autocomplete="off">
          <div class="form-group">
            <!-- 添加 autocomplete="new-password" 可以更强力地阻止自动填充 -->
            <input 
              type="text" 
              v-model="form.username" 
              placeholder="用户名"
              class="input-field"
              required
              autocomplete="off" 
              name="username_new"
            />
          </div>
          <div class="form-group">
            <input 
              type="password" 
              v-model="form.password" 
              placeholder="密码"
              class="input-field"
              required
              autocomplete="new-password"
              name="password_new"
            />
          </div>

          <!-- 记住密码 & 忘记密码 -->
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="form.rememberMe" />
              <span>记住密码</span>
            </label>
            <span class="forgot-password" @click="handleForgotPassword">忘记密码</span>
          </div>

          <!-- 登录按钮 -->
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '立即登录' }}
          </button>
        </form>

        <!-- 底部注册 -->
        <div class="card-footer">
          <span>没有账号？</span>
          <span class="register-link" @click="handleRegister">立即注册</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/utils/userService' // 1. 导入用户服务

const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)
const videoRef = ref(null)

const form = reactive({
  username: '', // 确保这里是空字符串
  password: '', // 确保这里是空字符串
  rememberMe: false
})

onMounted(() => {
  // 检查是否有“记住密码”的标记
  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  
  if (rememberMe) {
    // 如果有，回填用户名和密码
    form.username = localStorage.getItem('savedUsername') || ''
    form.password = localStorage.getItem('savedPassword') || ''
    form.rememberMe = true
  }
  
  if (videoRef.value) {
    videoRef.value.playbackRate = 0.6
  }
})

const handleLogin = () => {
  if (!form.username || !form.password) {
    alert('请输入用户名和密码');
    return;
  }
  loading.value = true
  
  setTimeout(() => {
    const foundUser = userService.findUser(form.username, form.password)
    
    console.log('查找到的用户:', foundUser) // 添加调试信息

    if (foundUser) {
      // 处理"记住密码"逻辑
      if (form.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedUsername', form.username);
        localStorage.setItem('savedPassword', form.password);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedPassword');
      }

      

      // 保存到 sessionStorage
      sessionStorage.setItem('loggedInUser', JSON.stringify(foundUser))
      
      console.log('准备跳转到主页') // 添加调试信息
      
      router.push({ name: 'Home' })
    } else {
      alert('用户名或密码错误')
    }
    loading.value = false
  }, 800)
}

const handleForgotPassword = () => {
  router.push('/forgot-password')
}

const handleRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #001a33;
}

/* 视频背景 - 优化清晰度 */
.video-background {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%) scale(1.01);
  z-index: 0;
  object-fit: cover;
  
  /* 提升渲染质量 */
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: high-quality;
}

/* 背景遮罩 - 加深颜色 */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg, 
    rgba(0, 10, 30, 0.65) 0%, 
    rgba(0, 30, 60, 0.55) 50%,
    rgba(0, 40, 80, 0.65) 100%
  );
  z-index: 1;
  pointer-events: none;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 680px;
  padding: 30px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 系统标题 */
.system-title {
  text-align: center;
  margin-bottom: 40px;
}

.system-title h1 {
  margin: 0;
  font-size: 42px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 3px;
  text-shadow: 0 3px 25px rgba(0, 133, 202, 0.9),
               0 5px 12px rgba(0, 0, 0, 0.7),
               0 0 40px rgba(0, 133, 202, 0.4);
  white-space: nowrap;
}

.system-title p {
  margin: 15px 0 0;
  font-size: 17px;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 2px;
  font-weight: 300;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

/* 登录卡片 - 放大尺寸 */
.login-card {
  background: rgba(240, 245, 250, 0.96);
  backdrop-filter: blur(25px) saturate(180%);
  border-radius: 28px;
  padding: 70px 65px;
  box-shadow: 0 25px 70px rgba(0, 50, 100, 0.7),
              0 0 2px rgba(255, 255, 255, 0.6) inset;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

.login-title {
  text-align: center;
  margin: 0 0 50px;
  font-size: 42px;
  font-weight: 700;
  color: #003d82;
  letter-spacing: 10px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.form-group {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 22px 30px;
  border: 2px solid rgba(0, 133, 202, 0.25);
  border-radius: 50px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.98);
  transition: all 0.3s ease;
  outline: none;
  color: #333;
  box-sizing: border-box;
  font-weight: 500;
}

.input-field::placeholder {
  color: rgba(0, 61, 130, 0.35);
  letter-spacing: 1.5px;
  font-weight: 400;
}

.input-field:focus {
  border-color: #0085ca;
  background: #ffffff;
  box-shadow: 0 0 0 5px rgba(0, 133, 202, 0.12);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -5px;
  padding: 0 15px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #555;
  font-size: 16px;
  font-weight: 500;
}

.remember-me input[type="checkbox"] {
  cursor: pointer;
  width: 20px;
  height: 20px;
  accent-color: #0085ca;
}

.forgot-password {
  color: #0085ca;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
  font-weight: 500;
}

.forgot-password:hover {
  color: #006494;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 22px;
  background: linear-gradient(135deg, #0085ca 0%, #006494 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 15px;
  box-shadow: 0 5px 20px rgba(0, 133, 202, 0.5);
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 133, 202, 0.6);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.card-footer {
  margin-top: 40px;
  text-align: center;
  font-size: 16px;
  color: #666;
}

.register-link {
  color: #0085ca;
  font-weight: 600;
  cursor: pointer;
  margin-left: 6px;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: #006494;
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content-wrapper {
    max-width: 90%;
    padding: 20px;
  }
  
  .login-card {
    padding: 50px 40px;
  }
  
  .system-title h1 {
    font-size: 28px;
  }
}
</style>