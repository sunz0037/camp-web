<template>
  <div class="profile-page bento-page">
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

    <div v-else class="empty-state">暂时没有读到个人信息。可以稍后重试，或先从左侧菜单进入其他功能。</div>

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
import * as userAPI from '../api/user.js'
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

