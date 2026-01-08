<template>
  <div class="exam-schedule-management-page">
    <div class="page-header">
      <h1>考试安排管理</h1>
      <button class="btn-primary" @click="handleCreate">新增考试安排</button>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>年级：</label>
          <select v-model="filters.targetGrade" @change="handleSearch" :disabled="loadingGrades">
            <option value="">全部</option>
            <option v-for="grade in gradeOptions" :key="grade" :value="grade">{{ grade }}</option>
          </select>
          <span v-if="loadingGrades" style="margin-left: 0.5rem; color: #6e6e73; font-size: 0.875rem;">加载中...</span>
        </div>
        <div class="filter-item">
          <label>考试类型：</label>
          <select v-model="filters.examType" @change="handleSearch">
            <option value="">全部</option>
            <option value="月考">月考</option>
            <option value="期中">期中</option>
            <option value="期末">期末</option>
          </select>
        </div>
        <div class="filter-item">
          <label>是否公开：</label>
          <select v-model="filters.isPublic" @change="handleSearch">
            <option :value="undefined">全部</option>
            <option :value="true">公开</option>
            <option :value="false">不公开</option>
          </select>
        </div>
        <div class="filter-item">
          <label>状态：</label>
          <select v-model="filters.status" @change="handleSearch">
            <option :value="undefined">全部</option>
            <option :value="1">正常</option>
            <option :value="0">已取消</option>
          </select>
        </div>
        <div class="filter-item">
          <label>关键词：</label>
          <input type="text" v-model="filters.keyword" placeholder="考试名称" @keyup.enter="handleSearch" />
        </div>
        <button class="btn-search" @click="handleSearch">搜索</button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>考试名称</th>
            <th>考试时间</th>
            <th>面向年级</th>
            <th>考试类型</th>
            <th>是否公开</th>
            <th>状态</th>
            <th>创建人</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="loading-cell">加载中...</td>
          </tr>
          <tr v-else-if="examSchedules.length === 0">
            <td colspan="8" class="empty-cell">暂无数据</td>
          </tr>
          <tr v-else v-for="item in examSchedules" :key="item.id">
            <td>{{ item.examName }}</td>
            <td>{{ formatDateTime(item.examDate) }}</td>
            <td>{{ item.targetGrade }}</td>
            <td>{{ item.examType }}</td>
            <td>{{ item.isPublic ? '公开' : '不公开' }}</td>
            <td>
              <span :class="item.status === 1 ? 'status-normal' : 'status-canceled'">
                {{ item.status === 1 ? '正常' : '已取消' }}
              </span>
            </td>
            <td>{{ item.createdByName || '-' }}</td>
            <td>
              <button class="btn-edit" @click="handleEdit(item)">编辑</button>
              <button v-if="item.status === 1" class="btn-cancel" @click="handleCancel(item)">取消</button>
              <button class="btn-delete" @click="handleDelete(item)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页，共 {{ total }} 条</span>
      <button @click="handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
    </div>

    <!-- 新增/编辑对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="handleCloseDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>{{ dialogMode === 'create' ? '新增考试安排' : '编辑考试安排' }}</h2>
          <button class="btn-close" @click="handleCloseDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>考试名称 <span class="required">*</span></label>
            <input type="text" v-model="formData.examName" placeholder="请输入考试名称" />
          </div>
          <div class="form-group">
            <label>考试时间 <span class="required">*</span></label>
            <input type="datetime-local" v-model="formData.examDate" />
          </div>
          <div class="form-group">
            <label>面向年级 <span class="required">*</span></label>
            <select v-model="formData.targetGrade" :disabled="loadingGrades">
              <option value="">请选择</option>
              <option v-for="grade in gradeOptions" :key="grade" :value="grade">{{ grade }}</option>
            </select>
            <span v-if="loadingGrades" style="margin-left: 0.5rem; color: #6e6e73; font-size: 0.875rem;">加载中...</span>
            <span v-if="!loadingGrades && gradeOptions.length === 0" style="margin-left: 0.5rem; color: #ff3b30; font-size: 0.875rem;">暂无可用年级，请先在年级管理中创建年级</span>
          </div>
          <div class="form-group">
            <label>考试类型 <span class="required">*</span></label>
            <select v-model="formData.examType">
              <option value="">请选择</option>
              <option value="月考">月考</option>
              <option value="期中">期中</option>
              <option value="期末">期末</option>
            </select>
          </div>
          <div class="form-group">
            <label>是否公开 <span class="required">*</span></label>
            <select v-model="formData.isPublic">
              <option :value="true">公开（向家长公布成绩）</option>
              <option :value="false">不公开（不向家长公布成绩）</option>
            </select>
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="formData.remark" rows="3" placeholder="请输入备注信息"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="handleCloseDialog">取消</button>
          <button class="btn-primary" @click="handleSubmit">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import examScheduleAPI from '../api/examSchedule.js'
import * as gradeAPI from '../api/grade.js'

// 数据
const loading = ref(false)
const examSchedules = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选条件
const filters = ref({
  targetGrade: '',
  examType: '',
  isPublic: undefined,
  status: undefined,
  keyword: ''
})

// 年级选项（从年级管理API获取）
const gradeOptions = ref([])
const loadingGrades = ref(false)

// 对话框
const showDialog = ref(false)
const dialogMode = ref('create') // 'create' 或 'edit'
const formData = ref({
  examName: '',
  examDate: '',
  targetGrade: '',
  examType: '',
  isPublic: true,
  remark: ''
})
const editingId = ref(null)

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const response = await examScheduleAPI.list({
      page: currentPage.value,
      size: pageSize.value,
      ...filters.value
    })
    
    if (response.data) {
      examSchedules.value = response.data.records || []
      total.value = response.data.total || 0
    }
  } catch (error) {
    console.error('加载考试安排失败:', error)
    alert('加载失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadData()
}

const handleCreate = () => {
  dialogMode.value = 'create'
  formData.value = {
    examName: '',
    examDate: '',
    targetGrade: '',
    examType: '',
    isPublic: true,
    remark: ''
  }
  editingId.value = null
  showDialog.value = true
}

const handleEdit = (item) => {
  dialogMode.value = 'edit'
  editingId.value = item.id
  formData.value = {
    examName: item.examName,
    examDate: formatDateTimeForInput(item.examDate),
    targetGrade: item.targetGrade,
    examType: item.examType,
    isPublic: item.isPublic,
    remark: item.remark || ''
  }
  showDialog.value = true
}

const handleSubmit = async () => {
  // 验证
  if (!formData.value.examName) {
    alert('请输入考试名称')
    return
  }
  if (!formData.value.examDate) {
    alert('请选择考试时间')
    return
  }
  if (!formData.value.targetGrade) {
    alert('请选择面向年级')
    return
  }
  if (!formData.value.examType) {
    alert('请选择考试类型')
    return
  }

  try {
    const data = {
      ...formData.value,
      examDate: new Date(formData.value.examDate).toISOString()
    }

    if (dialogMode.value === 'create') {
      await examScheduleAPI.create(data)
      alert('创建成功')
    } else {
      await examScheduleAPI.update(editingId.value, data)
      alert('更新成功')
    }
    
    handleCloseDialog()
    loadData()
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败：' + error.message)
  }
}

const handleCancel = async (item) => {
  if (!confirm(`确定要取消考试安排"${item.examName}"吗？`)) {
    return
  }
  
  try {
    await examScheduleAPI.cancel(item.id)
    alert('已取消')
    loadData()
  } catch (error) {
    console.error('取消失败:', error)
    alert('取消失败：' + error.message)
  }
}

const handleDelete = async (item) => {
  if (!confirm(`确定要删除考试安排"${item.examName}"吗？`)) {
    return
  }
  
  try {
    await examScheduleAPI.delete(item.id)
    alert('删除成功')
    loadData()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败：' + error.message)
  }
}

const handleCloseDialog = () => {
  showDialog.value = false
  formData.value = {
    examName: '',
    examDate: '',
    targetGrade: '',
    examType: '',
    isPublic: true,
    remark: ''
  }
  editingId.value = null
}

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTimeForInput = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 加载年级列表
const loadGrades = async () => {
  loadingGrades.value = true
  try {
    const response = await gradeAPI.getAllEnabledGrades()
    if (response.code === 200 && response.data) {
      // 将年级数据转换为选项格式，使用gradeName作为显示值和选项值
      gradeOptions.value = response.data.map(grade => grade.gradeName || grade.gradeCode)
    }
  } catch (error) {
    console.error('加载年级列表失败:', error)
    // 如果加载失败，使用空数组，避免页面报错
    gradeOptions.value = []
  } finally {
    loadingGrades.value = false
  }
}

onMounted(() => {
  loadGrades() // 先加载年级列表
  loadData() // 再加载考试安排数据
})
</script>

<style scoped>
.exam-schedule-management-page {
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
  font-size: 1.5rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #000000;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: #333333;
}

.filter-section {
  background: #fafafa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-item label {
  font-size: 0.875rem;
  color: #6e6e73;
  white-space: nowrap;
}

.filter-item select,
.filter-item input {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 120px;
}

.btn-search {
  padding: 0.5rem 1rem;
  background: #000000;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table thead {
  background: #fafafa;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #000000;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #1d1d1f;
}

.data-table tbody tr:hover {
  background: #fafafa;
}

.loading-cell,
.empty-cell {
  text-align: center;
  color: #6e6e73;
  padding: 2rem;
}

.btn-edit,
.btn-cancel,
.btn-delete {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8125rem;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
}

.btn-edit {
  background: white;
  color: #0071e3;
}

.btn-edit:hover {
  background: #f0f8ff;
}

.btn-cancel {
  background: white;
  color: #ff9500;
}

.btn-cancel:hover {
  background: #fff4e6;
}

.btn-delete {
  background: white;
  color: #ff3b30;
}

.btn-delete:hover {
  background: #ffe6e6;
}

.status-normal {
  color: #34c759;
  font-weight: 500;
}

.status-canceled {
  color: #ff3b30;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  background: #fafafa;
}

/* 对话框样式 */
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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6e6e73;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.btn-close:hover {
  background: #f5f5f7;
}

.dialog-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1d1d1f;
}

.required {
  color: #ff3b30;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0071e3;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.dialog-footer .btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #1d1d1f;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9375rem;
}

.dialog-footer .btn-cancel:hover {
  background: #fafafa;
}
</style>

