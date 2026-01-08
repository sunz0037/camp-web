<template>
  <div class="course-management-page">
    <div class="page-header">
      <h1>科目管理</h1>
      <button class="btn-primary" @click="handleCreate">新增科目</button>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>学期：</label>
        <input type="text" v-model="filters.semester" placeholder="如：2024-2025学年第一学期" @keyup.enter="loadData" />
      </div>
      <div class="filter-group">
        <label>学年：</label>
        <input type="text" v-model="filters.academicYear" placeholder="如：2024-2025" @keyup.enter="loadData" />
      </div>
      <div class="filter-group">
        <label>状态：</label>
        <select v-model="filters.status" @change="loadData">
          <option :value="null">全部</option>
          <option :value="1">已启用</option>
          <option :value="0">未启用</option>
        </select>
      </div>
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.keyword" 
          placeholder="搜索科目名称或代码..."
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
            <th>科目代码</th>
            <th>科目名称</th>
            <th>学分</th>
            <th>科目类型</th>
            <th>开课院系</th>
            <th>授课教师</th>
            <th>学期</th>
            <th>学年</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="10" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="courseList.length === 0">
            <td colspan="10" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="course in courseList" :key="course.id">
            <td>{{ course.courseCode }}</td>
            <td>{{ course.courseName }}</td>
            <td>{{ course.credit }}</td>
            <td>{{ course.courseType || '-' }}</td>
            <td>{{ course.department || '-' }}</td>
            <td>{{ course.teacherName || '-' }}</td>
            <td>{{ course.semester || '-' }}</td>
            <td>{{ course.academicYear || '-' }}</td>
            <td>
              <span :class="course.status === 1 ? 'status-enabled' : 'status-disabled'">
                {{ course.status === 1 ? '已启用' : '未启用' }}
              </span>
            </td>
            <td>
              <button class="btn-edit" @click="handleEdit(course)">编辑</button>
              <button class="btn-delete" @click="handleDelete(course)">删除</button>
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
          <h2>{{ dialogMode === 'create' ? '新增科目' : '编辑科目' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>科目代码 <span class="required">*</span></label>
                <input type="text" v-model="formData.courseCode" required placeholder="如：MATH001" />
              </div>
              <div class="form-group form-group-half">
                <label>科目名称 <span class="required">*</span></label>
                <input type="text" v-model="formData.courseName" required placeholder="如：数学" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>学分 <span class="required">*</span></label>
                <input type="number" v-model.number="formData.credit" required min="0" step="0.1" placeholder="如：3.0" />
              </div>
              <div class="form-group form-group-half">
                <label>科目类型</label>
                <select v-model="formData.courseType">
                  <option value="">请选择</option>
                  <option value="必修">必修</option>
                  <option value="选修">选修</option>
                  <option value="公共课">公共课</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>开课院系</label>
                <input type="text" v-model="formData.department" placeholder="如：数学系" />
              </div>
              <div class="form-group form-group-half">
                <label>授课教师ID</label>
                <input type="number" v-model.number="formData.teacherId" placeholder="教师ID（可选）" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>学期</label>
                <input type="text" v-model="formData.semester" placeholder="如：2024-2025学年第一学期" />
              </div>
              <div class="form-group form-group-half">
                <label>学年</label>
                <input type="text" v-model="formData.academicYear" placeholder="如：2024-2025" />
              </div>
            </div>
            <div class="form-group">
              <label>科目描述</label>
              <textarea v-model="formData.description" rows="3" placeholder="科目描述"></textarea>
            </div>
            <div class="form-group">
              <label>状态 <span class="required">*</span></label>
              <select v-model="formData.status" required>
                <option :value="1">已启用</option>
                <option :value="0">未启用</option>
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
import * as courseAPI from '../api/course.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const courseList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showDialog = ref(false)
const dialogMode = ref('create')
const formData = ref({
  courseCode: '',
  courseName: '',
  credit: 0,
  courseType: '',
  department: '',
  teacherId: null,
  semester: '',
  academicYear: '',
  description: '',
  status: 1
})

const filters = ref({
  semester: '',
  academicYear: '',
  status: null,
  keyword: ''
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

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await courseAPI.getCourseList({
      page: currentPage.value,
      size: pageSize.value,
      semester: filters.value.semester || undefined,
      academicYear: filters.value.academicYear || undefined,
      status: filters.value.status,
      keyword: filters.value.keyword || undefined
    })
    
    if (result.code === 200 && result.data) {
      courseList.value = result.data.records || []
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
    courseCode: '',
    courseName: '',
    credit: 0,
    courseType: '',
    department: '',
    teacherId: null,
    semester: '',
    academicYear: '',
    description: '',
    status: 1
  }
  showDialog.value = true
}

const handleEdit = (course) => {
  dialogMode.value = 'edit'
  formData.value = {
    id: course.id,
    courseCode: course.courseCode,
    courseName: course.courseName,
    credit: course.credit,
    courseType: course.courseType || '',
    department: course.department || '',
    teacherId: course.teacherId,
    semester: course.semester || '',
    academicYear: course.academicYear || '',
    description: course.description || '',
    status: course.status
  }
  showDialog.value = true
}

const handleDelete = async (course) => {
  if (!confirm(`确定要删除科目"${course.courseName}"吗？`)) {
    return
  }
  
  try {
    await courseAPI.deleteCourse(course.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.courseCode) {
    showToast('请输入科目代码', 'error')
    return
  }
  if (!formData.value.courseName) {
    showToast('请输入科目名称', 'error')
    return
  }
  if (!formData.value.credit || formData.value.credit <= 0) {
    showToast('请输入有效的学分', 'error')
    return
  }
  
  try {
    const data = { ...formData.value }
    if (!data.teacherId) {
      data.teacherId = null
    }
    
    if (dialogMode.value === 'create') {
      await courseAPI.createCourse(data)
      showToast('创建成功', 'success')
    } else {
      await courseAPI.updateCourse(data.id, data)
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
.course-management-page {
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

