<template>
  <div class="announcement-management-page bento-page">
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

