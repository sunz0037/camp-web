<template>
  <div class="student-management-page">
    <div class="page-header">
      <h1>学生信息管理</h1>
      <button class="btn-primary" @click="handleCreate">新增学生</button>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>年级：</label>
        <input 
          type="text" 
          v-model="filters.grade" 
          placeholder="如：高中一年级"
          @keyup.enter="loadData"
        />
      </div>
      <div class="filter-group">
        <label>班级：</label>
        <input 
          type="text" 
          v-model="filters.className" 
          placeholder="如：高中一年级1班"
          @keyup.enter="loadData"
        />
      </div>
      <div class="filter-group">
        <label>专业：</label>
        <input 
          type="text" 
          v-model="filters.major" 
          placeholder="如：计算机科学"
          @keyup.enter="loadData"
        />
      </div>
      <div class="filter-group">
        <label>状态：</label>
        <select v-model="filters.status" @change="loadData">
          <option :value="null">全部</option>
          <option :value="0">休学</option>
          <option :value="1">在读</option>
          <option :value="2">毕业</option>
          <option :value="3">退学</option>
        </select>
      </div>
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.keyword" 
          placeholder="搜索学号、姓名..."
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
            <th>学号</th>
            <th>姓名</th>
            <th>年级</th>
            <th>班级</th>
            <th>专业</th>
            <th>性别</th>
            <th>出生日期</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="studentList.length === 0">
            <td colspan="9" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="student in studentList" :key="student.id">
            <td>{{ student.studentNo }}</td>
            <td>{{ getStudentName(student) }}</td>
            <td>{{ student.grade || '-' }}</td>
            <td>{{ student.className || '-' }}</td>
            <td>{{ student.major || '-' }}</td>
            <td>{{ getGenderText(student.gender) }}</td>
            <td>{{ formatDate(student.birthDate) }}</td>
            <td>
              <span :class="getStatusClass(student.status)">
                {{ getStatusText(student.status) }}
              </span>
            </td>
            <td>
              <button class="btn-edit" @click="handleEdit(student)">编辑</button>
              <button class="btn-delete" @click="handleDelete(student)">删除</button>
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
          <h2>{{ dialogMode === 'create' ? '新增学生' : '编辑学生' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>学号 <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="formData.studentNo" 
                  required 
                  placeholder="如：2024001"
                  :readonly="dialogMode === 'edit'"
                  :class="{ 'readonly-field': dialogMode === 'edit' }"
                />
              </div>
              <div class="form-group form-group-half">
                <label>姓名</label>
                <input 
                  type="text" 
                  v-model="formData.realName" 
                  placeholder="学生姓名（创建用户时使用）"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>年级</label>
                <input 
                  type="text" 
                  v-model="formData.grade" 
                  placeholder="如：高中一年级"
                />
              </div>
              <div class="form-group form-group-half">
                <label>班级</label>
                <input 
                  type="text" 
                  v-model="formData.className" 
                  placeholder="如：高中一年级1班"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>专业</label>
                <input 
                  type="text" 
                  v-model="formData.major" 
                  placeholder="如：计算机科学"
                />
              </div>
              <div class="form-group form-group-half">
                <label>用户ID</label>
                <input 
                  type="number" 
                  v-model.number="formData.userId" 
                  placeholder="关联的用户ID（可选，不填则自动创建）"
                />
                <small class="field-hint">如果不填写，系统将自动创建用户账号</small>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>院系</label>
                <input 
                  type="text" 
                  v-model="formData.department" 
                  placeholder="如：计算机学院"
                />
              </div>
              <div class="form-group form-group-half">
                <label>性别</label>
                <select v-model="formData.gender">
                  <option :value="null">请选择</option>
                  <option :value="0">女</option>
                  <option :value="1">男</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>出生日期</label>
                <input 
                  type="date" 
                  v-model="formData.birthDate"
                />
              </div>
              <div class="form-group form-group-half">
                <label>入学日期</label>
                <input 
                  type="date" 
                  v-model="formData.enrollmentDate"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>毕业日期</label>
                <input 
                  type="date" 
                  v-model="formData.graduationDate"
                />
              </div>
              <div class="form-group form-group-half">
                <label>状态 <span class="required">*</span></label>
                <select v-model="formData.status" required>
                  <option :value="0">休学</option>
                  <option :value="1">在读</option>
                  <option :value="2">毕业</option>
                  <option :value="3">退学</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>宿舍</label>
                <input 
                  type="text" 
                  v-model="formData.dormitory" 
                  placeholder="如：1号楼201"
                />
              </div>
              <div class="form-group form-group-half">
                <label>政治面貌</label>
                <select v-model="formData.politicalStatus">
                  <option value="">请选择</option>
                  <option value="群众">群众</option>
                  <option value="团员">团员</option>
                  <option value="党员">党员</option>
                  <option value="预备党员">预备党员</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>国籍</label>
                <input 
                  type="text" 
                  v-model="formData.nationality" 
                  placeholder="默认：中国"
                />
              </div>
            </div>
            <div class="form-group">
              <label>地址</label>
              <textarea 
                v-model="formData.address" 
                rows="2" 
                placeholder="家庭地址"
              ></textarea>
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
import * as studentAPI from '../api/student.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const studentList = ref([])
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
  studentNo: '',
  realName: '',
  userId: null,
  grade: '',
  className: '',
  major: '',
  department: '',
  enrollmentDate: '',
  graduationDate: '',
  dormitory: '',
  address: '',
  politicalStatus: '',
  nationality: '中国',
  gender: null,
  birthDate: '',
  status: 1
})

const filters = ref({
  grade: '',
  className: '',
  major: '',
  status: null,
  keyword: ''
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 获取学生姓名（从用户信息中获取）
const getStudentName = (student) => {
  // 优先使用后端返回的 realName
  if (student.realName) {
    return student.realName
  }
  // 如果没有姓名，使用学号作为备选
  return student.studentNo || '-'
}

// 获取性别文本
const getGenderText = (gender) => {
  if (gender === null || gender === undefined) return '-'
  return gender === 1 ? '男' : '女'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '休学',
    1: '在读',
    2: '毕业',
    3: '退学'
  }
  return statusMap[status] || '未知'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    0: 'status-disabled',
    1: 'status-enabled',
    2: 'status-graduated',
    3: 'status-disabled'
  }
  return classMap[status] || 'status-disabled'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  return date
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await studentAPI.getStudentList({
      page: currentPage.value,
      size: pageSize.value,
      grade: filters.value.grade || undefined,
      className: filters.value.className || undefined,
      major: filters.value.major || undefined,
      keyword: filters.value.keyword || undefined
    })
    
    if (result.code === 200 && result.data) {
      studentList.value = result.data.records || []
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
    studentNo: '',
    realName: '',
    userId: null,
    grade: '',
    className: '',
    major: '',
    department: '',
    enrollmentDate: '',
    graduationDate: '',
    dormitory: '',
    address: '',
    politicalStatus: '',
    nationality: '中国',
    gender: null,
    birthDate: '',
    status: 1
  }
  showDialog.value = true
}

const handleEdit = async (student) => {
  dialogMode.value = 'edit'
  try {
    const result = await studentAPI.getStudentDetail(student.id)
    if (result.code === 200 && result.data) {
      const data = result.data
      formData.value = {
        id: data.id,
        studentNo: data.studentNo || '',
        realName: data.realName || '',
        userId: data.userId,
        grade: data.grade || '',
        className: data.className || '',
        major: data.major || '',
        department: data.department || '',
        enrollmentDate: data.enrollmentDate ? formatDate(data.enrollmentDate) : '',
        graduationDate: data.graduationDate ? formatDate(data.graduationDate) : '',
        dormitory: data.dormitory || '',
        address: data.address || '',
        politicalStatus: data.politicalStatus || '',
        nationality: data.nationality || '中国',
        gender: data.gender,
        birthDate: data.birthDate ? formatDate(data.birthDate) : '',
        status: data.status !== undefined ? data.status : 1
      }
      showDialog.value = true
    }
  } catch (error) {
    showToast('获取学生详情失败：' + error.message, 'error')
  }
}

const handleDelete = async (student) => {
  if (!confirm(`确定要删除学号为"${student.studentNo}"的学生信息吗？`)) {
    return
  }
  
  try {
    await studentAPI.deleteStudent(student.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.studentNo) {
    showToast('请输入学号', 'error')
    return
  }
  
  try {
    const data = { ...formData.value }
    // 处理日期格式
    if (data.enrollmentDate && !data.enrollmentDate.includes('T')) {
      data.enrollmentDate = data.enrollmentDate + 'T00:00:00'
    }
    if (data.graduationDate && !data.graduationDate.includes('T')) {
      data.graduationDate = data.graduationDate + 'T00:00:00'
    }
    if (data.birthDate && !data.birthDate.includes('T')) {
      data.birthDate = data.birthDate + 'T00:00:00'
    }
    
    // 处理空值
    if (!data.grade) data.grade = null
    if (!data.className) data.className = null
    if (!data.major) data.major = null
    if (!data.department) data.department = null
    if (!data.dormitory) data.dormitory = null
    if (!data.address) data.address = null
    if (!data.politicalStatus) data.politicalStatus = null
    if (!data.nationality) data.nationality = '中国'
    if (!data.enrollmentDate) data.enrollmentDate = null
    if (!data.graduationDate) data.graduationDate = null
    if (!data.birthDate) data.birthDate = null
    if (!data.userId) data.userId = null
    if (!data.realName) data.realName = null
    
    if (dialogMode.value === 'create') {
      await studentAPI.createStudent(data)
      showToast('创建成功', 'success')
    } else {
      await studentAPI.updateStudent(data.id, data)
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
.student-management-page {
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
  font-weight: 600;
  color: #1d1d1f;
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

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f5f5f7;
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
  white-space: nowrap;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 150px;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #0071e3;
}

.filter-group button {
  padding: 0.5rem 1rem;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.table-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f5f5f7;
}

.data-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1d1d1f;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #6e6e73;
  border-bottom: 1px solid #f5f5f7;
}

.data-table tbody tr:hover {
  background: #fafafa;
}

.text-center {
  text-align: center;
}

.btn-edit,
.btn-delete {
  padding: 0.375rem 0.75rem;
  margin-right: 0.5rem;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit {
  background: white;
  color: #0071e3;
}

.btn-edit:hover {
  background: #f0f7ff;
  border-color: #0071e3;
}

.btn-delete {
  background: white;
  color: #ff3b30;
}

.btn-delete:hover {
  background: #fff5f5;
  border-color: #ff3b30;
}

.status-enabled {
  color: #34c759;
  font-weight: 500;
}

.status-disabled {
  color: #ff3b30;
  font-weight: 500;
}

.status-graduated {
  color: #0071e3;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background: #f5f5f7;
  border-color: #0071e3;
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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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
  font-weight: 600;
  color: #1d1d1f;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  color: #6e6e73;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.btn-close:hover {
  background: #f5f5f7;
}

.dialog-body {
  padding: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group-half {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
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
  padding: 0.625rem 0.75rem;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0071e3;
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
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-actions button {
  padding: 0.625rem 1.25rem;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-actions button[type="button"] {
  background: white;
  color: #1d1d1f;
}

.form-actions button[type="button"]:hover {
  background: #f5f5f7;
}

.form-actions .btn-primary {
  background: #0071e3;
  color: white;
  border-color: #0071e3;
}

.form-actions .btn-primary:hover {
  background: #0077ed;
}
</style>
