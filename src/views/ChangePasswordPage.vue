<template>
  <div class="change-password-page">
    <div class="page-header">
      <h1>修改密码</h1>
    </div>

    <div class="password-content">
      <form @submit.prevent="handleSubmit" class="password-form">
        <div class="form-group">
          <label>旧密码 <span class="required">*</span></label>
          <input 
            type="password" 
            v-model="formData.oldPassword" 
            required 
            placeholder="请输入旧密码"
            autocomplete="current-password"
          />
        </div>

        <div class="form-group">
          <label>新密码 <span class="required">*</span></label>
          <input 
            type="password" 
            v-model="formData.newPassword" 
            required 
            placeholder="请输入新密码（至少6位）"
            autocomplete="new-password"
            minlength="6"
          />
          <small class="field-hint">密码长度不能少于6位</small>
        </div>

        <div class="form-group">
          <label>确认新密码 <span class="required">*</span></label>
          <input 
            type="password" 
            v-model="formData.confirmPassword" 
            required 
            placeholder="请再次输入新密码"
            autocomplete="new-password"
            minlength="6"
          />
        </div>

        <div v-if="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <router-link to="/home/profile" class="btn-cancel">取消</router-link>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? '修改中...' : '确认修改' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Toast 提示 -->
    <Toast
      v-model:visible="toastVisible"
      :message="toastMessage"
      :type="toastType"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authAPI from '../api/auth.js'
import Toast from '../components/Toast.vue'

const router = useRouter()

const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const errorMessage = ref('')

// Toast 提示
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  errorMessage.value = ''

  // 验证新密码长度
  if (formData.value.newPassword.length < 6) {
    errorMessage.value = '新密码长度不能少于6位'
    return
  }

  // 验证两次输入的新密码是否一致
  if (formData.value.newPassword !== formData.value.confirmPassword) {
    errorMessage.value = '两次输入的新密码不一致'
    return
  }

  // 验证新旧密码是否相同
  if (formData.value.oldPassword === formData.value.newPassword) {
    errorMessage.value = '新密码不能与旧密码相同'
    return
  }

  loading.value = true

  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const userId = userInfo.id

    if (!userId) {
      showToast('未登录，请先登录', 'error')
      router.push('/login')
      return
    }

    await authAPI.changePassword(
      userId,
      formData.value.oldPassword,
      formData.value.newPassword
    )

    showToast('密码修改成功', 'success')
    
    // 清空表单
    formData.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      router.push('/home/profile')
    }, 1500)
  } catch (error) {
    errorMessage.value = error.message || '修改密码失败，请检查旧密码是否正确'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-page {
  padding: 2rem;
  background: #ffffff;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d1d1f;
}

.password-content {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  color: #1d1d1f;
  font-weight: 500;
}

.required {
  color: #ff3b30;
}

.form-group input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #0071e3;
}

.field-hint {
  font-size: 0.75rem;
  color: #6e6e73;
}

.error-alert {
  padding: 0.75rem;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  background: #ffffff;
  color: #1d1d1f;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  font-size: 0.9375rem;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f5f5f7;
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #0077ed;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
