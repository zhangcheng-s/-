<template>
  <div class="forgot-password-container">
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

    <div class="overlay"></div>

    <div class="content-wrapper">
      <div class="system-title">
        <h1>深海矿区宏生物综合数据服务平台</h1>
        <p>Integrated data service platform for macrobiotics</p>
      </div>

      <div class="forgot-card">
        <h2 class="forgot-title">找回密码</h2>

        <form @submit.prevent="handleReset" class="forgot-form">
          <div class="form-group">
            <input 
              type="text" 
              v-model="form.username" 
              placeholder="用户名"
              class="input-field"
              required
            />
          </div>

          <div class="form-group">
            <input 
              type="email" 
              v-model="form.email" 
              placeholder="注册时使用的邮箱"
              class="input-field"
              required
            />
          </div>

          <div class="form-group" v-if="showNewPassword">
            <input 
              type="password" 
              v-model="form.newPassword" 
              placeholder="新密码（至少5位）"
              class="input-field"
              required
              minlength="5"
            />
          </div>

          <div class="form-group" v-if="showNewPassword">
            <input 
              type="password" 
              v-model="form.confirmPassword" 
              placeholder="确认新密码"
              class="input-field"
              required
            />
          </div>

          <button type="submit" class="reset-btn" :disabled="loading">
            {{ loading ? '处理中...' : (showNewPassword ? '重置密码' : '验证身份') }}
          </button>
        </form>

        <div class="card-footer">
          <span>想起密码了？</span>
          <span class="login-link" @click="goToLogin">立即登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/utils/userService' // 导入用户服务

const router = useRouter()
const loading = ref(false)
const showNewPassword = ref(false)
const videoRef = ref(null)

const form = reactive({
  username: '',
  email: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  // 设置视频播放速度
  if (videoRef.value) {
    videoRef.value.playbackRate = 0.6
  }
})

const handleReset = () => {
  loading.value = true

  setTimeout(() => {
    if (!showNewPassword.value) {
      // 第一步：验证身份
      const userFound = userService.findUserByUsernameAndEmail(form.username, form.email);
      if (!userFound) {
        alert('用户名或邮箱不匹配，请检查后重试');
        loading.value = false;
        return;
      }
      showNewPassword.value = true;
      alert('身份验证成功，请设置新密码');
      loading.value = false;
      return;
    }

    // 第二步：重置密码
    if (form.newPassword !== form.confirmPassword) {
      alert('两次输入的密码不一致');
      loading.value = false;
      return;
    }

    if (form.newPassword.length < 5) {
      alert('密码长度至少为5位');
      loading.value = false;
      return;
    }

    // 使用服务更新密码
    const success = userService.updateUserPassword(form.username, form.newPassword);

    if (success) {
      alert('密码重置成功！请使用新密码登录');
      router.push('/login');
    } else {
      // 理论上这一步不会失败，因为前面已经验证过用户存在
      alert('密码重置失败，请稍后重试');
    }
    loading.value = false;
  }, 1000);
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #001a33; /* 视频加载失败时的备用背景色 */
}

.video-background {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  z-index: 0;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    175deg,
    rgba(0, 20, 40, 0.4) 0%,
    rgba(0, 30, 60, 0.7) 60%,
    rgba(0, 10, 20, 0.9) 100%
  );
  z-index: 1;
  pointer-events: none;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 680px; /* 统一宽度 */
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

.system-title {
  text-align: center;
  margin-bottom: 40px; /* 统一间距 */
}

.system-title h1 {
  margin: 0;
  font-size: 42px; /* 统一字体大小 */
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 3px;
  text-shadow: 0 3px 25px rgba(0, 133, 202, 0.9),
               0 0 40px rgba(0, 133, 202, 0.4);
  white-space: nowrap;
}

.system-title p {
  margin: 15px 0 0;
  font-size: 17px; /* 统一字体大小 */
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 2px;
  font-weight: 300;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

.forgot-card {
  background: rgba(240, 245, 250, 0.96); /* 统一卡片样式 */
  backdrop-filter: blur(25px) saturate(180%);
  border-radius: 28px;
  padding: 70px 65px;
  box-shadow: 0 25px 70px rgba(0, 50, 100, 0.7),
              0 0 2px rgba(255, 255, 255, 0.6) inset;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.forgot-title {
  text-align: center;
  margin: 0 0 40px;
  font-size: 38px; /* 统一标题大小 */
  font-weight: 700;
  color: #003d82;
  letter-spacing: 8px;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 18px 24px;
  border: 2px solid rgba(0, 133, 202, 0.2);
  border-radius: 50px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  outline: none;
  color: #333;
  box-sizing: border-box;
}

.input-field::placeholder {
  color: rgba(0, 61, 130, 0.4);
  letter-spacing: 1px;
}

.input-field:focus {
  border-color: #0085ca;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 133, 202, 0.1);
}

.reset-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #0085ca 0%, #006494 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(0, 133, 202, 0.3);
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 133, 202, 0.4);
}

.reset-btn:active {
  transform: translateY(0);
}

.reset-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.card-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 16px; /* 统一字体大小 */
  color: #666;
}

.login-link {
  color: #0085ca;
  font-weight: 600;
  cursor: pointer;
  margin-left: 5px;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #006494;
  text-decoration: underline;
}
</style>