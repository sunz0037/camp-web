<template>
  <div class="data-permission-management-page">
    <div class="page-header">
      <h1>数据查询权限管理</h1>
      <button class="btn-primary" @click="handleCreate">新增权限配置</button>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>用户ID：</label>
        <input 
          type="number" 
          v-model.number="filters.userId" 
          placeholder="用户ID"
          @keyup.enter="loadData"
        />
      </div>
      <div class="filter-group">
        <label>角色ID：</label>
        <input 
          type="number" 
          v-model.number="filters.roleId" 
          placeholder="角色ID"
          @keyup.enter="loadData"
        />
      </div>
      <div class="filter-group">
        <label>数据类型：</label>
        <select v-model="filters.dataType" @change="loadData">
          <option :value="null">全部</option>
          <option value="STUDENT">学生</option>
          <option value="SCORE">成绩</option>
          <option value="ATTENDANCE">考勤</option>
          <option value="COURSE">课程</option>
        </select>
      </div>
      <div class="filter-group">
        <button @click="loadData">搜索</button>
        <button @click="resetFilters">重置</button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <table class="data-table">
        <thead>
          <tr>
            <th>用户ID</th>
            <th>角色ID</th>
            <th>数据类型</th>
            <th>查询范围</th>
            <th>范围值</th>
            <th>可导出</th>
            <th>可打印</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="permissionList.length === 0">
            <td colspan="9" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="permission in permissionList" :key="permission.id">
            <td>{{ permission.userId || '-' }}</td>
            <td>{{ permission.roleId || '-' }}</td>
            <td>{{ permission.dataType || '-' }}</td>
            <td>{{ getQueryScopeText(permission.queryScope) }}</td>
            <td>{{ permission.scopeValue || '-' }}</td>
            <td>{{ permission.canExport === 1 ? '是' : '否' }}</td>
            <td>{{ permission.canPrint === 1 ? '是' : '否' }}</td>
            <td>
              <span :class="permission.status === 1 ? 'status-enabled' : 'status-disabled'">
                {{ permission.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <button class="btn-edit" @click="handleEdit(permission)">编辑</button>
              <button class="btn-delete" @click="handleDelete(permission)">删除</button>
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
      <div class="dialog-content dialog-content-large" @click.stop>
        <div class="dialog-header">
          <h2>{{ dialogMode === 'create' ? '新增权限配置' : '编辑权限配置' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>用户ID</label>
                <input type="number" v-model.number="formData.userId" placeholder="用户ID（可选）" />
                <small class="field-hint">用户ID和角色ID至少填写一个</small>
              </div>
              <div class="form-group form-group-half">
                <label>角色ID</label>
                <input type="number" v-model.number="formData.roleId" placeholder="角色ID（可选）" />
              </div>
            </div>
            <div class="form-group">
              <label>数据类型 <span class="required">*</span></label>
              <select v-model="formData.dataType" required>
                <option value="">请选择</option>
                <option value="STUDENT">学生</option>
                <option value="SCORE">成绩</option>
                <option value="ATTENDANCE">考勤</option>
                <option value="COURSE">课程</option>
                <option value="CLASS">班级</option>
                <option value="GRADE">年级</option>
              </select>
            </div>
            <div class="form-group">
              <label>查询范围 <span class="required">*</span></label>
              <select v-model="formData.queryScope" required>
                <option value="">请选择</option>
                <option value="ALL">全部</option>
                <option value="GRADE">年级</option>
                <option value="CLASS">班级</option>
                <option value="SELF">自己</option>
              </select>
            </div>
            <div class="form-group">
              <label>范围值</label>
              <input type="text" v-model="formData.scopeValue" placeholder="范围值（如年级ID、班级ID等）" />
              <small class="field-hint">当查询范围为年级或班级时，填写对应的ID</small>
            </div>
            <div class="form-group">
              <label>字段权限</label>
              <textarea v-model="formData.fieldPermissions" rows="3" placeholder="字段权限配置（JSON格式，可选）"></textarea>
              <small class="field-hint">JSON格式，定义可访问的字段列表</small>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>
                  <input type="checkbox" v-model="formData.canExport" :true-value="1" :false-value="0" />
                  可导出
                </label>
              </div>
              <div class="form-group form-group-half">
                <label>
                  <input type="checkbox" v-model="formData.canPrint" :true-value="1" :false-value="0" />
                  可打印
                </label>
              </div>
            </div>
            <div class="form-group">
              <label>状态 <span class="required">*</span></label>
              <select v-model="formData.status" required>
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
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
import * as dataPermissionAPI from '../api/dataPermission.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const permissionList = ref([])
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
  userId: null,
  roleId: null,
  dataType: '',
  queryScope: '',
  scopeValue: '',
  fieldPermissions: '',
  canExport: 0,
  canPrint: 0,
  status: 1
})

const filters = ref({
  userId: null,
  roleId: null,
  dataType: null
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 获取查询范围文本
const getQueryScopeText = (scope) => {
  const scopeMap = {
    'ALL': '全部',
    'GRADE': '年级',
    'CLASS': '班级',
    'SELF': '自己'
  }
  return scopeMap[scope] || scope || '-'
}

// 重置筛选
const resetFilters = () => {
  filters.value = {
    userId: null,
    roleId: null,
    dataType: null
  }
  loadData()
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await dataPermissionAPI.getDataPermissionList({
      page: currentPage.value,
      size: pageSize.value,
      userId: filters.value.userId || undefined,
      roleId: filters.value.roleId || undefined,
      dataType: filters.value.dataType || undefined
    })
    
    if (result.code === 200 && result.data) {
      permissionList.value = result.data.records || []
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
    userId: null,
    roleId: null,
    dataType: '',
    queryScope: '',
    scopeValue: '',
    fieldPermissions: '',
    canExport: 0,
    canPrint: 0,
    status: 1
  }
  showDialog.value = true
}

const handleEdit = async (permission) => {
  dialogMode.value = 'edit'
  try {
    const result = await dataPermissionAPI.getDataPermissionDetail(permission.id)
    if (result.code === 200 && result.data) {
      const data = result.data
      formData.value = {
        id: data.id,
        userId: data.userId,
        roleId: data.roleId,
        dataType: data.dataType || '',
        queryScope: data.queryScope || '',
        scopeValue: data.scopeValue || '',
        fieldPermissions: data.fieldPermissions || '',
        canExport: data.canExport || 0,
        canPrint: data.canPrint || 0,
        status: data.status !== undefined ? data.status : 1
      }
      showDialog.value = true
    }
  } catch (error) {
    showToast('获取权限详情失败：' + error.message, 'error')
  }
}

const handleDelete = async (permission) => {
  if (!confirm(`确定要删除该权限配置吗？`)) {
    return
  }
  
  try {
    await dataPermissionAPI.deleteDataPermission(permission.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.userId && !formData.value.roleId) {
    showToast('用户ID和角色ID至少填写一个', 'error')
    return
  }
  if (!formData.value.dataType) {
    showToast('请选择数据类型', 'error')
    return
  }
  if (!formData.value.queryScope) {
    showToast('请选择查询范围', 'error')
    return
  }
  
  try {
    const data = { ...formData.value }
    if (!data.userId) {
      data.userId = null
    }
    if (!data.roleId) {
      data.roleId = null
    }
    if (!data.scopeValue) {
      data.scopeValue = null
    }
    if (!data.fieldPermissions) {
      data.fieldPermissions = null
    }
    
    if (dialogMode.value === 'create') {
      await dataPermissionAPI.createDataPermission(data)
      showToast('创建成功', 'success')
    } else {
      await dataPermissionAPI.updateDataPermission(data.id, data)
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
.data-permission-management-page {
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
  white-space: nowrap;
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
  font-size: 0.875rem;
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
  color: #34c759;
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
  max-width: 600px;
  display: flex;
  flex-direction: column;
}

.dialog-content-large {
  max-width: 800px;
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
  max-height: 70vh;
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
  color: #ff3b30;
}

.field-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6e6e73;
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

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
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
