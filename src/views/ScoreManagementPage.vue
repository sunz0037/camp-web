<template>
  <div class="score-management-page">
    <div class="page-header">
      <h1>考试成绩管理</h1>
      <button class="btn-primary" @click="handleCreate">新增成绩</button>
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
        <label>考试类型：</label>
        <select v-model="filters.examType" @change="loadData">
          <option value="">全部</option>
          <option value="月考">月考</option>
          <option value="期中">期中</option>
          <option value="期末">期末</option>
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
            <th>学生姓名</th>
            <th>科目</th>
            <th>考试类型</th>
            <th>分数</th>
            <th>学分</th>
            <th>绩点</th>
            <th>考试日期</th>
            <th>学期</th>
            <th>学年</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="11" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="scoreList.length === 0">
            <td colspan="11" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="score in scoreList" :key="score.id">
            <td>{{ score.studentNo || '-' }}</td>
            <td>{{ score.studentName || '-' }}</td>
            <td>{{ score.courseName || '-' }}</td>
            <td>{{ score.examType || '-' }}</td>
            <td>{{ score.score !== null && score.score !== undefined ? score.score : '-' }}</td>
            <td>{{ score.credit !== null && score.credit !== undefined ? score.credit : '-' }}</td>
            <td>{{ score.gradePoint !== null && score.gradePoint !== undefined ? score.gradePoint : '-' }}</td>
            <td>{{ formatDate(score.examDate) }}</td>
            <td>{{ score.semester || '-' }}</td>
            <td>{{ score.academicYear || '-' }}</td>
            <td>
              <button class="btn-edit" @click="handleEdit(score)">编辑</button>
              <button class="btn-delete" @click="handleDelete(score)">删除</button>
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
          <h2>{{ dialogMode === 'create' ? '新增成绩' : '编辑成绩' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>学生 <span class="required">*</span></label>
                <select v-model="formData.studentId" required>
                  <option value="">请选择学生</option>
                  <option v-for="student in studentOptions" :key="student.id" :value="student.id">
                    {{ student.studentNo }} - {{ getStudentName(student) }}
                  </option>
                </select>
              </div>
              <div class="form-group form-group-half">
                <label>科目 <span class="required">*</span></label>
                <select v-model="formData.courseId" required>
                  <option value="">请选择科目</option>
                  <option v-for="course in courseOptions" :key="course.id" :value="course.id">
                    {{ course.courseCode }} - {{ course.courseName }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>考试安排</label>
                <select v-model="formData.examScheduleId">
                  <option :value="null">请选择（可选）</option>
                  <option v-for="schedule in examScheduleOptions" :key="schedule.id" :value="schedule.id">
                    {{ schedule.examName }} ({{ formatDate(schedule.examDate) }})
                  </option>
                </select>
              </div>
              <div class="form-group form-group-half">
                <label>考试类型 <span class="required">*</span></label>
                <select v-model="formData.examType" required>
                  <option value="">请选择</option>
                  <option value="月考">月考</option>
                  <option value="期中">期中</option>
                  <option value="期末">期末</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>分数</label>
                <input type="number" v-model.number="formData.score" min="0" max="100" step="0.01" placeholder="如：85.5" />
              </div>
              <div class="form-group form-group-half">
                <label>学分</label>
                <input type="number" v-model.number="formData.credit" min="0" step="0.1" placeholder="如：3.0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>绩点</label>
                <input type="number" v-model.number="formData.gradePoint" min="0" max="4" step="0.01" placeholder="如：3.5" />
              </div>
              <div class="form-group form-group-half">
                <label>考试日期</label>
                <input type="date" v-model="formData.examDate" />
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
              <label>备注</label>
              <textarea v-model="formData.remark" rows="2" placeholder="备注信息"></textarea>
            </div>
            <div class="form-group">
              <label>备注详情</label>
              <textarea v-model="formData.remarkDetail" rows="3" placeholder="备注详情（如考试缺席原因等）"></textarea>
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
import * as scoreAPI from '../api/score.js'
import * as studentAPI from '../api/student.js'
import * as courseAPI from '../api/course.js'
import examScheduleAPI from '../api/examSchedule.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const scoreList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showDialog = ref(false)
const dialogMode = ref('create')

// 下拉选项数据
const studentOptions = ref([])
const courseOptions = ref([])
const examScheduleOptions = ref([])

const formData = ref({
  studentId: null,
  courseId: null,
  examScheduleId: null,
  examType: '',
  score: null,
  credit: null,
  gradePoint: null,
  examDate: '',
  semester: '',
  academicYear: '',
  remark: '',
  remarkDetail: ''
})

const filters = ref({
  semester: '',
  academicYear: '',
  examType: '',
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

// 获取学生姓名（从用户信息中获取）
const getStudentName = (student) => {
  // 如果学生对象有姓名字段，直接返回
  if (student.realName) {
    return student.realName
  }
  // 否则返回学号
  return student.studentNo || '-'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  return date
}

// 加载学生选项
const loadStudentOptions = async () => {
  try {
    const result = await studentAPI.getStudentList({ page: 1, size: 1000 })
    if (result.code === 200 && result.data) {
      studentOptions.value = result.data.records || []
    }
  } catch (error) {
    console.error('加载学生列表失败：', error)
  }
}

// 加载科目选项
const loadCourseOptions = async () => {
  try {
    const result = await courseAPI.getAllEnabledCourses()
    if (result.code === 200 && result.data) {
      courseOptions.value = result.data || []
    }
  } catch (error) {
    console.error('加载科目列表失败：', error)
  }
}

// 加载考试安排选项
const loadExamScheduleOptions = async () => {
  try {
    const result = await examScheduleAPI.list({ page: 1, size: 1000 })
    if (result.code === 200 && result.data) {
      examScheduleOptions.value = result.data.records || []
    }
  } catch (error) {
    console.error('加载考试安排列表失败：', error)
  }
}

onMounted(() => {
  loadStudentOptions()
  loadCourseOptions()
  loadExamScheduleOptions()
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await scoreAPI.getScoreList({
      page: currentPage.value,
      size: pageSize.value,
      semester: filters.value.semester || undefined,
      academicYear: filters.value.academicYear || undefined,
      examType: filters.value.examType || undefined
    })
    
    if (result.code === 200 && result.data) {
      scoreList.value = result.data.records || []
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
    studentId: null,
    courseId: null,
    examScheduleId: null,
    examType: '',
    score: null,
    credit: null,
    gradePoint: null,
    examDate: '',
    semester: '',
    academicYear: '',
    remark: '',
    remarkDetail: ''
  }
  showDialog.value = true
}

const handleEdit = async (score) => {
  dialogMode.value = 'edit'
  try {
    const result = await scoreAPI.getScoreDetail(score.id)
    if (result.code === 200 && result.data) {
      const data = result.data
      formData.value = {
        id: data.id,
        studentId: data.studentId,
        courseId: data.courseId,
        examScheduleId: data.examScheduleId,
        examType: data.examType || '',
        score: data.score,
        credit: data.credit,
        gradePoint: data.gradePoint,
        examDate: formatDate(data.examDate),
        semester: data.semester || '',
        academicYear: data.academicYear || '',
        remark: data.remark || '',
        remarkDetail: data.remarkDetail || ''
      }
      showDialog.value = true
    }
  } catch (error) {
    showToast('加载成绩详情失败：' + error.message, 'error')
  }
}

const handleDelete = async (score) => {
  if (!confirm(`确定要删除这条成绩记录吗？`)) {
    return
  }
  
  try {
    await scoreAPI.deleteScore(score.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.studentId) {
    showToast('请选择学生', 'error')
    return
  }
  if (!formData.value.courseId) {
    showToast('请选择科目', 'error')
    return
  }
  if (!formData.value.examType) {
    showToast('请选择考试类型', 'error')
    return
  }
  
  try {
    const data = { ...formData.value }
    // 处理空值
    if (!data.examScheduleId) {
      data.examScheduleId = null
    }
    if (!data.examDate) {
      data.examDate = null
    } else {
      // 确保日期格式正确
      data.examDate = data.examDate
    }
    
    if (dialogMode.value === 'create') {
      await scoreAPI.createScore(data)
      showToast('创建成功', 'success')
    } else {
      await scoreAPI.updateScore(data.id, data)
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
.score-management-page {
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
