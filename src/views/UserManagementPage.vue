<template>
  <div class="user-management-page">
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
                <label>密码 <span class="required" v-if="dialogMode === 'create">*</span></label>
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

<style scoped>
.user-management-page {
  padding: 2rem;
  background: #ffffff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #000000;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background: #000000;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: #333333;
}

.filter-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: #6e6e73;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
}

.filter-group button {
  padding: 0.5rem 1rem;
  background: #000000;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.table-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #fafafa;
}

.data-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #000000;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #1d1d1f;
}

.data-table tbody tr:hover {
  background: #f5f5f7;
}

.text-center {
  text-align: center;
  color: #6e6e73;
}

.status-enabled {
  color: #0071e3;
}

.status-disabled {
  color: #86868b;
}

.btn-edit,
.btn-delete,
.btn-status {
  padding: 0.25rem 0.75rem;
  margin-right: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8125rem;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #ffffff;
  color: #0071e3;
}

.btn-edit:hover {
  background: #f5f5f7;
}

.btn-status {
  background: #ffffff;
}

.btn-enable {
  color: #0071e3;
}

.btn-disable {
  color: #ff9500;
}

.btn-status:hover {
  background: #f5f5f7;
}

.btn-delete {
  background: #ffffff;
  color: #d32f2f;
}

.btn-delete:hover {
  background: #f5f5f7;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background: #f5f5f7;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
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
  flex: 1;
  overflow-y: auto;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 0;
  flex: 1;
}

.form-group-half {
  flex: 0 0 calc(50% - 0.5rem);
}

.form-group:not(.form-group-half) {
  flex: 1 1 100%;
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #1d1d1f;
  font-weight: 500;
}

.required {
  color: #d32f2f;
}

.field-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6e6e73;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
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

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-group-half {
    flex: 1 1 100%;
  }
}
</style>
