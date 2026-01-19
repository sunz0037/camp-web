<template>
  <div class="visitor-management-page">
    <div class="page-header">
      <h1>来访登记管理</h1>
      <button class="btn-primary" @click="handleCreate">新增来访登记</button>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>来访日期：</label>
        <input type="date" v-model="filters.visitDate" @change="loadData" />
      </div>
      <div class="filter-group">
        <label>状态：</label>
        <select v-model="filters.status" @change="loadData">
          <option :value="null">全部</option>
          <option :value="0">待审核</option>
          <option :value="1">已批准</option>
          <option :value="2">已进入</option>
          <option :value="3">已离开</option>
          <option :value="4">已拒绝</option>
        </select>
      </div>
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.keyword" 
          placeholder="搜索来访人姓名、电话..."
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
            <th>来访人姓名</th>
            <th>来访人电话</th>
            <th>访问目标</th>
            <th>来访目的</th>
            <th>来访日期</th>
            <th>预计时间</th>
            <th>实际进入时间</th>
            <th>实际离开时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="10" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="visitorList.length === 0">
            <td colspan="10" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="visitor in visitorList" :key="visitor.id">
            <td>{{ visitor.visitorName }}</td>
            <td>{{ visitor.visitorPhone }}</td>
            <td>{{ visitor.visitTargetName || '-' }}</td>
            <td>{{ visitor.visitPurpose || '-' }}</td>
            <td>{{ formatDate(visitor.visitDate) }}</td>
            <td>
              <span v-if="visitor.visitTimeStart && visitor.visitTimeEnd">
                {{ formatDateTime(visitor.visitTimeStart) }} - {{ formatDateTime(visitor.visitTimeEnd) }}
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ formatDateTime(visitor.entryTime) }}</td>
            <td>{{ formatDateTime(visitor.exitTime) }}</td>
            <td>
              <span :class="getStatusClass(visitor.status)">
                {{ getStatusText(visitor.status) }}
              </span>
            </td>
            <td>
              <button class="btn-edit" @click="handleEdit(visitor)">编辑</button>
              <button 
                v-if="visitor.status === 0" 
                class="btn-approve" 
                @click="handleApprove(visitor)"
              >
                批准
              </button>
              <button 
                v-if="visitor.status === 0" 
                class="btn-reject" 
                @click="handleReject(visitor)"
              >
                拒绝
              </button>
              <button 
                v-if="visitor.status === 1" 
                class="btn-entry" 
                @click="handleEntry(visitor)"
              >
                登记进入
              </button>
              <button 
                v-if="visitor.status === 2" 
                class="btn-exit" 
                @click="handleExit(visitor)"
              >
                登记离开
              </button>
              <button class="btn-delete" @click="handleDelete(visitor)">删除</button>
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
          <h2>{{ dialogMode === 'create' ? '新增来访登记' : '编辑来访登记' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>来访人姓名 <span class="required">*</span></label>
                <input type="text" v-model="formData.visitorName" required placeholder="来访人姓名" />
              </div>
              <div class="form-group form-group-half">
                <label>来访人电话 <span class="required">*</span></label>
                <input type="tel" v-model="formData.visitorPhone" required placeholder="11位手机号" maxlength="11" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>身份证号</label>
                <input type="text" v-model="formData.visitorIdCard" placeholder="18位身份证号" maxlength="18" />
              </div>
              <div class="form-group form-group-half">
                <label>访问目标用户ID</label>
                <input type="number" v-model.number="formData.visitTargetUserId" placeholder="被访问人的用户ID" />
              </div>
            </div>
            <div class="form-group">
              <label>来访目的 <span class="required">*</span></label>
              <textarea v-model="formData.visitPurpose" required rows="2" placeholder="来访目的"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>来访日期 <span class="required">*</span></label>
                <input type="date" v-model="formData.visitDate" required />
              </div>
              <div class="form-group form-group-half">
                <label>预计来访时间（开始）</label>
                <input type="datetime-local" v-model="formData.visitTimeStart" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>预计来访时间（结束）</label>
                <input type="datetime-local" v-model="formData.visitTimeEnd" />
              </div>
              <div class="form-group form-group-half">
                <label>陪同人数</label>
                <input type="number" v-model.number="formData.accompanyCount" min="0" placeholder="0" />
              </div>
            </div>
            <div class="form-group">
              <label>车辆信息</label>
              <input type="text" v-model="formData.vehicleInfo" placeholder="车牌号等信息（可选）" />
            </div>
            <div class="form-group">
              <label>备注</label>
              <textarea v-model="formData.remark" rows="2" placeholder="备注信息"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeDialog">取消</button>
              <button type="submit" class="btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 审核对话框 -->
    <div v-if="showApproveDialog" class="dialog-overlay" @click="closeApproveDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>审核来访登记</h2>
          <button class="btn-close" @click="closeApproveDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>审核备注</label>
            <textarea v-model="approveRemark" rows="3" placeholder="审核备注（可选）"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeApproveDialog">取消</button>
            <button type="button" class="btn-primary" @click="handleConfirmApprove">确定批准</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 拒绝对话框 -->
    <div v-if="showRejectDialog" class="dialog-overlay" @click="closeRejectDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>拒绝来访登记</h2>
          <button class="btn-close" @click="closeRejectDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>拒绝原因</label>
            <textarea v-model="rejectRemark" rows="3" placeholder="请输入拒绝原因"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeRejectDialog">取消</button>
            <button type="button" class="btn-reject" @click="handleConfirmReject">确定拒绝</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 进入/离开时间登记对话框 -->
    <div v-if="showTimeDialog" class="dialog-overlay" @click="closeTimeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>{{ timeDialogType === 'entry' ? '登记进入时间' : '登记离开时间' }}</h2>
          <button class="btn-close" @click="closeTimeDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>{{ timeDialogType === 'entry' ? '进入时间' : '离开时间' }} <span class="required">*</span></label>
            <input type="datetime-local" v-model="timeValue" required />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeTimeDialog">取消</button>
            <button type="button" class="btn-primary" @click="handleConfirmTime">确定</button>
          </div>
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
import * as visitorAPI from '../api/visitor.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const visitorList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showDialog = ref(false)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showTimeDialog = ref(false)
const dialogMode = ref('create')
const currentVisitor = ref(null)
const approveRemark = ref('')
const rejectRemark = ref('')
const timeDialogType = ref('entry') // 'entry' 或 'exit'
const timeValue = ref('')

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
  visitorName: '',
  visitorPhone: '',
  visitorIdCard: '',
  visitPurpose: '',
  visitTargetUserId: null,
  visitDate: '',
  visitTimeStart: '',
  visitTimeEnd: '',
  vehicleInfo: '',
  accompanyCount: 0,
  remark: ''
})

const filters = ref({
  visitDate: '',
  status: null,
  keyword: ''
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已批准',
    2: '已进入',
    3: '已离开',
    4: '已拒绝'
  }
  return statusMap[status] || '-'
}

// 获取状态样式类
const getStatusClass = (status) => {
  if (status === 0) return 'status-pending'
  if (status === 1) return 'status-approved'
  if (status === 2) return 'status-entered'
  if (status === 3) return 'status-exited'
  if (status === 4) return 'status-rejected'
  return ''
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  return date
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  if (typeof dateTime === 'string') {
    return dateTime.split('T')[0] + ' ' + dateTime.split('T')[1].split('.')[0]
  }
  return dateTime
}

// 格式化日期时间为输入框格式
const formatDateTimeForInput = (dateTime) => {
  if (!dateTime) return ''
  if (typeof dateTime === 'string') {
    return dateTime.replace(' ', 'T').substring(0, 16)
  }
  return dateTime
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await visitorAPI.getVisitorList({
      page: currentPage.value,
      size: pageSize.value,
      visitDate: filters.value.visitDate || undefined,
      status: filters.value.status,
      keyword: filters.value.keyword || undefined
    })
    
    if (result.code === 200 && result.data) {
      visitorList.value = result.data.records || []
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
    visitorName: '',
    visitorPhone: '',
    visitorIdCard: '',
    visitPurpose: '',
    visitTargetUserId: null,
    visitDate: '',
    visitTimeStart: '',
    visitTimeEnd: '',
    vehicleInfo: '',
    accompanyCount: 0,
    remark: ''
  }
  showDialog.value = true
}

const handleEdit = async (visitor) => {
  dialogMode.value = 'edit'
  try {
    const result = await visitorAPI.getVisitorDetail(visitor.id)
    if (result.code === 200 && result.data) {
      const data = result.data
      formData.value = {
        id: data.id,
        visitorName: data.visitorName,
        visitorPhone: data.visitorPhone,
        visitorIdCard: data.visitorIdCard || '',
        visitPurpose: data.visitPurpose || '',
        visitTargetUserId: data.visitTargetUserId,
        visitDate: formatDate(data.visitDate),
        visitTimeStart: formatDateTimeForInput(data.visitTimeStart),
        visitTimeEnd: formatDateTimeForInput(data.visitTimeEnd),
        vehicleInfo: data.vehicleInfo || '',
        accompanyCount: data.accompanyCount || 0,
        remark: data.remark || ''
      }
      showDialog.value = true
    }
  } catch (error) {
    showToast('加载来访登记详情失败：' + error.message, 'error')
  }
}

const handleApprove = (visitor) => {
  currentVisitor.value = visitor
  approveRemark.value = ''
  showApproveDialog.value = true
}

const handleConfirmApprove = async () => {
  if (!currentVisitor.value) {
    return
  }
  
  try {
    await visitorAPI.approveVisitor(currentVisitor.value.id, 1, approveRemark.value)
    showToast('批准成功', 'success')
    closeApproveDialog()
    loadData()
  } catch (error) {
    showToast('批准失败：' + error.message, 'error')
  }
}

const handleReject = (visitor) => {
  currentVisitor.value = visitor
  rejectRemark.value = ''
  showRejectDialog.value = true
}

const handleConfirmReject = async () => {
  if (!currentVisitor.value) {
    return
  }
  
  if (!rejectRemark.value.trim()) {
    showToast('请输入拒绝原因', 'error')
    return
  }
  
  try {
    await visitorAPI.rejectVisitor(currentVisitor.value.id, rejectRemark.value)
    showToast('拒绝成功', 'success')
    closeRejectDialog()
    loadData()
  } catch (error) {
    showToast('拒绝失败：' + error.message, 'error')
  }
}

const handleEntry = (visitor) => {
  currentVisitor.value = visitor
  timeDialogType.value = 'entry'
  timeValue.value = new Date().toISOString().substring(0, 16)
  showTimeDialog.value = true
}

const handleExit = (visitor) => {
  currentVisitor.value = visitor
  timeDialogType.value = 'exit'
  timeValue.value = new Date().toISOString().substring(0, 16)
  showTimeDialog.value = true
}

const handleConfirmTime = async () => {
  if (!currentVisitor.value || !timeValue.value) {
    return
  }
  
  try {
    const timeStr = new Date(timeValue.value).toISOString()
    if (timeDialogType.value === 'entry') {
      await visitorAPI.recordEntry(currentVisitor.value.id, timeStr)
      showToast('登记进入时间成功', 'success')
    } else {
      await visitorAPI.recordExit(currentVisitor.value.id, timeStr)
      showToast('登记离开时间成功', 'success')
    }
    closeTimeDialog()
    loadData()
  } catch (error) {
    showToast('操作失败：' + error.message, 'error')
  }
}

const handleDelete = async (visitor) => {
  if (!confirm(`确定要删除来访登记"${visitor.visitorName}"吗？`)) {
    return
  }
  
  try {
    await visitorAPI.deleteVisitor(visitor.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.visitorName) {
    showToast('请输入来访人姓名', 'error')
    return
  }
  if (!formData.value.visitorPhone) {
    showToast('请输入来访人电话', 'error')
    return
  }
  if (!formData.value.visitPurpose) {
    showToast('请输入来访目的', 'error')
    return
  }
  if (!formData.value.visitDate) {
    showToast('请选择来访日期', 'error')
    return
  }
  
  try {
    const data = { ...formData.value }
    // 处理日期时间格式
    if (data.visitTimeStart) {
      data.visitTimeStart = new Date(data.visitTimeStart).toISOString()
    }
    if (data.visitTimeEnd) {
      data.visitTimeEnd = new Date(data.visitTimeEnd).toISOString()
    }
    if (!data.visitTargetUserId) {
      data.visitTargetUserId = null
    }
    
    if (dialogMode.value === 'create') {
      await visitorAPI.createVisitor(data)
      showToast('创建成功', 'success')
    } else {
      await visitorAPI.updateVisitor(data.id, data)
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

const closeApproveDialog = () => {
  showApproveDialog.value = false
  currentVisitor.value = null
  approveRemark.value = ''
}

const closeRejectDialog = () => {
  showRejectDialog.value = false
  currentVisitor.value = null
  rejectRemark.value = ''
}

const closeTimeDialog = () => {
  showTimeDialog.value = false
  currentVisitor.value = null
  timeValue.value = ''
}
</script>

<style scoped>
.visitor-management-page {
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

.status-pending {
  color: #ff9500;
}

.status-approved {
  color: #0071e3;
}

.status-entered {
  color: #34c759;
}

.status-exited {
  color: #86868b;
}

.status-rejected {
  color: #ff3b30;
}

.btn-edit,
.btn-delete,
.btn-approve,
.btn-reject,
.btn-entry,
.btn-exit {
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

.btn-approve {
  background: #ffffff;
  color: #34c759;
}

.btn-approve:hover {
  background: #f5f5f7;
}

.btn-reject {
  background: #ffffff;
  color: #ff3b30;
}

.btn-reject:hover {
  background: #f5f5f7;
}

.btn-entry {
  background: #ffffff;
  color: #34c759;
}

.btn-entry:hover {
  background: #f5f5f7;
}

.btn-exit {
  background: #ffffff;
  color: #86868b;
}

.btn-exit:hover {
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

.form-actions .btn-reject {
  background: #ff3b30;
  color: white;
  border-color: #ff3b30;
}

.form-actions .btn-reject:hover {
  background: #d32f2f;
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
