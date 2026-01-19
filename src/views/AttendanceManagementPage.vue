<template>
  <div class="attendance-management-page">
    <div class="page-header">
      <h1>考勤管理</h1>
    </div>

    <!-- 标签页 -->
    <div class="tabs">
      <button 
        :class="['tab', { active: activeTab === 'class' }]"
        @click="activeTab = 'class'"
      >
        班级每日考勤汇总
      </button>
      <button 
        :class="['tab', { active: activeTab === 'student' }]"
        @click="activeTab = 'student'"
      >
        学生异常考勤记录
      </button>
    </div>

    <!-- 班级每日考勤汇总 -->
    <div v-show="activeTab === 'class'" class="tab-content">
      <div class="section-header">
        <button class="btn-primary" @click="handleCreateClassDaily">新增考勤汇总</button>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <div class="filter-group">
          <label>年级：</label>
          <input 
            type="text" 
            v-model="classFilters.grade" 
            placeholder="如：高中一年级"
            @keyup.enter="loadClassDaily"
          />
        </div>
        <div class="filter-group">
          <label>班级：</label>
          <input 
            type="text" 
            v-model="classFilters.className" 
            placeholder="如：高中一年级1班"
            @keyup.enter="loadClassDaily"
          />
        </div>
        <div class="filter-group">
          <label>考勤日期：</label>
          <input 
            type="date" 
            v-model="classFilters.attendanceDate"
            @change="loadClassDaily"
          />
        </div>
        <div class="filter-group">
          <button @click="loadClassDaily">搜索</button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-section">
        <table class="data-table">
          <thead>
            <tr>
              <th>考勤日期</th>
              <th>年级</th>
              <th>班级</th>
              <th>应到人数</th>
              <th>实到人数</th>
              <th>缺勤人数</th>
              <th>迟到人数</th>
              <th>请假人数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="classLoading">
              <td colspan="9" class="text-center">加载中...</td>
            </tr>
            <tr v-else-if="classDailyList.length === 0">
              <td colspan="9" class="text-center">暂无数据</td>
            </tr>
            <tr v-else v-for="item in classDailyList" :key="item.id">
              <td>{{ formatDate(item.attendanceDate) }}</td>
              <td>{{ item.grade || '-' }}</td>
              <td>{{ item.className || '-' }}</td>
              <td>{{ item.expectedCount || 0 }}</td>
              <td>{{ item.presentCount || 0 }}</td>
              <td>{{ item.absentCount || 0 }}</td>
              <td>{{ item.lateCount || 0 }}</td>
              <td>{{ item.leaveCount || 0 }}</td>
              <td>
                <button class="btn-edit" @click="handleEditClassDaily(item)">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="pagination" v-if="classTotal > 0">
          <button @click="changeClassPage(classCurrentPage - 1)" :disabled="classCurrentPage === 1">上一页</button>
          <span>第 {{ classCurrentPage }} 页，共 {{ classTotalPages }} 页，共 {{ classTotal }} 条</span>
          <button @click="changeClassPage(classCurrentPage + 1)" :disabled="classCurrentPage === classTotalPages">下一页</button>
        </div>
      </div>
    </div>

    <!-- 学生异常考勤记录 -->
    <div v-show="activeTab === 'student'" class="tab-content">
      <div class="section-header">
        <button class="btn-primary" @click="handleCreateStudentRecord">新增异常记录</button>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <div class="filter-group">
          <label>年级：</label>
          <input 
            type="text" 
            v-model="studentFilters.grade" 
            placeholder="如：高中一年级"
            @keyup.enter="loadStudentAttendance"
          />
        </div>
        <div class="filter-group">
          <label>班级：</label>
          <input 
            type="text" 
            v-model="studentFilters.className" 
            placeholder="如：高中一年级1班"
            @keyup.enter="loadStudentAttendance"
          />
        </div>
        <div class="filter-group">
          <label>考勤日期：</label>
          <input 
            type="date" 
            v-model="studentFilters.attendanceDate"
            @change="loadStudentAttendance"
          />
        </div>
        <div class="filter-group">
          <label>状态：</label>
          <select v-model="studentFilters.status" @change="loadStudentAttendance">
            <option :value="null">全部</option>
            <option :value="1">缺勤</option>
            <option :value="2">迟到</option>
            <option :value="3">请假</option>
            <option :value="4">早退</option>
          </select>
        </div>
        <div class="filter-group">
          <button @click="loadStudentAttendance">搜索</button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-section">
        <table class="data-table">
          <thead>
            <tr>
              <th>考勤日期</th>
              <th>年级</th>
              <th>班级</th>
              <th>学生ID</th>
              <th>状态</th>
              <th>原因类型</th>
              <th>原因详情</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="studentLoading">
              <td colspan="8" class="text-center">加载中...</td>
            </tr>
            <tr v-else-if="studentRecordList.length === 0">
              <td colspan="8" class="text-center">暂无数据</td>
            </tr>
            <tr v-else v-for="item in studentRecordList" :key="item.id">
              <td>{{ formatDate(item.attendanceDate) }}</td>
              <td>{{ item.grade || '-' }}</td>
              <td>{{ item.className || '-' }}</td>
              <td>{{ item.studentId || '-' }}</td>
              <td>{{ getStatusText(item.status) }}</td>
              <td>{{ item.reasonType || '-' }}</td>
              <td>{{ item.reasonDetail || '-' }}</td>
              <td>
                <button class="btn-edit" @click="handleEditStudentRecord(item)">编辑</button>
                <button class="btn-delete" @click="handleDeleteStudentRecord(item)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="pagination" v-if="studentTotal > 0">
          <button @click="changeStudentPage(studentCurrentPage - 1)" :disabled="studentCurrentPage === 1">上一页</button>
          <span>第 {{ studentCurrentPage }} 页，共 {{ studentTotalPages }} 页，共 {{ studentTotal }} 条</span>
          <button @click="changeStudentPage(studentCurrentPage + 1)" :disabled="studentCurrentPage === studentTotalPages">下一页</button>
        </div>
      </div>
    </div>

    <!-- 班级考勤汇总对话框 -->
    <div v-if="showClassDialog" class="dialog-overlay" @click="closeClassDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>{{ classDialogMode === 'create' ? '新增考勤汇总' : '编辑考勤汇总' }}</h2>
          <button class="btn-close" @click="closeClassDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmitClassDaily">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>考勤日期 <span class="required">*</span></label>
                <input 
                  type="date" 
                  v-model="classFormData.attendanceDate" 
                  required
                />
              </div>
              <div class="form-group form-group-half">
                <label>年级</label>
                <input 
                  type="text" 
                  v-model="classFormData.grade" 
                  placeholder="如：高中一年级"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>班级</label>
                <input 
                  type="text" 
                  v-model="classFormData.className" 
                  placeholder="如：高中一年级1班"
                />
              </div>
              <div class="form-group form-group-half">
                <label>应到人数 <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model.number="classFormData.expectedCount" 
                  required
                  min="0"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>实到人数 <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model.number="classFormData.presentCount" 
                  required
                  min="0"
                />
              </div>
              <div class="form-group form-group-half">
                <label>缺勤人数</label>
                <input 
                  type="number" 
                  v-model.number="classFormData.absentCount" 
                  min="0"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>迟到人数</label>
                <input 
                  type="number" 
                  v-model.number="classFormData.lateCount" 
                  min="0"
                />
              </div>
              <div class="form-group form-group-half">
                <label>请假人数</label>
                <input 
                  type="number" 
                  v-model.number="classFormData.leaveCount" 
                  min="0"
                />
              </div>
            </div>
            <div class="form-group">
              <label>备注</label>
              <textarea 
                v-model="classFormData.remark" 
                rows="3" 
                placeholder="备注信息"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeClassDialog">取消</button>
              <button type="submit" class="btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 学生异常考勤记录对话框 -->
    <div v-if="showStudentDialog" class="dialog-overlay" @click="closeStudentDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>{{ studentDialogMode === 'create' ? '新增异常记录' : '编辑异常记录' }}</h2>
          <button class="btn-close" @click="closeStudentDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmitStudentRecord">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>考勤日期 <span class="required">*</span></label>
                <input 
                  type="date" 
                  v-model="studentFormData.attendanceDate" 
                  required
                />
              </div>
              <div class="form-group form-group-half">
                <label>学生ID <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model.number="studentFormData.studentId" 
                  required
                  min="1"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>年级</label>
                <input 
                  type="text" 
                  v-model="studentFormData.grade" 
                  placeholder="如：高中一年级"
                />
              </div>
              <div class="form-group form-group-half">
                <label>班级</label>
                <input 
                  type="text" 
                  v-model="studentFormData.className" 
                  placeholder="如：高中一年级1班"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>状态 <span class="required">*</span></label>
                <select v-model="studentFormData.status" required>
                  <option :value="1">缺勤</option>
                  <option :value="2">迟到</option>
                  <option :value="3">请假</option>
                  <option :value="4">早退</option>
                </select>
              </div>
              <div class="form-group form-group-half">
                <label>原因类型</label>
                <input 
                  type="text" 
                  v-model="studentFormData.reasonType" 
                  placeholder="如：生病、参加比赛"
                />
              </div>
            </div>
            <div class="form-group">
              <label>原因详情</label>
              <textarea 
                v-model="studentFormData.reasonDetail" 
                rows="3" 
                placeholder="详细说明"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeStudentDialog">取消</button>
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
import * as attendanceAPI from '../api/attendance.js'
import Toast from '../components/Toast.vue'

// 标签页
const activeTab = ref('class')

// Toast 提示
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
}

// 班级每日考勤汇总
const classLoading = ref(false)
const classDailyList = ref([])
const classTotal = ref(0)
const classCurrentPage = ref(1)
const classPageSize = ref(20)
const classFilters = ref({
  grade: '',
  className: '',
  attendanceDate: ''
})
const showClassDialog = ref(false)
const classDialogMode = ref('create')
const classFormData = ref({
  attendanceDate: '',
  grade: '',
  className: '',
  expectedCount: 0,
  presentCount: 0,
  absentCount: 0,
  lateCount: 0,
  leaveCount: 0,
  remark: ''
})

// 学生异常考勤记录
const studentLoading = ref(false)
const studentRecordList = ref([])
const studentTotal = ref(0)
const studentCurrentPage = ref(1)
const studentPageSize = ref(20)
const studentFilters = ref({
  grade: '',
  className: '',
  attendanceDate: '',
  status: null
})
const showStudentDialog = ref(false)
const studentDialogMode = ref('create')
const studentFormData = ref({
  studentId: null,
  attendanceDate: '',
  grade: '',
  className: '',
  status: 1,
  reasonType: '',
  reasonDetail: ''
})

const classTotalPages = computed(() => Math.ceil(classTotal.value / classPageSize.value))
const studentTotalPages = computed(() => Math.ceil(studentTotal.value / studentPageSize.value))

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  return date
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '缺勤',
    2: '迟到',
    3: '请假',
    4: '早退'
  }
  return statusMap[status] || '未知'
}

// 班级每日考勤汇总方法
const loadClassDaily = async () => {
  classLoading.value = true
  try {
    const result = await attendanceAPI.getClassDailyList({
      page: classCurrentPage.value,
      size: classPageSize.value,
      grade: classFilters.value.grade || undefined,
      className: classFilters.value.className || undefined,
      attendanceDate: classFilters.value.attendanceDate || undefined
    })
    
    if (result.code === 200 && result.data) {
      classDailyList.value = result.data.records || []
      classTotal.value = result.data.total || 0
    }
  } catch (error) {
    showToast('加载数据失败：' + error.message, 'error')
  } finally {
    classLoading.value = false
  }
}

const changeClassPage = (page) => {
  if (page >= 1 && page <= classTotalPages.value) {
    classCurrentPage.value = page
    loadClassDaily()
  }
}

const handleCreateClassDaily = () => {
  classDialogMode.value = 'create'
  classFormData.value = {
    attendanceDate: '',
    grade: '',
    className: '',
    expectedCount: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    leaveCount: 0,
    remark: ''
  }
  showClassDialog.value = true
}

const handleEditClassDaily = (item) => {
  classDialogMode.value = 'edit'
  classFormData.value = {
    id: item.id,
    attendanceDate: formatDate(item.attendanceDate),
    grade: item.grade || '',
    className: item.className || '',
    expectedCount: item.expectedCount || 0,
    presentCount: item.presentCount || 0,
    absentCount: item.absentCount || 0,
    lateCount: item.lateCount || 0,
    leaveCount: item.leaveCount || 0,
    remark: item.remark || ''
  }
  showClassDialog.value = true
}

const handleSubmitClassDaily = async () => {
  try {
    const data = { ...classFormData.value }
    if (data.attendanceDate && !data.attendanceDate.includes('T')) {
      data.attendanceDate = data.attendanceDate + 'T00:00:00'
    }
    
    await attendanceAPI.upsertClassDaily(data)
    showToast('保存成功', 'success')
    closeClassDialog()
    loadClassDaily()
  } catch (error) {
    showToast('保存失败：' + error.message, 'error')
  }
}

const closeClassDialog = () => {
  showClassDialog.value = false
}

// 学生异常考勤记录方法
const loadStudentAttendance = async () => {
  studentLoading.value = true
  try {
    const result = await attendanceAPI.getStudentAttendanceList({
      page: studentCurrentPage.value,
      size: studentPageSize.value,
      grade: studentFilters.value.grade || undefined,
      className: studentFilters.value.className || undefined,
      attendanceDate: studentFilters.value.attendanceDate || undefined,
      status: studentFilters.value.status
    })
    
    if (result.code === 200 && result.data) {
      studentRecordList.value = result.data.records || []
      studentTotal.value = result.data.total || 0
    }
  } catch (error) {
    showToast('加载数据失败：' + error.message, 'error')
  } finally {
    studentLoading.value = false
  }
}

const changeStudentPage = (page) => {
  if (page >= 1 && page <= studentTotalPages.value) {
    studentCurrentPage.value = page
    loadStudentAttendance()
  }
}

const handleCreateStudentRecord = () => {
  studentDialogMode.value = 'create'
  studentFormData.value = {
    studentId: null,
    attendanceDate: '',
    grade: '',
    className: '',
    status: 1,
    reasonType: '',
    reasonDetail: ''
  }
  showStudentDialog.value = true
}

const handleEditStudentRecord = (item) => {
  studentDialogMode.value = 'edit'
  studentFormData.value = {
    id: item.id,
    studentId: item.studentId,
    attendanceDate: formatDate(item.attendanceDate),
    grade: item.grade || '',
    className: item.className || '',
    status: item.status || 1,
    reasonType: item.reasonType || '',
    reasonDetail: item.reasonDetail || ''
  }
  showStudentDialog.value = true
}

const handleDeleteStudentRecord = async (item) => {
  if (!confirm(`确定要删除这条异常考勤记录吗？`)) {
    return
  }
  
  try {
    await attendanceAPI.deleteStudentAttendance(item.id)
    showToast('删除成功', 'success')
    loadStudentAttendance()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

const handleSubmitStudentRecord = async () => {
  try {
    const data = { ...studentFormData.value }
    if (data.attendanceDate && !data.attendanceDate.includes('T')) {
      data.attendanceDate = data.attendanceDate + 'T00:00:00'
    }
    
    if (studentDialogMode.value === 'create') {
      await attendanceAPI.createStudentAttendance(data)
      showToast('创建成功', 'success')
    } else {
      await attendanceAPI.updateStudentAttendance(data.id, data)
      showToast('更新成功', 'success')
    }
    closeStudentDialog()
    loadStudentAttendance()
  } catch (error) {
    showToast('保存失败：' + error.message, 'error')
  }
}

const closeStudentDialog = () => {
  showStudentDialog.value = false
}

onMounted(() => {
  loadClassDaily()
  loadStudentAttendance()
})
</script>

<style scoped>
.attendance-management-page {
  padding: 2rem;
  background: #ffffff;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d1d1f;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6e6e73;
  font-size: 0.9375rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab:hover {
  color: #1d1d1f;
}

.tab.active {
  color: #0071e3;
  border-bottom-color: #0071e3;
  font-weight: 500;
}

.tab-content {
  margin-top: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
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
