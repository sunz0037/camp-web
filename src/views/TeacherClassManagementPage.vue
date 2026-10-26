<template>
  <div class="teacher-class-management-page bento-page">
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

