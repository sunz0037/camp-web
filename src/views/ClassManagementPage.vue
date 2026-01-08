<template>
  <div class="class-management-page">
    <div class="page-header">
      <h1>班级管理</h1>
      <button class="btn-primary" @click="handleCreate">新增班级</button>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>年级：</label>
        <select v-model="filters.gradeId" @change="loadData">
          <option value="">全部</option>
          <option v-for="grade in allGrades" :key="grade.id" :value="grade.id">
            {{ grade.gradeName }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>年级类型：</label>
        <select v-model="filters.gradeType" @change="loadData">
          <option value="">全部</option>
          <option value="PRIMARY">小学</option>
          <option value="JUNIOR">初中</option>
          <option value="SENIOR">高中</option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态：</label>
        <select v-model="filters.status" @change="loadData">
          <option :value="null">全部</option>
          <option :value="1">启用</option>
          <option :value="0">停用</option>
        </select>
      </div>
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.keyword" 
          placeholder="搜索班级名称..."
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
            <th>班级代码</th>
            <th>班级名称</th>
            <th>年级</th>
            <th>班级序号</th>
            <th>容量</th>
            <th>当前人数</th>
            <th>班主任</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="classList.length === 0">
            <td colspan="9" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="classItem in classList" :key="classItem.id">
            <td>{{ classItem.classCode }}</td>
            <td>{{ classItem.className }}</td>
            <td>{{ classItem.gradeName }}</td>
            <td>{{ classItem.classNumber }}班</td>
            <td>{{ classItem.capacity }}</td>
            <td>{{ classItem.currentCount }}</td>
            <td>{{ classItem.headTeacherName || '-' }}</td>
            <td>
              <span :class="classItem.status === 1 ? 'status-enabled' : 'status-disabled'">
                {{ classItem.status === 1 ? '启用' : '停用' }}
              </span>
            </td>
            <td>
              <button class="btn-edit" @click="handleEdit(classItem)">编辑</button>
              <button class="btn-edit" @click="handleManageCourses(classItem)">授课科目</button>
              <button class="btn-delete" @click="handleDelete(classItem)">删除</button>
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
          <h2>{{ dialogMode === 'create' ? '新增班级' : '编辑班级' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>年级 <span class="required">*</span></label>
                <select v-model="formData.gradeId" required @change="watchGradeChange">
                  <option value="">请选择</option>
                  <option v-for="grade in allGrades" :key="grade.id" :value="grade.id">
                    {{ grade.gradeName }}
                  </option>
                </select>
              </div>
              <div class="form-group form-group-half">
                <label>班级序号 <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model.number="formData.classNumber" 
                  required 
                  min="1" 
                  placeholder="如：1" 
                  @input="watchGradeAndNumber"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>班级代码 <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="formData.classCode" 
                  required 
                  placeholder="自动生成，如：P1_C001" 
                  :readonly="autoGenerateCode"
                  :class="{ 'readonly-field': autoGenerateCode }"
                />
                <small v-if="autoGenerateCode" class="field-hint">根据年级和班级序号自动生成</small>
              </div>
              <div class="form-group form-group-half">
                <label>班级名称 <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="formData.className" 
                  required 
                  placeholder="自动生成，如：高中一年级1班" 
                  :readonly="autoGenerateCode"
                  :class="{ 'readonly-field': autoGenerateCode }"
                />
                <small v-if="autoGenerateCode" class="field-hint">根据年级和班级序号自动生成</small>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>班级容量</label>
                <input type="number" v-model.number="formData.capacity" min="1" placeholder="默认50" />
              </div>
              <div class="form-group form-group-half">
                <label>当前人数</label>
                <input type="number" v-model.number="formData.currentCount" min="0" placeholder="默认0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>班主任</label>
                <input type="text" v-model="formData.headTeacherId" placeholder="班主任ID（可选）" />
              </div>
              <div class="form-group form-group-half">
                <label>状态 <span class="required">*</span></label>
                <select v-model="formData.status" required>
                  <option :value="1">启用</option>
                  <option :value="0">停用</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="formData.description" rows="2" placeholder="班级描述"></textarea>
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
import { useRouter } from 'vue-router'
import * as classAPI from '../api/class.js'
import * as gradeAPI from '../api/grade.js'
import Toast from '../components/Toast.vue'

const router = useRouter()

const loading = ref(false)
const classList = ref([])
const allGrades = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showDialog = ref(false)
const dialogMode = ref('create')
const autoGenerateCode = ref(true) // 是否自动生成班级代码

// Toast 提示
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('success') // 'success', 'error', 'info'

// 显示 Toast 提示
const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
}

const formData = ref({
  gradeId: null,
  classCode: '',
  className: '',
  classNumber: null,
  capacity: 50,
  currentCount: 0,
  headTeacherId: null,
  description: '',
  status: 1
})

const filters = ref({
  gradeId: '',
  gradeType: '',
  status: null,
  keyword: ''
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 根据年级和班级序号生成班级代码
const generateClassCode = (gradeId, classNumber) => {
  if (!gradeId || !classNumber) {
    return ''
  }
  
  const grade = allGrades.value.find(g => g.id === gradeId)
  if (!grade) {
    return ''
  }
  
  // P代表小学（PRIMARY），M代表初中（JUNIOR），H代表高中（SENIOR）
  let prefix = ''
  if (grade.gradeType === 'PRIMARY') {
    prefix = 'P'
  } else if (grade.gradeType === 'JUNIOR') {
    prefix = 'M'
  } else if (grade.gradeType === 'SENIOR') {
    prefix = 'H'
  } else {
    return ''
  }
  
  // 格式：P1_C001, M1_C001, H1_C001
  const gradeLevel = grade.gradeLevel || 1
  const classNum = String(classNumber).padStart(3, '0')
  return `${prefix}${gradeLevel}_C${classNum}`
}

// 根据年级和班级序号生成班级名称
const generateClassName = (gradeId, classNumber) => {
  if (!gradeId || !classNumber) {
    return ''
  }
  
  const grade = allGrades.value.find(g => g.id === gradeId)
  if (!grade) {
    return ''
  }
  
  // 年级类型前缀
  let typePrefix = ''
  if (grade.gradeType === 'PRIMARY') {
    typePrefix = '小学'
  } else if (grade.gradeType === 'JUNIOR') {
    typePrefix = '初中'
  } else if (grade.gradeType === 'SENIOR') {
    typePrefix = '高中'
  } else {
    return ''
  }
  
  // 年级级别对应的中文
  const levelMap = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六'
  }
  
  const levelText = levelMap[grade.gradeLevel] || grade.gradeLevel
  return `${typePrefix}${levelText}年级${classNumber}班`
}

// 加载指定年级下的班级，用于计算默认序号
const loadClassesByGrade = async (gradeId) => {
  if (!gradeId) {
    return []
  }
  
  try {
    const result = await classAPI.getClassesByGradeId(gradeId)
    if (result.code === 200 && result.data) {
      return result.data || []
    }
    return []
  } catch (error) {
    console.error('加载年级班级列表失败：', error)
    return []
  }
}

// 监听年级变化，自动设置默认班级序号和名称
const watchGradeChange = async () => {
  if (!formData.value.gradeId || dialogMode.value !== 'create') {
    return
  }
  
  // 加载该年级下的所有班级
  const existingClasses = await loadClassesByGrade(formData.value.gradeId)
  
  if (existingClasses.length === 0) {
    // 如果该年级下无班级，默认序号为1
    formData.value.classNumber = 1
    formData.value.className = generateClassName(formData.value.gradeId, 1)
    formData.value.classCode = generateClassCode(formData.value.gradeId, 1)
  } else {
    // 如果已有班级，找到最大的班级序号
    const maxClassNumber = Math.max(...existingClasses.map(c => c.classNumber || 0))
    const nextClassNumber = maxClassNumber + 1
    
    // 检查序号是否已被使用（理论上不应该，但为了安全起见）
    const isNumberUsed = existingClasses.some(c => c.classNumber === nextClassNumber)
    
    if (isNumberUsed) {
      // 如果序号已被使用，提示用户并清空，让用户手动输入
      showToast(`该年级下班级序号 ${nextClassNumber} 已被使用，请手动输入其他序号`, 'error')
      formData.value.classNumber = null
      formData.value.className = ''
      formData.value.classCode = ''
    } else {
      // 设置默认序号和名称
      formData.value.classNumber = nextClassNumber
      formData.value.className = generateClassName(formData.value.gradeId, nextClassNumber)
      formData.value.classCode = generateClassCode(formData.value.gradeId, nextClassNumber)
      // 使用 Toast 提示用户，而不是阻塞式的 confirm
      showToast(`已自动设置班级序号为 ${nextClassNumber}，班级名称为"${formData.value.className}"，您可以直接保存或手动修改`, 'info')
    }
  }
}

// 监听年级和班级序号变化，自动生成班级代码和名称
const watchGradeAndNumber = () => {
  if (autoGenerateCode.value && formData.value.gradeId && formData.value.classNumber) {
    formData.value.classCode = generateClassCode(formData.value.gradeId, formData.value.classNumber)
    // 如果班级名称为空或者是自动生成的格式，则自动更新
    if (!formData.value.className || formData.value.className.match(/^[小学初中高中][一二三四五六]年级\d+班$/)) {
      formData.value.className = generateClassName(formData.value.gradeId, formData.value.classNumber)
    }
  }
}

onMounted(() => {
  loadGrades()
  loadData()
})

const loadGrades = async () => {
  try {
    const result = await gradeAPI.getAllEnabledGrades()
    if (result.code === 200 && result.data) {
      allGrades.value = result.data || []
    }
  } catch (error) {
    console.error('加载年级列表失败：', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const result = await classAPI.getClassList({
      page: currentPage.value,
      size: pageSize.value,
      gradeId: filters.value.gradeId || undefined,
      gradeType: filters.value.gradeType || undefined,
      status: filters.value.status,
      keyword: filters.value.keyword || undefined
    })
    
    if (result.code === 200 && result.data) {
      classList.value = result.data.records || []
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
  autoGenerateCode.value = true
  formData.value = {
    gradeId: null,
    classCode: '',
    className: '',
    classNumber: null,
    capacity: 50,
    currentCount: 0,
    headTeacherId: null,
    description: '',
    status: 1
  }
  showDialog.value = true
  // 注意：年级选择后会自动触发 watchGradeChange，设置默认值
}

const handleEdit = (classItem) => {
  dialogMode.value = 'edit'
  autoGenerateCode.value = false // 编辑模式下不自动生成，允许手动修改
  formData.value = {
    id: classItem.id,
    gradeId: classItem.gradeId,
    classCode: classItem.classCode,
    className: classItem.className,
    classNumber: classItem.classNumber,
    capacity: classItem.capacity,
    currentCount: classItem.currentCount,
    headTeacherId: classItem.headTeacherId,
    description: classItem.description || '',
    status: classItem.status
  }
  showDialog.value = true
}

const handleManageCourses = (classItem) => {
  // 跳转到班级授课科目管理页面，传递班级ID
  router.push({
    path: '/home/class-courses',
    query: { classId: classItem.id, className: classItem.className }
  })
}

const handleDelete = async (classItem) => {
  if (!confirm(`确定要删除班级"${classItem.className}"吗？`)) {
    return
  }
  
  try {
    await classAPI.deleteClass(classItem.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

// 检查班级代码和班级序号唯一性
const checkUniqueness = async () => {
  const errors = []
  
  // 检查班级代码唯一性
  if (formData.value.classCode) {
    try {
      const result = await classAPI.getClassList({
        page: 1,
        size: 1000
      })
      if (result.code === 200 && result.data) {
        const existing = result.data.records.find(c => 
          c.classCode === formData.value.classCode && 
          (dialogMode.value === 'create' || c.id !== formData.value.id)
        )
        if (existing) {
          errors.push('班级代码已存在')
        }
      }
    } catch (error) {
      console.error('检查班级代码唯一性失败:', error)
    }
  }
  
  // 检查同年级同班级序号唯一性
  if (formData.value.gradeId && formData.value.classNumber) {
    try {
      const existingClasses = await loadClassesByGrade(formData.value.gradeId)
      const existing = existingClasses.find(c => 
        c.classNumber === formData.value.classNumber &&
        (dialogMode.value === 'create' || c.id !== formData.value.id)
      )
      if (existing) {
        errors.push(`该年级下班级序号 ${formData.value.classNumber} 已被使用，请使用其他序号`)
      }
    } catch (error) {
      console.error('检查班级序号唯一性失败:', error)
    }
  }
  
  return errors
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.gradeId) {
    showToast('请选择年级', 'error')
    return
  }
  if (!formData.value.classNumber) {
    showToast('请输入班级序号', 'error')
    return
  }
  if (!formData.value.classCode) {
    showToast('班级代码不能为空', 'error')
    return
  }
  if (!formData.value.className) {
    showToast('请输入班级名称', 'error')
    return
  }
  
  // 检查唯一性
  const uniquenessErrors = await checkUniqueness()
  if (uniquenessErrors.length > 0) {
    showToast(uniquenessErrors.join('；'), 'error')
    return
  }
  
  try {
    const data = { ...formData.value }
    if (!data.headTeacherId) {
      data.headTeacherId = null
    }
    
    if (dialogMode.value === 'create') {
      await classAPI.createClass(data)
      showToast('创建成功', 'success')
    } else {
      await classAPI.updateClass(data.id, data)
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
.class-management-page {
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
  min-height: 60px;
}

.readonly-field {
  background: #f5f5f7;
  color: #6e6e73;
  cursor: not-allowed;
}

.field-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6e6e73;
  font-style: italic;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-group-half {
    flex: 1 1 100%;
  }
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

