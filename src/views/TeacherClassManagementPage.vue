<template>
  <div class="teacher-class-management-page">
    <div class="page-header">
      <h1>教师班级关联管理</h1>
      <button class="btn-primary" @click="handleCreate" :disabled="!selectedTeacherId">新增关联</button>
    </div>

    <!-- 教师选择 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>选择教师：</label>
        <select v-model="selectedTeacherId" @change="loadAssociations" :disabled="loadingTeachers">
          <option :value="null">请选择教师</option>
          <option v-for="teacher in teacherOptions" :key="teacher.id" :value="teacher.id">
            {{ teacher.realName || teacher.username }}（{{ teacher.username }}）
          </option>
        </select>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section" v-if="selectedTeacherId">
      <table class="data-table">
        <thead>
          <tr>
            <th>年级</th>
            <th>班级</th>
            <th>科目</th>
            <th>是否班主任</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="associationList.length === 0">
            <td colspan="6" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="association in associationList" :key="association.id">
            <td>{{ association.grade || '-' }}</td>
            <td>{{ association.className || '-' }}</td>
            <td>{{ association.subject || '-' }}</td>
            <td>{{ association.isClassTeacher === 1 ? '是' : '否' }}</td>
            <td>{{ formatDate(association.createdAt) }}</td>
            <td>
              <button class="btn-delete" @click="handleDelete(association)">删除</button>
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

    <!-- 提示信息 -->
    <div v-else class="empty-state">
      <p>请先选择教师</p>
    </div>

    <!-- 新增对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>新增教师班级关联</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>年级</label>
              <input type="text" v-model="formData.grade" placeholder="年级（如：高中一年级）" />
            </div>
            <div class="form-group">
              <label>班级</label>
              <input type="text" v-model="formData.className" placeholder="班级（如：高中一年级1班）" />
            </div>
            <div class="form-group">
              <label>科目</label>
              <input type="text" v-model="formData.subject" placeholder="科目（如：数学）" />
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="formData.isClassTeacher" :true-value="1" :false-value="0" />
                是否班主任
              </label>
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
import * as teacherClassAPI from '../api/teacherClass.js'
import * as userAPI from '../api/user.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const loadingTeachers = ref(false)
const associationList = ref([])
const teacherOptions = ref([])
const selectedTeacherId = ref(null)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showDialog = ref(false)

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
  grade: '',
  className: '',
  subject: '',
  isClassTeacher: 0
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  return date
}

// 加载教师列表
const loadTeachers = async () => {
  loadingTeachers.value = true
  try {
    const result = await userAPI.getUserList({ page: 1, size: 1000, userType: 2 }) // 2-教职工
    if (result.code === 200 && result.data) {
      teacherOptions.value = result.data.records || []
    }
  } catch (error) {
    showToast('加载教师列表失败：' + error.message, 'error')
  } finally {
    loadingTeachers.value = false
  }
}

// 加载关联列表
const loadAssociations = async () => {
  if (!selectedTeacherId.value) {
    associationList.value = []
    return
  }

  loading.value = true
  try {
    const result = await teacherClassAPI.getTeacherClassList(selectedTeacherId.value, {
      page: currentPage.value,
      size: pageSize.value
    })
    if (result.code === 200 && result.data) {
      associationList.value = result.data.records || []
      total.value = result.data.total || 0
    }
  } catch (error) {
    showToast('加载关联列表失败：' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadAssociations()
  }
}

// 新增
const handleCreate = () => {
  if (!selectedTeacherId.value) {
    showToast('请先选择教师', 'error')
    return
  }

  formData.value = {
    grade: '',
    className: '',
    subject: '',
    isClassTeacher: 0
  }
  showDialog.value = true
}

// 删除
const handleDelete = async (association) => {
  if (!confirm(`确定要删除该关联吗？`)) {
    return
  }

  try {
    await teacherClassAPI.deleteTeacherClass(selectedTeacherId.value, association.id)
    showToast('删除成功', 'success')
    loadAssociations()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    const data = { ...formData.value }
    if (!data.grade) {
      data.grade = null
    }
    if (!data.className) {
      data.className = null
    }
    if (!data.subject) {
      data.subject = null
    }

    await teacherClassAPI.createTeacherClass(selectedTeacherId.value, data)
    showToast('创建成功', 'success')
    closeDialog()
    loadAssociations()
  } catch (error) {
    showToast('操作失败：' + (error.message || '未知错误'), 'error')
  }
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

onMounted(() => {
  loadTeachers()
})
</script>

<style scoped>
.teacher-class-management-page {
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

.btn-primary:hover:not(:disabled) {
  background: #0077ed;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.filter-section {
  background: #fafafa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
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

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 200px;
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

.btn-delete {
  padding: 0.25rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8125rem;
  background: #ffffff;
  color: #d32f2f;
  transition: all 0.2s ease;
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

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6e6e73;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #1d1d1f;
  font-weight: 500;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  box-sizing: border-box;
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
