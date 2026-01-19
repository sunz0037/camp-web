<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>校园OA系统</h1>
        <p>欢迎登录</p>
      </div>

      <div class="login-body">
        <!-- 登录方式选择 -->
        <div class="login-method-selector">
          <button
            :class="['method-btn', { active: loginMethod === 'password' }]"
            @click="switchLoginMethod('password')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            账号密码登录
          </button>
          <button
            :class="['method-btn', { active: loginMethod === 'face' }]"
            @click="switchLoginMethod('face')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            人脸识别登录
          </button>
        </div>

        <!-- 账号密码登录 -->
        <div v-if="loginMethod === 'password'" class="password-login">
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

        <!-- 人脸识别登录 -->
        <div v-if="loginMethod === 'face'" class="face-login">
          <!-- 视频区域 -->
          <div class="video-wrapper">
            <video ref="videoElement" id="face-video" autoplay muted playsinline></video>
            <canvas ref="canvasElement" id="face-overlay"></canvas>
            
            <!-- 加载提示 -->
            <div v-if="faceLoading" class="face-loader">
              <div class="spinner"></div>
              <p class="loading-text">{{ faceLoadingText }}</p>
            </div>
          </div>

          <!-- 状态提示 -->
          <div :class="['face-status', statusClass]">
            <span>{{ faceStatusText }}</span>
          </div>

          <!-- 控制按钮 -->
          <div class="face-controls">
            <button 
              @click="startFaceVerification" 
              :disabled="!faceReady || isVerifying"
              class="face-btn face-btn-verify"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {{ isVerifying ? '验证中...' : '开始人脸验证' }}
            </button>
            <button 
              v-if="isVerifying"
              @click="stopFaceVerification" 
              class="face-btn face-btn-stop"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              停止验证
            </button>
          </div>

          <!-- 提示信息 -->
          <div class="face-hint">
            <p>请确保光线充足，正对摄像头</p>
            <p>系统将自动识别您的身份</p>
          </div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import authAPI from '../api/auth.js'
import ActivatePasswordDialog from './ActivatePasswordDialog.vue'

const router = useRouter()

// 登录方式：password 或 face
const loginMethod = ref('password')

// 人脸识别相关
const videoElement = ref(null)
const canvasElement = ref(null)
const faceLoading = ref(false)
const faceLoadingText = ref('正在初始化...')
const faceReady = ref(false)
const isVerifying = ref(false)
const faceStatusText = ref('请点击开始验证')
const statusClass = ref('status-waiting')
let faceAPI = null
let animationId = null
let videoStream = null
const MATCH_THRESHOLD = 0.55

// 切换登录方式
const switchLoginMethod = (method) => {
  loginMethod.value = method
  if (method === 'face') {
    initFaceRecognition()
  } else {
    stopFaceVerification()
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      videoStream = null
    }
  }
}

// 初始化人脸识别
const initFaceRecognition = async () => {
  // 等待 face-api.js 加载完成
  const checkFaceAPI = () => {
    return new Promise((resolve) => {
      if (window.faceapi) {
        resolve(window.faceapi)
      } else {
        // 如果还没加载，等待一段时间后重试
        let attempts = 0
        const checkInterval = setInterval(() => {
          attempts++
          if (window.faceapi) {
            clearInterval(checkInterval)
            resolve(window.faceapi)
          } else if (attempts > 50) {
            // 10秒后放弃
            clearInterval(checkInterval)
            resolve(null)
          }
        }, 200)
      }
    })
  }
  
  faceAPI = await checkFaceAPI()
  
  if (!faceAPI) {
    faceLoading.value = false
    faceStatusText.value = '人脸识别库加载失败，请刷新页面重试'
    statusClass.value = 'status-error'
    return
  }
  
  await loadFaceModels()
}

// 加载人脸识别模型
const loadFaceModels = async () => {
  try {
    faceLoading.value = true
    faceLoadingText.value = '正在加载AI模型...'
    
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'
    await Promise.all([
      faceAPI.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceAPI.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceAPI.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ])
    
    faceLoadingText.value = '正在启动摄像头...'
    await startVideo()
    
    faceLoading.value = false
    faceReady.value = true
    faceStatusText.value = '系统就绪，请点击开始验证'
    statusClass.value = 'status-ready'
  } catch (err) {
    console.error('人脸识别初始化失败:', err)
    faceLoading.value = false
    faceStatusText.value = '初始化失败：' + err.message
    statusClass.value = 'status-error'
  }
}

// 启动摄像头
const startVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 1280, height: 720 } 
    })
    videoStream = stream
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      await new Promise((resolve) => {
        if (videoElement.value) {
          videoElement.value.onloadedmetadata = () => {
            syncCanvasSize()
            resolve()
          }
        }
      })
    }
  } catch (err) {
    console.error('摄像头访问失败:', err)
    faceStatusText.value = '无法访问摄像头，请检查权限设置'
    statusClass.value = 'status-error'
    throw err
  }
}

// 同步画布尺寸
const syncCanvasSize = () => {
  if (videoElement.value && canvasElement.value) {
    const displaySize = { 
      width: videoElement.value.clientWidth, 
      height: videoElement.value.clientHeight 
    }
    canvasElement.value.width = displaySize.width
    canvasElement.value.height = displaySize.height
    if (faceAPI) {
      faceAPI.matchDimensions(canvasElement.value, displaySize)
    }
  }
}

// 开始人脸验证
const startFaceVerification = () => {
  if (!faceReady.value || !faceAPI) {
    showToast('系统未就绪，请稍候')
    return
  }
  
  isVerifying.value = true
  faceStatusText.value = '正在验证身份...'
  statusClass.value = 'status-verifying'
  runVerificationLoop()
}

// 停止人脸验证
const stopFaceVerification = () => {
  isVerifying.value = false
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (canvasElement.value) {
    const ctx = canvasElement.value.getContext('2d')
    ctx.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height)
  }
  faceStatusText.value = '验证已停止'
  statusClass.value = 'status-waiting'
}

// 验证循环
const runVerificationLoop = async () => {
  if (!isVerifying.value || !videoElement.value || !canvasElement.value || !faceAPI) {
    return
  }
  
  try {
    const options = new faceAPI.SsdMobilenetv1Options({ minConfidence: 0.5 })
    const detections = await faceAPI
      .detectAllFaces(videoElement.value, options)
      .withFaceLandmarks()
      .withFaceDescriptors()
    
    const displaySize = { 
      width: canvasElement.value.width, 
      height: canvasElement.value.height 
    }
    const resizedDetections = faceAPI.resizeResults(detections, displaySize)
    const ctx = canvasElement.value.getContext('2d')
    ctx.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height)
    
    if (resizedDetections.length > 0) {
      // 检测到人脸，绘制识别框
      resizedDetections.forEach(detection => {
        const box = detection.detection.box
        const mirroredX = displaySize.width - box.x - box.width
        const color = '#10b981'
        const label = '检测到人脸'
        
        drawFaceBox(ctx, mirroredX, box.y, box.width, box.height, color, label)
      })
      
      // TODO: 这里应该调用后端API进行人脸匹配
      // 暂时显示检测到人脸的提示
      faceStatusText.value = '检测到人脸，正在验证身份...'
      statusClass.value = 'status-verifying'
      
      // 模拟验证成功（实际应该调用后端API）
      // handleFaceLoginSuccess(detection)
    } else {
      faceStatusText.value = '未检测到人脸，请正对摄像头'
      statusClass.value = 'status-waiting'
    }
  } catch (err) {
    console.error('人脸检测失败:', err)
  }
  
  animationId = requestAnimationFrame(runVerificationLoop)
}

// 绘制人脸框
const drawFaceBox = (ctx, x, y, w, h, color, label) => {
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  const len = Math.min(w, h) * 0.15
  ctx.beginPath()
  ctx.moveTo(x, y + len)
  ctx.lineTo(x, y)
  ctx.lineTo(x + len, y)
  ctx.moveTo(x + w - len, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w, y + len)
  ctx.moveTo(x + w, y + h - len)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + w - len, y + h)
  ctx.moveTo(x + len, y + h)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + h - len)
  ctx.stroke()
  
  ctx.fillStyle = color
  ctx.globalAlpha = 0.8
  ctx.font = 'bold 14px sans-serif'
  const textWidth = ctx.measureText(label).width
  ctx.fillRect(x, y - 28, textWidth + 10, 28)
  ctx.globalAlpha = 1.0
  ctx.fillStyle = 'white'
  ctx.fillText(label, x + 5, y - 10)
}

// 处理人脸登录成功
const handleFaceLoginSuccess = (userInfo) => {
  stopFaceVerification()
  faceStatusText.value = `身份确认成功，欢迎 ${userInfo.name || '用户'} 访问`
  statusClass.value = 'status-success'
  
  // 保存用户信息并跳转
  if (userInfo.userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo.userInfo))
  }
  if (userInfo.token) {
    localStorage.setItem('token', userInfo.token)
  }
  
  setTimeout(() => {
    router.push('/home/')
  }, 1500)
}

// Toast 提示
const showToast = (message) => {
  // 简单的提示，可以后续优化
  console.log('Toast:', message)
}

// 窗口大小变化时同步画布
const handleResize = () => {
  if (loginMethod.value === 'face') {
    syncCanvasSize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  stopFaceVerification()
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop())
  }
})

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

/* 登录方式选择器 */
.login-method-selector {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0.25rem;
  background: #f5f5f7;
  border-radius: 10px;
}

.method-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.method-btn:hover {
  color: #667eea;
}

.method-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 人脸识别登录样式 */
.face-login {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  border: 2px solid #e5e7eb;
}

#face-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

#face-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.face-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 20;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #667eea;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
}

.face-status {
  padding: 0.875rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s;
}

.status-waiting {
  background: #f5f5f7;
  color: #666;
  border: 1px solid #e5e7eb;
}

.status-ready {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.status-verifying {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #93c5fd;
}

.status-success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.status-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.face-controls {
  display: flex;
  gap: 0.75rem;
}

.face-btn {
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.face-btn-verify {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.face-btn-verify:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.face-btn-verify:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.face-btn-stop {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.face-btn-stop:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.face-hint {
  text-align: center;
  color: #666;
  font-size: 0.75rem;
  line-height: 1.6;
}

.face-hint p {
  margin: 0.25rem 0;
}

.password-login {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>

