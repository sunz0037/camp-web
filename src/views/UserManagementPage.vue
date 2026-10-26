<template>
  <div class="user-management-page bento-page">
    <div class="page-header">
      <h1>用户管理</h1>
      <button class="btn-primary" @click="handleCreate">新增用户</button>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>用户类型：</label>
        <select v-model="filters.userType" @change="loadData">
          <option :value="null">全部</option>
          <option :value="1">学生</option>
          <option :value="2">教职工</option>
          <option :value="3">管理员</option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态：</label>
        <select v-model="filters.status" @change="loadData">
          <option :value="null">全部</option>
          <option :value="1">启用</option>
          <option :value="0">禁用</option>
        </select>
      </div>
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.keyword" 
          placeholder="搜索用户名、姓名..."
          @keyup.enter="loadData"
        />
        <button @click="loadData">搜索</button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <table class="data-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>真实姓名</th>
            <th>身份证号</th>
            <th>手机号</th>
            <th>邮箱</th>
            <th>用户类型</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="userList.length === 0">
            <td colspan="9" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="user in userList" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.realName }}</td>
            <td>{{ user.idCard || '-' }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>{{ user.email || '-' }}</td>
            <td>{{ getUserTypeText(user.userType) }}</td>
            <td>
              <span :class="user.status === 1 ? 'status-enabled' : 'status-disabled'">
                {{ user.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <button class="btn-edit" @click="handleEdit(user)">编辑</button>
              <button 
                class="btn-status" 
                @click="handleToggleStatus(user)"
                :class="user.status === 1 ? 'btn-disable' : 'btn-enable'"
              >
                {{ user.status === 1 ? '禁用' : '启用' }}
              </button>
              <button class="btn-delete" @click="handleDelete(user)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页，共 {{ total }} 条</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>{{ dialogMode === 'create' ? '新增用户' : '编辑用户' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>用户名 <span class="required">*</span></label>
                <input type="text" v-model="formData.username" required placeholder="如：学号或工号" />
              </div>
              <div class="form-group form-group-half">
                <label>真实姓名 <span class="required">*</span></label>
                <input type="text" v-model="formData.realName" required placeholder="真实姓名" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>身份证号</label>
                <input type="text" v-model="formData.idCard" placeholder="18位身份证号" maxlength="18" />
              </div>
              <div class="form-group form-group-half">
                <label>手机号</label>
                <input type="tel" v-model="formData.phone" placeholder="11位手机号" maxlength="11" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>邮箱</label>
                <input type="email" v-model="formData.email" placeholder="如：user@example.com" />
              </div>
              <div class="form-group form-group-half">
                <label>用户类型 <span class="required">*</span></label>
                <select v-model="formData.userType" required>
                  <option value="">请选择</option>
                  <option :value="1">学生</option>
                  <option :value="2">教职工</option>
                  <option :value="3">管理员</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>密码 <span class="required" v-if="dialogMode === 'create'">*</span></label>
                <input 
                  type="password" 
                  v-model="formData.password" 
                  :required="dialogMode === 'create'"
                  placeholder="留空则使用默认密码（身份证后六位或123456）"
                />
                <small class="field-hint" v-if="dialogMode === 'edit'">留空则不修改密码</small>
              </div>
              <div class="form-group form-group-half">
                <label>状态 <span class="required">*</span></label>
                <select v-model="formData.status" required>
                  <option :value="1">启用</option>
                  <option :value="0">禁用</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>头像URL</label>
              <input type="text" v-model="formData.avatarUrl" placeholder="头像图片URL（可选）" />
            </div>
            <div class="form-actions">
              <button type="button" @click="closeDialog">取消</button>
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
import { ref, computed, onMounted } from 'vue'
import * as userAPI from '../api/user.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const userList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showDialog = ref(false)
const dialogMode = ref('create')

// Toast 提示
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
}

const formData = ref({
  username: '',
  realName: '',
  idCard: '',
  phone: '',
  email: '',
  userType: null,
  password: '',
  status: 1,
  avatarUrl: ''
})

const filters = ref({
  userType: null,
  status: null,
  keyword: ''
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 获取用户类型文本
const getUserTypeText = (userType) => {
  const typeMap = {
    1: '学生',
    2: '教职工',
    3: '管理员'
  }
  return typeMap[userType] || '-'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date.split('T')[0] + ' ' + date.split('T')[1].split('.')[0]
  }
  return date
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await userAPI.getUserList({
      page: currentPage.value,
      size: pageSize.value,
      userType: filters.value.userType,
      status: filters.value.status,
      keyword: filters.value.keyword || undefined
    })
    
    if (result.code === 200 && result.data) {
      userList.value = result.data.records || []
      total.value = result.data.total || 0
    }
  } catch (error) {
    showToast('加载数据失败：' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadData()
  }
}

const handleCreate = () => {
  dialogMode.value = 'create'
  formData.value = {
    username: '',
    realName: '',
    idCard: '',
    phone: '',
    email: '',
    userType: null,
    password: '',
    status: 1,
    avatarUrl: ''
  }
  showDialog.value = true
}

const handleEdit = async (user) => {
  dialogMode.value = 'edit'
  try {
    const result = await userAPI.getUserDetail(user.id)
    if (result.code === 200 && result.data) {
      const data = result.data
      formData.value = {
        id: data.id,
        username: data.username,
        realName: data.realName,
        idCard: data.idCard || '',
        phone: data.phone || '',
        email: data.email || '',
        userType: data.userType,
        password: '', // 编辑时不显示密码
        status: data.status,
        avatarUrl: data.avatarUrl || ''
      }
      showDialog.value = true
    }
  } catch (error) {
    showToast('加载用户详情失败：' + error.message, 'error')
  }
}

const handleToggleStatus = async (user) => {
  const newStatus = user.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  
  if (!confirm(`确定要${action}用户"${user.realName}"吗？`)) {
    return
  }
  
  try {
    await userAPI.updateUserStatus(user.id, newStatus)
    showToast(`${action}成功`, 'success')
    loadData()
  } catch (error) {
    showToast(`${action}失败：` + error.message, 'error')
  }
}

const handleDelete = async (user) => {
  if (!confirm(`确定要删除用户"${user.realName}"吗？此操作不可恢复！`)) {
    return
  }
  
  try {
    await userAPI.deleteUser(user.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.username) {
    showToast('请输入用户名', 'error')
    return
  }
  if (!formData.value.realName) {
    showToast('请输入真实姓名', 'error')
    return
  }
  if (!formData.value.userType) {
    showToast('请选择用户类型', 'error')
    return
  }
  if (dialogMode.value === 'create' && !formData.value.password) {
    // 创建时如果没有密码，使用默认密码（由后端处理）
  }
  
  try {
    const data = { ...formData.value }
    // 编辑时如果密码为空，不传递密码字段
    if (dialogMode.value === 'edit' && !data.password) {
      delete data.password
    }
    
    if (dialogMode.value === 'create') {
      await userAPI.createUser(data)
      showToast('创建成功', 'success')
    } else {
      await userAPI.updateUser(data.id, data)
      showToast('更新成功', 'success')
    }
    closeDialog()
    loadData()
  } catch (error) {
    showToast('操作失败：' + (error.message || '未知错误'), 'error')
  }
}

const closeDialog = () => {
  showDialog.value = false
}
</script>

