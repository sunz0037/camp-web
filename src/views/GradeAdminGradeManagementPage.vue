<template>
  <div class="grade-admin-grade-management-page bento-page">
    <div class="page-header">
      <h1>年级管理员关联管理</h1>
      <button class="btn-primary" @click="handleCreate" :disabled="!selectedAdminId">新增关联</button>
    </div>

    <!-- 年级管理员选择 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>选择年级管理员：</label>
        <select v-model="selectedAdminId" @change="loadAssociations" :disabled="loadingAdmins">
          <option :value="null">请选择年级管理员</option>
          <option v-for="admin in adminOptions" :key="admin.id" :value="admin.id">
            {{ admin.realName || admin.username }}（{{ admin.username }}）
          </option>
        </select>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section" v-if="selectedAdminId">
      <table class="data-table">
        <thead>
          <tr>
            <th>年级</th>
            <th>院系</th>
            <th>描述</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="associationList.length === 0">
            <td colspan="5" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="association in associationList" :key="association.id">
            <td>{{ association.grade || '-' }}</td>
            <td>{{ association.department || '-' }}</td>
            <td>{{ association.description || '-' }}</td>
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
      <p>请先选择年级管理员</p>
    </div>

    <!-- 新增对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>新增年级管理员关联</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>年级</label>
              <input type="text" v-model="formData.grade" placeholder="年级（如：高中一年级）" />
            </div>
            <div class="form-group">
              <label>院系</label>
              <input type="text" v-model="formData.department" placeholder="院系（可选）" />
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="formData.description" rows="3" placeholder="描述（可选）"></textarea>
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
import * as gradeAdminGradeAPI from '../api/gradeAdminGrade.js'
import * as userAPI from '../api/user.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const loadingAdmins = ref(false)
const associationList = ref([])
const adminOptions = ref([])
const selectedAdminId = ref(null)
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
  department: '',
  description: ''
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

// 加载年级管理员列表（用户类型为3的管理员）
const loadAdmins = async () => {
  loadingAdmins.value = true
  try {
    const result = await userAPI.getUserList({ page: 1, size: 1000, userType: 3 }) // 3-管理员
    if (result.code === 200 && result.data) {
      adminOptions.value = result.data.records || []
    }
  } catch (error) {
    showToast('加载年级管理员列表失败：' + error.message, 'error')
  } finally {
    loadingAdmins.value = false
  }
}

// 加载关联列表
const loadAssociations = async () => {
  if (!selectedAdminId.value) {
    associationList.value = []
    return
  }

  loading.value = true
  try {
    const result = await gradeAdminGradeAPI.getGradeAdminGradeList(selectedAdminId.value, {
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
  if (!selectedAdminId.value) {
    showToast('请先选择年级管理员', 'error')
    return
  }

  formData.value = {
    grade: '',
    department: '',
    description: ''
  }
  showDialog.value = true
}

// 删除
const handleDelete = async (association) => {
  if (!confirm(`确定要删除该关联吗？`)) {
    return
  }

  try {
    await gradeAdminGradeAPI.deleteGradeAdminGrade(selectedAdminId.value, association.id)
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
    if (!data.department) {
      data.department = null
    }
    if (!data.description) {
      data.description = null
    }

    await gradeAdminGradeAPI.createGradeAdminGrade(selectedAdminId.value, data)
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
  loadAdmins()
})
</script>

