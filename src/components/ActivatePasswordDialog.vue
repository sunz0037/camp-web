<template>
  <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-container" @click.stop>
      <div class="dialog-header">
        <h3>首次登录，请设置密码</h3>
        <p class="dialog-subtitle">密码长度不能少于6位</p>
      </div>
      
      <div class="dialog-body">
        <div class="form-group">
          <label>新密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码（至少6位）"
            :class="{ 'error': passwordError }"
            @input="validatePassword"
          />
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>
        
        <div class="form-group">
          <label>确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :class="{ 'error': confirmPasswordError }"
            @input="validateConfirmPassword"
          />
          <span v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</span>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="handleCancel">取消</button>
        <button 
          class="btn btn-primary" 
          @click="handleConfirm"
          :disabled="!canSubmit || loading"
        >
          {{ loading ? '设置中...' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  identityType: {
    type: Number,
    required: true
  },
  identifier: {
    type: String,
    required: true
  },
  realName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const loading = ref(false)

// 验证密码
const validatePassword = () => {
  passwordError.value = ''
  if (!password.value) {
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = '密码长度不能少于6位'
    return false
  }
  return true
}

// 验证确认密码
const validateConfirmPassword = () => {
  confirmPasswordError.value = ''
  if (!confirmPassword.value) {
    return false
  }
  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = '两次输入的密码不一致'
    return false
  }
  return true
}

// 是否可以提交
const canSubmit = computed(() => {
  return password.value.length >= 6 && 
         confirmPassword.value === password.value &&
         !passwordError.value &&
         !confirmPasswordError.value
})

// 处理确认
const handleConfirm = async () => {
  if (!validatePassword() || !validateConfirmPassword()) {
    return
  }
  
  loading.value = true
  try {
    emit('confirm', {
      identityType: props.identityType,
      identifier: props.identifier,
      realName: props.realName,
      password: password.value
    })
  } finally {
    loading.value = false
  }
}

// 处理取消
const handleCancel = () => {
  password.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  emit('cancel')
  emit('update:visible', false)
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  // 不允许点击遮罩层关闭
}

// 监听visible变化，重置表单
watch(() => props.visible, (newVal) => {
  if (newVal) {
    password.value = ''
    confirmPassword.value = ''
    passwordError.value = ''
    confirmPasswordError.value = ''
  }
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
}

.dialog-subtitle {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.dialog-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
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
  display: block;
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.75rem;
}

.dialog-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #333;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>

