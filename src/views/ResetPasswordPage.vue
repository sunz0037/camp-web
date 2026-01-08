<template>
  <div class="reset-password-page">
    <div class="reset-container">
      <div class="reset-header">
        <h1>忘记密码</h1>
        <p>请选择身份类型并填写相应信息</p>
      </div>

      <div class="reset-body">
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

        <!-- 学生重置表单 -->
        <form v-if="selectedIdentity === 1" @submit.prevent="handleReset" class="reset-form">
          <h3>学生密码重置（六要素验证）</h3>
          
          <!-- 学号 -->
          <div class="form-group">
            <label>学号 <span class="required">*</span></label>
            <input 
              v-model="studentForm.identifier" 
              type="text" 
              required
              placeholder="请输入学号"
            />
          </div>
          
          <!-- 真实姓名 -->
          <div class="form-group">
            <label>真实姓名 <span class="required">*</span></label>
            <input 
              v-model="studentForm.realName" 
              type="text" 
              required
              placeholder="请输入真实姓名"
            />
          </div>
          
          <!-- 身份证号 -->
          <div class="form-group">
            <label>身份证号 <span class="required">*</span></label>
            <input 
              v-model="studentForm.idCard" 
              type="text" 
              required
              maxlength="18"
              placeholder="请输入18位身份证号"
            />
          </div>
          
          <!-- 应急联系人姓名 -->
          <div class="form-group">
            <label>应急联系人姓名 <span class="required">*</span></label>
            <input 
              v-model="studentForm.contactName" 
              type="text" 
              required
              placeholder="请输入应急联系人姓名"
            />
          </div>
          
          <!-- 应急联系人电话 -->
          <div class="form-group">
            <label>应急联系人电话 <span class="required">*</span></label>
            <input 
              v-model="studentForm.contactPhone" 
              type="tel" 
              required
              maxlength="11"
              placeholder="请输入11位手机号"
            />
          </div>
          
          <!-- 关系 -->
          <div class="form-group">
            <label>关系 <span class="required">*</span></label>
            <select v-model="studentForm.relationship" required>
              <option value="">请选择</option>
              <option value="父亲">父亲</option>
              <option value="母亲">母亲</option>
              <option value="监护人">监护人</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="errorMessage" class="error-alert">
            {{ errorMessage }}
          </div>
          
          <!-- 提交按钮 -->
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '重置中...' : '重置密码' }}
          </button>
        </form>

        <!-- 教工重置表单 -->
        <form v-if="selectedIdentity === 2" @submit.prevent="handleReset" class="reset-form">
          <h3>教工密码重置（手机验证码）</h3>
          
          <!-- 工号 -->
          <div class="form-group">
            <label>工号 <span class="required">*</span></label>
            <input 
              v-model="teacherForm.identifier" 
              type="text" 
              required
              placeholder="请输入工号"
            />
          </div>
          
          <!-- 真实姓名 -->
          <div class="form-group">
            <label>真实姓名 <span class="required">*</span></label>
            <input 
              v-model="teacherForm.realName" 
              type="text" 
              required
              placeholder="请输入真实姓名"
            />
          </div>
          
          <!-- 手机号 -->
          <div class="form-group">
            <label>手机号 <span class="required">*</span></label>
            <div class="phone-input-group">
              <input 
                v-model="teacherForm.phone" 
                type="tel" 
                required
                maxlength="11"
                placeholder="请输入11位手机号"
                :disabled="codeSent"
              />
              <button 
                type="button" 
                class="send-code-btn"
                @click="handleSendCode"
                :disabled="codeSent || sendingCode || loading"
              >
                {{ codeSent ? `已发送(${countdown}s)` : sendingCode ? '发送中...' : '发送验证码' }}
              </button>
            </div>
          </div>
          
          <!-- 验证码 -->
          <div class="form-group" v-if="codeSent">
            <label>验证码 <span class="required">*</span></label>
            <input 
              v-model="teacherForm.verificationCode" 
              type="text" 
              required
              maxlength="6"
              placeholder="请输入6位验证码"
            />
          </div>
          
          <!-- 错误提示 -->
          <div v-if="errorMessage" class="error-alert">
            {{ errorMessage }}
          </div>
          
          <!-- 提交按钮 -->
          <button type="submit" class="submit-btn" :disabled="loading || !codeSent">
            {{ loading ? '重置中...' : '重置密码' }}
          </button>
        </form>

        <!-- 返回登录 -->
        <div class="back-login">
          <router-link to="/login">返回登录</router-link>
        </div>
      </div>
    </div>

    <!-- 成功提示对话框 -->
    <div v-if="showSuccessDialog" class="success-dialog" @click="closeSuccessDialog">
      <div class="dialog-content" @click.stop>
        <h3>密码重置成功</h3>
        <p>密码已重置为身份证号后6位：<strong>{{ maskedIdCard }}</strong></p>
        <p class="hint">请使用新密码登录，建议登录后立即修改密码</p>
        <button @click="goToLogin" class="btn-primary">前往登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import authAPI from '../api/auth.js'

const router = useRouter()

// 身份类型
const identities = [
  { type: 1, label: '学生' },
  { type: 2, label: '教工' },
  { type: 3, label: '家长/访客' }
]

const selectedIdentity = ref(1)

// 学生表单
const studentForm = ref({
  identityType: 1,
  identifier: '',
  realName: '',
  idCard: '',
  contactName: '',
  contactPhone: '',
  relationship: ''
})

// 教工表单
const teacherForm = ref({
  identityType: 2,
  identifier: '',
  realName: '',
  phone: '',
  verificationCode: ''
})

const loading = ref(false)
const errorMessage = ref('')
const showSuccessDialog = ref(false)
const maskedIdCard = ref('')

// 验证码相关
const codeSent = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
let countdownTimer = null

// 选择身份
const selectIdentity = (type) => {
  if (type === 3) return
  selectedIdentity.value = type
  studentForm.value.identityType = type === 1 ? 1 : 2
  teacherForm.value.identityType = type === 2 ? 2 : 1
  errorMessage.value = ''
  codeSent.value = false
  countdown.value = 0
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 发送验证码（教工）
const handleSendCode = async () => {
  if (!teacherForm.value.identifier || !teacherForm.value.realName || !teacherForm.value.phone) {
    errorMessage.value = '请先填写工号、姓名和手机号'
    return
  }

  sendingCode.value = true
  errorMessage.value = ''

  try {
    const response = await authAPI.sendVerificationCode({
      identityType: 2,
      identifier: teacherForm.value.identifier,
      realName: teacherForm.value.realName,
      phone: teacherForm.value.phone
    })

    if (response.data.success) {
      codeSent.value = true
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer)
          countdownTimer = null
          codeSent.value = false
        }
      }, 1000)
    }
  } catch (error) {
    errorMessage.value = error.message || '发送验证码失败'
  } finally {
    sendingCode.value = false
  }
}

// 处理重置
const handleReset = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    let requestData
    if (selectedIdentity.value === 1) {
      // 学生
      requestData = {
        identityType: 1,
        identifier: studentForm.value.identifier,
        realName: studentForm.value.realName,
        idCard: studentForm.value.idCard,
        contactName: studentForm.value.contactName,
        contactPhone: studentForm.value.contactPhone,
        relationship: studentForm.value.relationship
      }
    } else {
      // 教工
      requestData = {
        identityType: 2,
        identifier: teacherForm.value.identifier,
        realName: teacherForm.value.realName,
        phone: teacherForm.value.phone,
        verificationCode: teacherForm.value.verificationCode
      }
    }

    const response = await authAPI.resetPassword(requestData)

    if (response.data.success) {
      maskedIdCard.value = response.data.maskedIdCard || '****'
      showSuccessDialog.value = true
    }
  } catch (error) {
    errorMessage.value = error.message || '重置失败，请检查输入信息'
  } finally {
    loading.value = false
  }
}

// 关闭成功对话框
const closeSuccessDialog = () => {
  showSuccessDialog.value = false
}

// 前往登录
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.reset-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.reset-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.reset-header h1 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.75rem;
}

.reset-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.reset-body {
  padding: 2rem;
}

.identity-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.identity-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
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
  font-size: 0.8rem;
  opacity: 0.7;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.reset-form h3 {
  margin: 0 0 1rem;
  color: #333;
  font-size: 1.1rem;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.phone-input-group {
  display: flex;
  gap: 0.5rem;
}

.phone-input-group input {
  flex: 1;
}

.send-code-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: background 0.3s;
}

.send-code-btn:hover:not(:disabled) {
  background: #5568d3;
}

.send-code-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-alert {
  padding: 0.75rem;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 0.9rem;
}

.submit-btn {
  padding: 0.875rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: #5568d3;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.back-login {
  margin-top: 1.5rem;
  text-align: center;
}

.back-login a {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-login a:hover {
  text-decoration: underline;
}

.success-dialog {
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

.dialog-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-content h3 {
  margin: 0 0 1rem;
  color: #333;
  font-size: 1.5rem;
}

.dialog-content p {
  margin: 0.75rem 0;
  color: #666;
  line-height: 1.6;
}

.dialog-content strong {
  color: #667eea;
  font-size: 1.1rem;
}

.hint {
  color: #999;
  font-size: 0.9rem;
}

.btn-primary {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #5568d3;
}
</style>

