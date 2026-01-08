<template>
  <div class="class-course-management-page">
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="handleBack">← 返回</button>
        <h1>班级授课科目管理 - {{ className || '未知班级' }}</h1>
      </div>
      <button class="btn-primary" @click="handleAddCourses">添加科目</button>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <table class="data-table">
        <thead>
          <tr>
            <th>科目代码</th>
            <th>科目名称</th>
            <th>科目类型</th>
            <th>授课教师</th>
            <th>学期</th>
            <th>学年</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="classCourses.length === 0">
            <td colspan="8" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="item in classCourses" :key="item.id">
            <td>{{ item.courseCode }}</td>
            <td>{{ item.courseName }}</td>
            <td>{{ item.courseType || '-' }}</td>
            <td>{{ item.teacherName || '-' }}</td>
            <td>{{ item.semester || '-' }}</td>
            <td>{{ item.academicYear || '-' }}</td>
            <td>
              <span :class="item.status === 1 ? 'status-enabled' : 'status-disabled'">
                {{ item.status === 1 ? '已启用' : '未启用' }}
              </span>
            </td>
            <td>
              <button class="btn-edit" @click="handleEdit(item)">编辑</button>
              <button class="btn-delete" @click="handleDelete(item)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加科目对话框 -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="closeAddDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>添加授课科目</h2>
          <button class="btn-close" @click="closeAddDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>选择科目 <span class="required">*</span></label>
            <div class="course-select-container">
              <div v-for="course in availableCourses" :key="course.id" class="course-checkbox-item">
                <label>
                  <input 
                    type="checkbox" 
                    :value="course.id" 
                    v-model="selectedCourseIds"
                  />
                  <span>{{ course.courseCode }} - {{ course.courseName }}</span>
                </label>
              </div>
              <div v-if="availableCourses.length === 0" class="empty-courses">
                暂无可用科目，请先在科目管理中创建科目
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeAddDialog">取消</button>
          <button class="btn-primary" @click="handleSubmitAdd">确定</button>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <div v-if="showEditDialog" class="dialog-overlay" @click="closeEditDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>编辑授课科目</h2>
          <button class="btn-close" @click="closeEditDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <div class="form-group form-group-half">
              <label>科目代码</label>
              <input type="text" :value="editFormData.courseCode" readonly class="readonly-field" />
            </div>
            <div class="form-group form-group-half">
              <label>科目名称</label>
              <input type="text" :value="editFormData.courseName" readonly class="readonly-field" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-half">
              <label>学期</label>
              <input type="text" v-model="editFormData.semester" placeholder="如：2024-2025学年第一学期" />
            </div>
            <div class="form-group form-group-half">
              <label>学年</label>
              <input type="text" v-model="editFormData.academicYear" placeholder="如：2024-2025" />
            </div>
          </div>
          <div class="form-group">
            <label>状态 <span class="required">*</span></label>
            <select v-model="editFormData.status">
              <option :value="1">已启用</option>
              <option :value="0">未启用</option>
            </select>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeEditDialog">取消</button>
          <button class="btn-primary" @click="handleSubmitEdit">确定</button>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as classCourseAPI from '../api/classCourse.js'
import * as courseAPI from '../api/course.js'
import Toast from '../components/Toast.vue'

const route = useRoute()
const router = useRouter()

const classId = ref(null)
const className = ref('')
const loading = ref(false)
const classCourses = ref([])
const availableCourses = ref([])
const selectedCourseIds = ref([])

// 对话框
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const editFormData = ref({
  id: null,
  courseCode: '',
  courseName: '',
  semester: '',
  academicYear: '',
  status: 1
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

// 初始化
onMounted(() => {
  classId.value = route.query.classId ? Number(route.query.classId) : null
  className.value = route.query.className || '未知班级'
  
  if (classId.value) {
    loadData()
    loadAvailableCourses()
  } else {
    showToast('缺少班级ID参数', 'error')
  }
})

// 加载数据
const loadData = async () => {
  if (!classId.value) return
  
  loading.value = true
  try {
    const result = await classCourseAPI.getClassCoursesByClassId(classId.value)
    if (result.code === 200 && result.data) {
      classCourses.value = result.data || []
    }
  } catch (error) {
    showToast('加载数据失败：' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

// 加载可用科目
const loadAvailableCourses = async () => {
  try {
    const result = await courseAPI.getAllEnabledCourses()
    if (result.code === 200 && result.data) {
      availableCourses.value = result.data || []
    }
  } catch (error) {
    console.error('加载科目列表失败:', error)
  }
}

// 返回
const handleBack = () => {
  router.push('/home/classes')
}

// 添加科目
const handleAddCourses = () => {
  selectedCourseIds.value = []
  showAddDialog.value = true
}

const closeAddDialog = () => {
  showAddDialog.value = false
  selectedCourseIds.value = []
}

const handleSubmitAdd = async () => {
  if (selectedCourseIds.value.length === 0) {
    showToast('请至少选择一个科目', 'error')
    return
  }
  
  try {
    await classCourseAPI.batchCreateClassCourses(classId.value, selectedCourseIds.value)
    showToast('添加成功', 'success')
    closeAddDialog()
    loadData()
  } catch (error) {
    showToast('添加失败：' + error.message, 'error')
  }
}

// 编辑
const handleEdit = (item) => {
  editFormData.value = {
    id: item.id,
    courseCode: item.courseCode,
    courseName: item.courseName,
    semester: item.semester || '',
    academicYear: item.academicYear || '',
    status: item.status
  }
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editFormData.value = {
    id: null,
    courseCode: '',
    courseName: '',
    semester: '',
    academicYear: '',
    status: 1
  }
}

const handleSubmitEdit = async () => {
  try {
    await classCourseAPI.updateClassCourse(editFormData.value.id, {
      classId: classId.value,
      courseId: classCourses.value.find(cc => cc.id === editFormData.value.id)?.courseId,
      semester: editFormData.value.semester,
      academicYear: editFormData.value.academicYear,
      status: editFormData.value.status
    })
    showToast('更新成功', 'success')
    closeEditDialog()
    loadData()
  } catch (error) {
    showToast('更新失败：' + error.message, 'error')
  }
}

// 删除
const handleDelete = async (item) => {
  if (!confirm(`确定要删除科目"${item.courseName}"吗？`)) {
    return
  }
  
  try {
    await classCourseAPI.deleteClassCourse(item.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}
</script>

<style scoped>
.class-course-management-page {
  padding: 2rem;
  background: #ffffff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: #f5f5f7;
  color: #1d1d1f;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: #e5e7eb;
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
  max-width: 600px;
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
  margin-bottom: 1rem;
  flex: 1;
}

.form-group-half {
  flex: 0 0 calc(50% - 0.5rem);
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
.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
}

.readonly-field {
  background: #f5f5f7;
  color: #6e6e73;
  cursor: not-allowed;
}

.course-select-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem;
}

.course-checkbox-item {
  padding: 0.5rem;
  border-bottom: 1px solid #f5f5f7;
}

.course-checkbox-item:last-child {
  border-bottom: none;
}

.course-checkbox-item label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.course-checkbox-item input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.empty-courses {
  padding: 1rem;
  text-align: center;
  color: #6e6e73;
  font-size: 0.875rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-primary {
  padding: 0.5rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #ffffff;
  color: #1d1d1f;
}

.btn-cancel:hover {
  background: #f5f5f7;
}

.dialog-footer .btn-primary {
  background: #000000;
  color: white;
  border-color: #000000;
}

.dialog-footer .btn-primary:hover {
  background: #333333;
}
</style>

