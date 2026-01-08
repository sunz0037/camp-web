<template>
  <div class="grade-management-page">
    <div class="page-header">
      <h1>年级管理</h1>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>年级类型：</label>
        <select v-model="filters.gradeType">
          <option value="">全部</option>
          <option value="PRIMARY">小学</option>
          <option value="JUNIOR">初中</option>
          <option value="SENIOR">高中</option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态：</label>
        <select v-model="filters.status">
          <option :value="null">全部</option>
          <option :value="1">已启用</option>
          <option :value="0">未启用</option>
        </select>
      </div>
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.keyword" 
          placeholder="搜索年级名称..."
          @keyup.enter
        />
        <button @click="handleSearch">搜索</button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <table class="data-table">
        <thead>
          <tr>
            <th>年级代码</th>
            <th>年级名称</th>
            <th>年级类型</th>
            <th>年级级别</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="filteredGrades.length === 0">
            <td colspan="7" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="item in filteredGrades" :key="item.gradeCode">
            <td class="grade-code-cell">{{ item.gradeCode }}</td>
            <td>{{ item.gradeName }}</td>
            <td>{{ getGradeTypeName(item.gradeType) }}</td>
            <td>{{ item.gradeLevel }}年级</td>
            <td>
              <span :class="item.status === 1 ? 'status-enabled' : 'status-disabled'">
                {{ item.status === 1 ? '已启用' : '未启用' }}
              </span>
            </td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <button class="btn-edit" @click="handleToggleStatus(item)">
                {{ item.status === 1 ? '设为未启用' : '设为已启用' }}
              </button>
              <button class="btn-edit" @click="handleEditDescription(item)">编辑描述</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Toast 提示 -->
    <Toast
      v-model:visible="toastVisible"
      :message="toastMessage"
      :type="toastType"
    />

    <!-- 编辑描述对话框 -->
    <EditDescriptionDialog
      v-model:visible="showDescriptionDialog"
      :grade-name="editingGradeName"
      :description="editingDescription"
      @confirm="handleDescriptionConfirm"
      @cancel="handleDescriptionCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as gradeAPI from '../api/grade.js'
import Toast from '../components/Toast.vue'
import EditDescriptionDialog from '../components/EditDescriptionDialog.vue'

const loading = ref(false)
const gradeList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showDialog = ref(false)
const dialogMode = ref('create')
const formData = ref({
  gradeCode: '',
  gradeName: '',
  gradeType: '',
  gradeLevel: null,
  description: '',
  status: 1
})

const filters = ref({
  gradeType: '',
  status: null,
  keyword: ''
})

// Toast 提示
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// 编辑描述对话框
const showDescriptionDialog = ref(false)
const editingGradeName = ref('')
const editingDescription = ref('')
const editingGradeItem = ref(null)

// 显示 Toast 提示
const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
}

// 预置年级（小学1-6年级，初中1-3年级，高中1-3年级）
const PREDEFINED_GRADES = [
  // 小学
  { gradeType: 'PRIMARY', gradeLevel: 1, gradeCode: 'PRI_001', gradeName: '小学一年级' },
  { gradeType: 'PRIMARY', gradeLevel: 2, gradeCode: 'PRI_002', gradeName: '小学二年级' },
  { gradeType: 'PRIMARY', gradeLevel: 3, gradeCode: 'PRI_003', gradeName: '小学三年级' },
  { gradeType: 'PRIMARY', gradeLevel: 4, gradeCode: 'PRI_004', gradeName: '小学四年级' },
  { gradeType: 'PRIMARY', gradeLevel: 5, gradeCode: 'PRI_005', gradeName: '小学五年级' },
  { gradeType: 'PRIMARY', gradeLevel: 6, gradeCode: 'PRI_006', gradeName: '小学六年级' },
  // 初中
  { gradeType: 'JUNIOR', gradeLevel: 1, gradeCode: 'MID_001', gradeName: '初中一年级' },
  { gradeType: 'JUNIOR', gradeLevel: 2, gradeCode: 'MID_002', gradeName: '初中二年级' },
  { gradeType: 'JUNIOR', gradeLevel: 3, gradeCode: 'MID_003', gradeName: '初中三年级' },
  // 高中
  { gradeType: 'SENIOR', gradeLevel: 1, gradeCode: 'SEN_001', gradeName: '高中一年级' },
  { gradeType: 'SENIOR', gradeLevel: 2, gradeCode: 'SEN_002', gradeName: '高中二年级' },
  { gradeType: 'SENIOR', gradeLevel: 3, gradeCode: 'SEN_003', gradeName: '高中三年级' }
]

// 将数据库中的年级信息与预置年级合并
const mergedGrades = computed(() => {
  const map = new Map()
  gradeList.value.forEach(g => {
    const key = `${g.gradeType}_${g.gradeLevel}`
    map.set(key, g)
  })

  return PREDEFINED_GRADES.map(def => {
    const key = `${def.gradeType}_${def.gradeLevel}`
    const existing = map.get(key)
    return {
      id: existing?.id,
      gradeCode: def.gradeCode,
      gradeName: def.gradeName,
      gradeType: def.gradeType,
      gradeLevel: def.gradeLevel,
      description: existing?.description || '',
      status: existing?.status ?? 0,
      createdAt: existing?.createdAt || null
    }
  })
})

// 应用筛选条件的计算属性
const filteredGrades = computed(() => {
  let result = mergedGrades.value
  
  // 按年级类型筛选
  if (filters.value.gradeType) {
    result = result.filter(item => item.gradeType === filters.value.gradeType)
  }
  
  // 按状态筛选
  if (filters.value.status !== null && filters.value.status !== undefined) {
    result = result.filter(item => item.status === filters.value.status)
  }
  
  // 按关键词筛选（搜索年级名称或代码）
  if (filters.value.keyword && filters.value.keyword.trim()) {
    const keyword = filters.value.keyword.trim().toLowerCase()
    result = result.filter(item => 
      item.gradeName.toLowerCase().includes(keyword) ||
      item.gradeCode.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const availableLevels = computed(() => {
  const type = formData.value.gradeType
  if (type === 'PRIMARY') {
    return [1, 2, 3, 4, 5, 6]
  } else if (type === 'JUNIOR' || type === 'SENIOR') {
    return [1, 2, 3]
  }
  return []
})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await gradeAPI.getGradeList({
      page: 1,
      size: 100,
      gradeType: undefined,
      status: null,
      keyword: undefined
    })
    
    if (result.code === 200 && result.data) {
      gradeList.value = result.data.records || []
      total.value = gradeList.value.length
    }
  } catch (error) {
    showToast('加载数据失败：' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  // 分页已不再使用，保留函数避免报错
  console.warn('分页已禁用，当前页面一次展示所有年级')
}

// 搜索处理（筛选是实时的，通过计算属性filteredGrades自动应用）
const handleSearch = () => {
  // 筛选是实时的，通过计算属性filteredGrades自动应用
  // 这里可以添加额外的搜索逻辑，如果需要的话
}

// 根据预置年级查找已有记录
const findExistingGrade = (item) => {
  return gradeList.value.find(
    g => g.gradeType === item.gradeType && g.gradeLevel === item.gradeLevel
  )
}

// 切换年级已启用/未启用状态（如不存在则创建并设为已启用）
const handleToggleStatus = async (item) => {
  const existing = findExistingGrade(item)
  try {
    if (existing) {
      const payload = {
        ...existing,
        status: existing.status === 1 ? 0 : 1
      }
      await gradeAPI.updateGrade(existing.id, payload)
    } else {
      const payload = {
        gradeCode: item.gradeCode,
        gradeName: item.gradeName,
        gradeType: item.gradeType,
        gradeLevel: item.gradeLevel,
        description: item.description || '',
        status: 1
      }
      await gradeAPI.createGrade(payload)
    }
    await loadData()
    showToast('操作成功', 'success')
  } catch (error) {
    showToast('操作失败：' + error.message, 'error')
  }
}

// 编辑年级描述（打开对话框）
const handleEditDescription = (item) => {
  editingGradeItem.value = item
  editingGradeName.value = item.gradeName
  editingDescription.value = item.description || ''
  showDescriptionDialog.value = true
}

// 确认编辑描述
const handleDescriptionConfirm = async (newDesc) => {
  if (!editingGradeItem.value) {
    return
  }
  
  const item = editingGradeItem.value
  const existing = findExistingGrade(item)
  
  try {
    if (existing) {
      const payload = {
        ...existing,
        description: newDesc
      }
      await gradeAPI.updateGrade(existing.id, payload)
    } else {
      const payload = {
        gradeCode: item.gradeCode,
        gradeName: item.gradeName,
        gradeType: item.gradeType,
        gradeLevel: item.gradeLevel,
        description: newDesc,
        status: 1
      }
      await gradeAPI.createGrade(payload)
    }
    await loadData()
    showToast('保存成功', 'success')
  } catch (error) {
    showToast('保存失败：' + error.message, 'error')
  } finally {
    editingGradeItem.value = null
  }
}

// 取消编辑描述
const handleDescriptionCancel = () => {
  editingGradeItem.value = null
  editingGradeName.value = ''
  editingDescription.value = ''
}

const getGradeTypeName = (type) => {
  const map = {
    'PRIMARY': '小学',
    'JUNIOR': '初中',
    'SENIOR': '高中'
  }
  return map[type] || type
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.grade-management-page {
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

.grade-code-cell {
  color: #9ca3af;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.filter-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
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
.btn-delete {
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
  margin-bottom: 1.5rem;
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
}

.form-group textarea {
  resize: vertical;
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


