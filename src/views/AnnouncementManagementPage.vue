<template>
  <div class="announcement-management-page">
    <div class="page-header">
      <h1>校园公告管理</h1>
      <button class="btn-primary" @click="handleCreate">发布公告</button>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>分类：</label>
        <input type="text" v-model="filters.category" placeholder="如：通知、活动" @keyup.enter="loadData" />
      </div>
      <div class="filter-group">
        <label>状态：</label>
        <select v-model="filters.status" @change="loadData">
          <option :value="null">全部</option>
          <option :value="0">草稿</option>
          <option :value="1">已发布</option>
          <option :value="2">已撤回</option>
        </select>
      </div>
      <div class="filter-group">
        <label>是否置顶：</label>
        <select v-model="filters.isTop" @change="loadData">
          <option :value="null">全部</option>
          <option :value="1">置顶</option>
          <option :value="0">未置顶</option>
        </select>
      </div>
      <div class="filter-group">
        <label>是否紧急：</label>
        <select v-model="filters.isUrgent" @change="loadData">
          <option :value="null">全部</option>
          <option :value="1">紧急</option>
          <option :value="0">普通</option>
        </select>
      </div>
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.keyword" 
          placeholder="搜索标题、内容..."
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
            <th>标题</th>
            <th>分类</th>
            <th>发布时间</th>
            <th>过期时间</th>
            <th>浏览次数</th>
            <th>置顶</th>
            <th>紧急</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="announcementList.length === 0">
            <td colspan="9" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="announcement in announcementList" :key="announcement.id">
            <td>{{ announcement.title }}</td>
            <td>{{ announcement.category || '-' }}</td>
            <td>{{ formatDate(announcement.publishTime) }}</td>
            <td>{{ formatDate(announcement.expireTime) }}</td>
            <td>{{ announcement.viewCount || 0 }}</td>
            <td>
              <span v-if="announcement.isTop === 1" class="badge-top">置顶</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="announcement.isUrgent === 1" class="badge-urgent">紧急</span>
              <span v-else>-</span>
            </td>
            <td>
              <span :class="getStatusClass(announcement.status)">
                {{ getStatusText(announcement.status) }}
              </span>
            </td>
            <td>
              <button class="btn-edit" @click="handleEdit(announcement)">编辑</button>
              <button 
                v-if="announcement.status === 1" 
                class="btn-top" 
                @click="handleToggleTop(announcement)"
              >
                {{ announcement.isTop === 1 ? '取消置顶' : '置顶' }}
              </button>
              <button 
                v-if="announcement.status === 1" 
                class="btn-withdraw" 
                @click="handleWithdraw(announcement)"
              >
                撤回
              </button>
              <button class="btn-delete" @click="handleDelete(announcement)">删除</button>
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
      <div class="dialog-content dialog-content-large" @click.stop>
        <div class="dialog-header">
          <h2>{{ dialogMode === 'create' ? '发布公告' : '编辑公告' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>标题 <span class="required">*</span></label>
                <input type="text" v-model="formData.title" required placeholder="公告标题" />
              </div>
              <div class="form-group form-group-half">
                <label>分类</label>
                <input type="text" v-model="formData.category" placeholder="如：通知、活动" />
              </div>
            </div>
            <div class="form-group">
              <label>内容 <span class="required">*</span></label>
              <textarea v-model="formData.content" required rows="8" placeholder="公告内容"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>发布时间</label>
                <input type="datetime-local" v-model="formData.publishTime" />
              </div>
              <div class="form-group form-group-half">
                <label>过期时间</label>
                <input type="datetime-local" v-model="formData.expireTime" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>目标受众</label>
                <input type="text" v-model="formData.targetAudience" placeholder="如：全体师生、学生、教职工" />
              </div>
              <div class="form-group form-group-half">
                <label>附件URL</label>
                <input type="text" v-model="formData.attachmentUrl" placeholder="附件链接（可选）" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>是否置顶</label>
                <select v-model="formData.isTop">
                  <option :value="0">否</option>
                  <option :value="1">是</option>
                </select>
              </div>
              <div class="form-group form-group-half">
                <label>是否紧急</label>
                <select v-model="formData.isUrgent">
                  <option :value="0">否</option>
                  <option :value="1">是</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>状态 <span class="required">*</span></label>
              <select v-model="formData.status" required>
                <option :value="0">草稿</option>
                <option :value="1">已发布</option>
              </select>
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
import * as announcementAPI from '../api/announcement.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const announcementList = ref([])
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
  title: '',
  content: '',
  category: '',
  publishTime: '',
  expireTime: '',
  targetAudience: '',
  isTop: 0,
  isUrgent: 0,
  attachmentUrl: '',
  status: 1
})

const filters = ref({
  category: '',
  status: null,
  isTop: null,
  isUrgent: null,
  keyword: ''
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '草稿',
    1: '已发布',
    2: '已撤回'
  }
  return statusMap[status] || '-'
}

// 获取状态样式类
const getStatusClass = (status) => {
  if (status === 1) return 'status-published'
  if (status === 2) return 'status-withdrawn'
  return 'status-draft'
}

// 格式化日期时间
const formatDate = (date) => {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date.split('T')[0] + ' ' + date.split('T')[1].split('.')[0]
  }
  return date
}

// 格式化日期时间为输入框格式
const formatDateTimeForInput = (date) => {
  if (!date) return ''
  if (typeof date === 'string') {
    return date.replace(' ', 'T').substring(0, 16)
  }
  return date
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await announcementAPI.getAnnouncementList({
      page: currentPage.value,
      size: pageSize.value,
      category: filters.value.category || undefined,
      status: filters.value.status,
      isTop: filters.value.isTop,
      isUrgent: filters.value.isUrgent,
      keyword: filters.value.keyword || undefined
    })
    
    if (result.code === 200 && result.data) {
      announcementList.value = result.data.records || []
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
    title: '',
    content: '',
    category: '',
    publishTime: '',
    expireTime: '',
    targetAudience: '',
    isTop: 0,
    isUrgent: 0,
    attachmentUrl: '',
    status: 1
  }
  showDialog.value = true
}

const handleEdit = async (announcement) => {
  dialogMode.value = 'edit'
  try {
    const result = await announcementAPI.getAnnouncementDetail(announcement.id)
    if (result.code === 200 && result.data) {
      const data = result.data
      formData.value = {
        id: data.id,
        title: data.title,
        content: data.content || '',
        category: data.category || '',
        publishTime: formatDateTimeForInput(data.publishTime),
        expireTime: formatDateTimeForInput(data.expireTime),
        targetAudience: data.targetAudience || '',
        isTop: data.isTop || 0,
        isUrgent: data.isUrgent || 0,
        attachmentUrl: data.attachmentUrl || '',
        status: data.status
      }
      showDialog.value = true
    }
  } catch (error) {
    showToast('加载公告详情失败：' + error.message, 'error')
  }
}

const handleToggleTop = async (announcement) => {
  const newIsTop = announcement.isTop === 1 ? 0 : 1
  const action = newIsTop === 1 ? '置顶' : '取消置顶'
  
  try {
    await announcementAPI.toggleTop(announcement.id, newIsTop)
    showToast(`${action}成功`, 'success')
    loadData()
  } catch (error) {
    showToast(`${action}失败：` + error.message, 'error')
  }
}

const handleWithdraw = async (announcement) => {
  if (!confirm(`确定要撤回公告"${announcement.title}"吗？`)) {
    return
  }
  
  try {
    await announcementAPI.withdrawAnnouncement(announcement.id)
    showToast('撤回成功', 'success')
    loadData()
  } catch (error) {
    showToast('撤回失败：' + error.message, 'error')
  }
}

const handleDelete = async (announcement) => {
  if (!confirm(`确定要删除公告"${announcement.title}"吗？`)) {
    return
  }
  
  try {
    await announcementAPI.deleteAnnouncement(announcement.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.title) {
    showToast('请输入标题', 'error')
    return
  }
  if (!formData.value.content) {
    showToast('请输入内容', 'error')
    return
  }
  
  try {
    const data = { ...formData.value }
    // 处理日期时间格式
    if (data.publishTime) {
      data.publishTime = new Date(data.publishTime).toISOString()
    }
    if (data.expireTime) {
      data.expireTime = new Date(data.expireTime).toISOString()
    }
    
    if (dialogMode.value === 'create') {
      await announcementAPI.createAnnouncement(data)
      showToast('创建成功', 'success')
    } else {
      await announcementAPI.updateAnnouncement(data.id, data)
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
.announcement-management-page {
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

.badge-top {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #ff9500;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
}

.badge-urgent {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #ff3b30;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
}

.status-published {
  color: #0071e3;
}

.status-draft {
  color: #86868b;
}

.status-withdrawn {
  color: #ff9500;
}

.btn-edit,
.btn-delete,
.btn-top,
.btn-withdraw {
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

.btn-top {
  background: #ffffff;
  color: #ff9500;
}

.btn-top:hover {
  background: #f5f5f7;
}

.btn-withdraw {
  background: #ffffff;
  color: #ff9500;
}

.btn-withdraw:hover {
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

.dialog-content-large {
  max-width: 1000px;
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
  min-height: 120px;
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
