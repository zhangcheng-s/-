<template>
  <div class="register-container">
    <video ref="videoRef" class="video-background" autoplay loop muted playsinline>
      <source src="@/assets/video/background.mp4" type="video/mp4" />
    </video>
    <div class="overlay"></div>

    <div class="content-wrapper">
      <div class="system-title">
        <h1>深海矿区宏生物综合数据服务平台</h1>
        <p>Integrated data service platform for macrobiotics</p>
      </div>

      <div class="register-card">
        <h2 class="register-title">注 册</h2>
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <input
              type="text"
              v-model="form.username"
              placeholder="用户名（5-20个字符）"
              class="input-field"
              autocomplete="off"
              required
              minlength="5"
              maxlength="20"
            />
          </div>
          <div class="form-group">
            <input
              type="email"
              v-model="form.email"
              placeholder="邮箱"
              class="input-field"
              autocomplete="off"
              required
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              v-model="form.password"
              placeholder="密码（至少5位）"
              class="input-field"
              autocomplete="new-password"
              required
              minlength="5"
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              v-model="form.confirmPassword"
              placeholder="确认密码"
              class="input-field"
              autocomplete="new-password"
              required
            />
          </div>
          <button type="submit" class="register-btn" :disabled="loading">
            {{ loading ? '注册中...' : '立即注册' }}
          </button>
        </form>

        <div class="card-footer">
          <span>已有账号？</span>
          <span class="login-link" @click="goToLogin">立即登录</span>
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
const videoRef = ref(null)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const resetForm = () => {
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
}

onMounted(() => {
  if (videoRef.value) videoRef.value.playbackRate = 0.6
  resetForm()
})

const handleRegister = () => {
  if (form.password !== form.confirmPassword) {
    alert('两次输入的密码不一致，请重新输入')
    return
  }

  if (form.username.length < 5 || form.username.length > 20) {
    alert('用户名长度应为5-20个字符')
    return
  }

  if (form.password.length < 5) {
    alert('密码长度至少为5位')
    return
  }

  loading.value = true

  // 2. 使用 userService 处理注册逻辑
  setTimeout(() => {
    const newUser = {
      username: form.username,
      email: form.email,
      password: form.password
    };

    const success = userService.addUser(newUser);

    if (success) {
      alert('注册成功！现在您可以登录了。');
      router.push('/login');
    } else {
      alert('该用户名已被注册，请更换一个。');
    }
    loading.value = false;
  }, 1000)
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
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

.register-card {
  background: rgba(240, 245, 250, 0.96); /* 统一卡片样式 */
  backdrop-filter: blur(25px) saturate(180%);
  border-radius: 28px;
  padding: 70px 65px;
  box-shadow: 0 25px 70px rgba(0, 50, 100, 0.7),
              0 0 2px rgba(255, 255, 255, 0.6) inset;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.register-title {
  text-align: center;
  margin: 0 0 40px;
  font-size: 38px; /* 统一标题大小 */
  font-weight: 700;
  color: #003d82;
  letter-spacing: 8px;
}

.register-form {
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

.register-btn {
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

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 133, 202, 0.4);
}

.register-btn:active {
  transform: translateY(0);
}

.register-btn:disabled {
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