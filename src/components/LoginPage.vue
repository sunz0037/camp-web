<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>校园OA系统</h1>
        <p>欢迎登录</p>
      </div>

      <div class="login-body">
        <!-- 身份选择 -->
        <div class="identity-selector">
          <button
            v-for="identity in identities"
            :key="identity.type"
            :class="['identity-btn', { active: selectedIdentity === identity.type }]"
            @click="selectIdentity(identity.type)"
            :disabled="identity.type === 3"
          >
            {{ identity.label }}
            <span v-if="identity.type === 3" class="coming-soon">（暂未开放）</span>
          </button>
        </div>

        <!-- 登录表单 -->
        <form v-if="selectedIdentity !== 3" @submit.prevent="handleLogin" class="login-form">
          <!-- 学号/工号输入 -->
          <div class="form-group">
            <label>{{ selectedIdentity === 1 ? '学号' : '工号' }}</label>
            <input
              v-model="formData.identifier"
              type="text"
              :placeholder="`请输入${selectedIdentity === 1 ? '学号' : '工号'}`"
              required
              :class="{ 'error': errors.identifier }"
            />
            <span v-if="errors.identifier" class="error-message">{{ errors.identifier }}</span>
          </div>

          <!-- 姓名输入（首次登录尝试时显示） -->
          <div v-if="showNameInput" class="form-group">
            <label>姓名</label>
            <input
              v-model="formData.realName"
              type="text"
              placeholder="请输入姓名（用于首次登录验证）"
              required
              :class="{ 'error': errors.realName }"
            />
            <span v-if="errors.realName" class="error-message">{{ errors.realName }}</span>
            <p class="form-hint">首次登录需要验证姓名，验证通过后设置密码</p>
          </div>

          <!-- 密码输入（正常登录时显示） -->
          <div v-if="!showNameInput" class="form-group">
            <label>密码</label>
            <input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              required
              :class="{ 'error': errors.password }"
            />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            <p class="form-hint">
              <a href="#" @click.prevent="switchToFirstLogin" class="link">首次登录？</a>
              <span style="margin: 0 0.5rem">|</span>
              <router-link to="/reset-password" class="link">忘记密码？</router-link>
            </p>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="error-alert">
            {{ errorMessage }}
          </div>

          <!-- 登录按钮 -->
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 家长/访客提示 -->
        <div v-else class="guest-notice">
          <p>家长/访客登录功能暂未开放</p>
        </div>
      </div>
    </div>

    <!-- 激活密码对话框 -->
    <ActivatePasswordDialog
      v-model:visible="showActivateDialog"
      :identity-type="formData.identityType"
      :identifier="formData.identifier"
      :real-name="formData.realName"
      @confirm="handleActivate"
      @cancel="handleActivateCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import authAPI from '../api/auth.js'
import ActivatePasswordDialog from './ActivatePasswordDialog.vue'

const router = useRouter()

// 身份类型
const identities = [
  { type: 1, label: '学生' },
  { type: 2, label: '教工' },
  { type: 3, label: '家长/访客' }
]

// 选中的身份类型
const selectedIdentity = ref(1)

// 表单数据
const formData = ref({
  identityType: 1,
  identifier: '',
  realName: '',
  password: ''
})

// 表单错误
const errors = ref({})
const errorMessage = ref('')
const loading = ref(false)

// 是否显示姓名输入（首次登录）
const showNameInput = ref(false)

// 是否显示激活对话框
const showActivateDialog = ref(false)

// 选择身份
const selectIdentity = (type) => {
  if (type === 3) {
    return // 家长/访客暂不支持
  }
  selectedIdentity.value = type
  formData.value.identityType = type
  // 重置表单
  formData.value.identifier = ''
  formData.value.realName = ''
  formData.value.password = ''
  showNameInput.value = false
  errors.value = {}
  errorMessage.value = ''
}

// 处理登录
const handleLogin = async () => {
  // 重置错误
  errors.value = {}
  errorMessage.value = ''
  
  // 验证表单
  if (!formData.value.identifier) {
    errors.value.identifier = `请输入${selectedIdentity.value === 1 ? '学号' : '工号'}`
    return
  }

  // 如果是首次登录模式，需要姓名
  if (showNameInput.value && !formData.value.realName) {
    errors.value.realName = '请输入姓名'
    return
  }

  // 如果是正常登录模式，需要密码
  if (!showNameInput.value && !formData.value.password) {
    errors.value.password = '请输入密码'
    return
  }

  loading.value = true

  try {
    const loginData = {
      identityType: formData.value.identityType,
      identifier: formData.value.identifier,
      realName: formData.value.realName || undefined,
      password: formData.value.password || ''
    }

    const response = await authAPI.login(loginData)
    
    if (response.data.isFirstLogin) {
      // 首次登录，显示激活对话框
      showActivateDialog.value = true
    } else {
      // 正常登录成功
      handleLoginSuccess(response.data)
    }
  } catch (error) {
    errorMessage.value = error.message || '登录失败，请检查输入信息'
    
    // 如果是首次登录相关的错误，显示姓名输入框
    if (error.message && (
        error.message.includes('不匹配') || 
        error.message.includes('姓名') ||
        error.message.includes('首次登录')
    )) {
      showNameInput.value = true
    }
  } finally {
    loading.value = false
  }
}

// 处理激活
const handleActivate = async (activateData) => {
  loading.value = true

  try {
    const response = await authAPI.activate(activateData)
    
    // 激活成功，自动登录
    handleLoginSuccess(response.data)
    showActivateDialog.value = false
    
    // 保存用户信息和token
    if (response.data.userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo))
    }
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
  } catch (error) {
    errorMessage.value = error.message || '激活失败，请重试'
  } finally {
    loading.value = false
  }
}

// 处理激活取消
const handleActivateCancel = () => {
  showActivateDialog.value = false
  // 重置表单
  formData.value.realName = ''
  formData.value.password = ''
  showNameInput.value = false
}

// 处理登录成功
const handleLoginSuccess = (data) => {
  // 保存用户信息和token
  if (data.userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
  }
  if (data.token) {
    localStorage.setItem('token', data.token)
  }
  
  // 触发登录成功事件（可以在父组件中监听）
  emit('login-success', data)
  
  // 跳转到主页
  router.push('/home/')
}

const emit = defineEmits(['login-success'])

// 切换到首次登录模式
const switchToFirstLogin = () => {
  showNameInput.value = true
  formData.value.password = ''
  formData.value.realName = ''
  errors.value = {}
  errorMessage.value = ''
}

// 监听身份类型变化，重置显示状态
watch(selectedIdentity, () => {
  showNameInput.value = false
  formData.value.realName = ''
  formData.value.password = ''
  errors.value = {}
  errorMessage.value = ''
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.login-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
}

.login-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.875rem;
}

.login-body {
  padding: 2rem;
}

.identity-selector {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.identity-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.identity-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.identity-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.identity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.coming-soon {
  display: block;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  opacity: 0.8;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.875rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error {
  border-color: #ef4444;
}

.error-message {
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.75rem;
}

.form-hint {
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.75rem;
}

.form-hint .link {
  color: #667eea;
  text-decoration: none;
}

.form-hint .link:hover {
  text-decoration: underline;
}

.error-alert {
  padding: 0.75rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  font-size: 0.875rem;
}

.login-btn {
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
  margin-top: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.guest-notice {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.guest-notice p {
  margin: 0;
}
</style>

