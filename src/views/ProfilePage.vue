<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>个人信息</h1>
    </div>

    <div class="profile-content" v-if="loading">
      <div class="loading">加载中...</div>
    </div>

    <div class="profile-content" v-else-if="userInfo">
      <!-- 用户基本信息 -->
      <div class="profile-section">
        <h2>基本信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>用户名</label>
            <div class="info-value">{{ userInfo.username || '-' }}</div>
          </div>
          <div class="info-item">
            <label>真实姓名</label>
            <div class="info-value">{{ userInfo.realName || '-' }}</div>
          </div>
          <div class="info-item">
            <label>用户类型</label>
            <div class="info-value">{{ getUserTypeText(userInfo.userType) }}</div>
          </div>
          <div class="info-item">
            <label>头像</label>
            <div class="info-value">
              <img v-if="userInfo.avatarUrl" :src="userInfo.avatarUrl" alt="头像" class="avatar" />
              <span v-else>-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="profile-actions">
        <button class="btn-primary" @click="handleEdit">编辑信息</button>
        <router-link to="/home/change-password" class="btn-secondary">修改密码</router-link>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <div v-if="showEditDialog" class="dialog-overlay" @click="closeEditDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>编辑个人信息</h2>
          <button class="btn-close" @click="closeEditDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSave">
            <div class="form-group">
              <label>真实姓名</label>
              <input type="text" v-model="editForm.realName" placeholder="真实姓名" />
            </div>
            <div class="form-group">
              <label>头像URL</label>
              <input type="text" v-model="editForm.avatarUrl" placeholder="头像URL（可选）" />
            </div>
            <div class="form-actions">
              <button type="button" @click="closeEditDialog">取消</button>
              <button type="submit" class="btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
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
import { ref, onMounted } from 'vue'
import authAPI from '../api/auth.js'
import userAPI from '../api/user.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const userInfo = ref(null)
const showEditDialog = ref(false)
const editForm = ref({
  realName: '',
  avatarUrl: ''
})

// Toast 提示
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
}

// 获取用户类型文本
const getUserTypeText = (userType) => {
  const typeMap = {
    1: '学生',
    2: '教职工',
    3: '管理员'
  }
  return typeMap[userType] || '-'
}

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    const userId = JSON.parse(localStorage.getItem('userInfo') || '{}').id
    if (!userId) {
      showToast('未登录，请先登录', 'error')
      return
    }

    const result = await authAPI.getCurrentUser(userId)
    if (result.code === 200 && result.data) {
      userInfo.value = result.data
    }
  } catch (error) {
    showToast('加载用户信息失败：' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

// 编辑信息
const handleEdit = () => {
  editForm.value = {
    realName: userInfo.value.realName || '',
    avatarUrl: userInfo.value.avatarUrl || ''
  }
  showEditDialog.value = true
}

// 保存信息
const handleSave = async () => {
  try {
    const userId = JSON.parse(localStorage.getItem('userInfo') || '{}').id
    if (!userId) {
      showToast('未登录，请先登录', 'error')
      return
    }

    const userVo = {
      realName: editForm.value.realName,
      avatarUrl: editForm.value.avatarUrl || null
    }

    await userAPI.updateUser(userId, userVo)
    showToast('保存成功', 'success')
    closeEditDialog()
    loadUserInfo()
  } catch (error) {
    showToast('保存失败：' + error.message, 'error')
  }
}

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialog.value = false
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-page {
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

.profile-content {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6e6e73;
}

.profile-section {
  margin-bottom: 2rem;
}

.profile-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1d1d1f;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-size: 0.875rem;
  color: #6e6e73;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #1d1d1f;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
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

.btn-primary:hover {
  background: #0077ed;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: #ffffff;
  color: #0071e3;
  border: 1px solid #0071e3;
  border-radius: 6px;
  font-size: 0.9375rem;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f5f5f7;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #000000;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6e6e73;
}

.dialog-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #1d1d1f;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #0071e3;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-actions button {
  padding: 0.5rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-actions button[type="button"] {
  background: #ffffff;
  color: #1d1d1f;
}

.form-actions button[type="button"]:hover {
  background: #f5f5f7;
}

.form-actions .btn-primary {
  background: #000000;
  color: white;
  border-color: #000000;
}

.form-actions .btn-primary:hover {
  background: #333333;
}
</style>
